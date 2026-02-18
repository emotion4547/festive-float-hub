import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Edit, Trash2, Package, Eye, EyeOff, Copy } from "lucide-react";
import { ExcelImport } from "@/components/admin/ExcelImport";
import { CategoryManager } from "@/components/admin/CategoryManager";

interface Product {
  id: string;
  name: string;
  price: number;
  old_price: number | null;
  in_stock: boolean;
  is_new: boolean;
  is_hit: boolean;
  is_visible: boolean;
  images: string[] | null;
  created_at: string;
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, old_price, in_stock, is_new, is_hit, is_visible, images, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts((data || []).map(p => ({ ...p, is_visible: p.is_visible ?? true })));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить этот товар?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Товар удалён" });
      fetchProducts();
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить товар" });
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_visible: !product.is_visible })
        .eq("id", product.id);

      if (error) throw error;

      toast({ title: product.is_visible ? "Товар скрыт с сайта" : "Товар снова виден на сайте" });
      fetchProducts();
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось изменить видимость" });
    }
  };

  const handleCopyProduct = async (product: Product) => {
    // Fetch full product data for copy
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", product.id)
        .single();

      if (error) throw error;

      // Store in sessionStorage to pass to the new product form
      sessionStorage.setItem("copyProductData", JSON.stringify(data));
      navigate("/admin/products/new?copy=true");
    } catch (error) {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось скопировать товар" });
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case "date-asc":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name, "ru"));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name, "ru"));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "date-desc":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [products, searchQuery, sortBy]);

  if (loading) {
    return (
      <AdminLayout title="Товары">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const ActionButtons = ({ product }: { product: Product }) => (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleToggleVisibility(product)}
          >
            {product.is_visible ? (
              <Eye className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeOff className="h-4 w-4 text-orange-500" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {product.is_visible ? "Скрыть с сайта" : "Показать на сайте"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleCopyProduct(product)}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Копировать товар</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to={`/admin/products/${product.id}`}>
              <Edit className="h-4 w-4" />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Редактировать</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleDelete(product.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Удалить</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <AdminLayout title="Товары">
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="import">Импорт из Excel</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Сначала новые</SelectItem>
                  <SelectItem value="date-asc">Сначала старые</SelectItem>
                  <SelectItem value="name-asc">от А до Я</SelectItem>
                  <SelectItem value="name-desc">от Я до А</SelectItem>
                  <SelectItem value="price-asc">Сначала дешевле</SelectItem>
                  <SelectItem value="price-desc">Сначала дороже</SelectItem>
                </SelectContent>
              </Select>
              <Button asChild>
                <Link to="/admin/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить товар
                </Link>
              </Button>
            </div>
          </div>

          {/* Products Table */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Товары не найдены</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Cards View */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className={`overflow-hidden ${!product.is_visible ? "opacity-60" : ""}`}>
                    <CardContent className="p-3">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          {!product.is_visible && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <EyeOff className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-2 mb-1">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-sm">
                              {Number(product.price).toLocaleString("ru-RU")} ₽
                            </span>
                            {product.old_price && (
                              <span className="text-xs text-muted-foreground line-through">
                                {Number(product.old_price).toLocaleString("ru-RU")} ₽
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge
                              variant={product.in_stock ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {product.in_stock ? "В наличии" : "Нет"}
                            </Badge>
                            {!product.is_visible && (
                              <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">
                                Скрыт
                              </Badge>
                            )}
                            {product.is_new && <Badge variant="outline" className="text-xs">Новое</Badge>}
                            {product.is_hit && <Badge variant="outline" className="text-xs">Хит</Badge>}
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <ActionButtons product={product} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <Card className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Фото</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Метки</TableHead>
                        <TableHead className="w-40">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className={!product.is_visible ? "opacity-60" : ""}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              {!product.is_visible && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                  <EyeOff className="h-3 w-3 text-white" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs truncate">
                            {product.name}
                          </TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium">
                                {Number(product.price).toLocaleString("ru-RU")} ₽
                              </span>
                              {product.old_price && (
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  {Number(product.old_price).toLocaleString("ru-RU")} ₽
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge variant={product.in_stock ? "default" : "secondary"}>
                                {product.in_stock ? "В наличии" : "Нет в наличии"}
                              </Badge>
                              {!product.is_visible && (
                                <Badge variant="outline" className="text-xs text-orange-500 border-orange-300 w-fit">
                                  Скрыт
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {product.is_new && <Badge variant="outline" className="text-xs">Новинка</Badge>}
                              {product.is_hit && <Badge variant="outline" className="text-xs">Хит</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ActionButtons product={product} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        {/* Excel Import Tab */}
        <TabsContent value="import">
          <ExcelImport onImportComplete={fetchProducts} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
