import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Plus, Edit, Trash2, Package, Eye, EyeOff, Copy, X, CheckSquare, ChevronLeft, ChevronRight } from "lucide-react";
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
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const PAGE_SIZE = 50;

// Memoized table row — only re-renders when its own props change
const ProductTableRow = memo(({ 
  product, 
  page,
  isSelected, 
  onToggleSelect, 
  onToggleVisibility, 
  onCopy, 
  onDelete 
}: {
  product: Product;
  page: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleVisibility: (product: Product) => void;
  onCopy: (product: Product) => void;
  onDelete: (id: string) => void;
}) => (
  <TableRow className={`${!product.is_visible ? "opacity-60" : ""} ${isSelected ? "bg-primary/5" : ""}`}>
    <TableCell onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(product.id)}
        className="h-4 w-4 rounded border-primary accent-primary cursor-pointer"
      />
    </TableCell>
    <TableCell>
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted relative">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
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
    <TableCell className="font-medium max-w-xs truncate">{product.name}</TableCell>
    <TableCell>
      <div>
        <span className="font-medium">{Number(product.price).toLocaleString("ru-RU")} ₽</span>
        {product.old_price && (
          <span className="text-sm text-muted-foreground line-through ml-2">{Number(product.old_price).toLocaleString("ru-RU")} ₽</span>
        )}
      </div>
    </TableCell>
    <TableCell>
      <div className="flex flex-col gap-1">
        <Badge variant={product.in_stock ? "default" : "secondary"} className="whitespace-nowrap">{product.in_stock ? "В наличии" : "Нет в наличии"}</Badge>
        {!product.is_visible && <Badge variant="outline" className="text-xs text-orange-500 border-orange-300 w-fit">Скрыт</Badge>}
      </div>
    </TableCell>
    <TableCell>
      <div className="flex gap-1">
        {product.is_new && <Badge variant="outline" className="text-xs">Новинка</Badge>}
        {product.is_hit && <Badge variant="outline" className="text-xs">Хит</Badge>}
      </div>
    </TableCell>
    <TableCell>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleVisibility(product)} title={product.is_visible ? "Скрыть" : "Показать"}>
          {product.is_visible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-orange-500" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(product)} title="Копировать">
          <Copy className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link to={`/admin/products/${product.id}?page=${page}`} title="Редактировать"><Edit className="h-4 w-4" /></Link>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(product.id)} title="Удалить">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
));
ProductTableRow.displayName = "ProductTableRow";

// Memoized mobile card
const ProductMobileCard = memo(({
  product,
  page,
  isSelected,
  onToggleSelect,
  onToggleVisibility,
  onCopy,
  onDelete
}: {
  product: Product;
  page: number;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleVisibility: (product: Product) => void;
  onCopy: (product: Product) => void;
  onDelete: (id: string) => void;
}) => (
  <Card className={`overflow-hidden ${!product.is_visible ? "opacity-60" : ""} ${isSelected ? "ring-2 ring-primary" : ""}`}>
    <CardContent className="p-3">
      <div className="flex gap-3">
        <div className="flex items-start pt-1" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(product.id)}
            className="h-4 w-4 rounded border-primary accent-primary cursor-pointer"
          />
        </div>
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
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
          <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm">{Number(product.price).toLocaleString("ru-RU")} ₽</span>
            {product.old_price && (
              <span className="text-xs text-muted-foreground line-through">{Number(product.old_price).toLocaleString("ru-RU")} ₽</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant={product.in_stock ? "default" : "secondary"} className="text-xs">{product.in_stock ? "В наличии" : "Нет"}</Badge>
            {!product.is_visible && <Badge variant="outline" className="text-xs text-orange-500 border-orange-300">Скрыт</Badge>}
            {product.is_new && <Badge variant="outline" className="text-xs">Новое</Badge>}
            {product.is_hit && <Badge variant="outline" className="text-xs">Хит</Badge>}
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleVisibility(product)}>
              {product.is_visible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-orange-500" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCopy(product)}>
              <Copy className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link to={`/admin/products/${product.id}?page=${page}`}><Edit className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDelete(product.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
));
ProductMobileCard.displayName = "ProductMobileCard";

export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "products";
  const setTab = (v: string) => setSearchParams({ tab: v, page: "0" }, { replace: true });
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const page = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "0");
    return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 0;
  }, [searchParams]);

  const setPage = useCallback((nextPage: number) => {
    const normalized = Math.max(0, Math.floor(nextPage));
    setSearchParams((prev) => {
      const currentPage = Number(prev.get("page") ?? "0");
      const currentTab = prev.get("tab") || "products";

      if (currentPage === normalized && currentTab === "products") {
        return prev;
      }

      const next = new URLSearchParams(prev);
      next.set("tab", "products");
      next.set("page", String(normalized));
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const previousFilters = useRef({ searchQuery: "", sortBy: "date-desc" });

  useEffect(() => {
    const prev = previousFilters.current;
    if (prev.searchQuery === searchQuery && prev.sortBy === sortBy) {
      return;
    }

    previousFilters.current = { searchQuery, sortBy };
    setSelectedIds(new Set());
    setPage(0);
  }, [searchQuery, sortBy, setPage]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Удалить этот товар?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Товар удалён" });
      fetchProducts();
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось удалить товар" });
    }
  }, [toast]);

  const handleToggleVisibility = useCallback(async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({ is_visible: !product.is_visible })
        .eq("id", product.id);
      if (error) throw error;
      toast({ title: product.is_visible ? "Товар скрыт с сайта" : "Товар снова виден на сайте" });
      fetchProducts();
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось изменить видимость" });
    }
  }, [toast]);

  const handleCopyProduct = useCallback(async (product: Product) => {
    try {
      const { data, error } = await supabase.from("products").select("*").eq("id", product.id).single();
      if (error) throw error;
      sessionStorage.setItem("copyProductData", JSON.stringify(data));
      navigate("/admin/products/new?copy=true");
    } catch {
      toast({ variant: "destructive", title: "Ошибка", description: "Не удалось скопировать товар" });
    }
  }, [navigate, toast]);

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

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = useMemo(() => {
    const start = page * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  // --- Bulk actions ---
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === filteredProducts.length) {
        return new Set();
      } else {
        return new Set(filteredProducts.map(p => p.id));
      }
    });
  }, [filteredProducts]);

  const toggleSelectPage = useCallback(() => {
    setSelectedIds(prev => {
      const pageIds = paginatedProducts.map(p => p.id);
      const allPageSelected = pageIds.every(id => prev.has(id));
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [paginatedProducts]);

  const selectByCategory = useCallback((categoryId: string) => {
    const ids = filteredProducts.filter(p => p.category_id === categoryId).map(p => p.id);
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.add(id));
      return next;
    });
  }, [filteredProducts]);

  const handleBulkHide = async () => {
    if (!selectedIds.size) return;
    setBulkProcessing(true);
    try {
      const { error } = await supabase.from("products").update({ is_visible: false }).in("id", Array.from(selectedIds));
      if (error) throw error;
      toast({ title: `${selectedIds.size} товар(ов) скрыто` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch { toast({ variant: "destructive", title: "Ошибка при скрытии" }); }
    finally { setBulkProcessing(false); }
  };

  const handleBulkShow = async () => {
    if (!selectedIds.size) return;
    setBulkProcessing(true);
    try {
      const { error } = await supabase.from("products").update({ is_visible: true }).in("id", Array.from(selectedIds));
      if (error) throw error;
      toast({ title: `${selectedIds.size} товар(ов) показано` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch { toast({ variant: "destructive", title: "Ошибка при показе" }); }
    finally { setBulkProcessing(false); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Удалить ${selectedIds.size} товар(ов)? Это действие нельзя отменить.`)) return;
    setBulkProcessing(true);
    try {
      const { error } = await supabase.from("products").delete().in("id", Array.from(selectedIds));
      if (error) throw error;
      toast({ title: `${selectedIds.size} товар(ов) удалено` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch { toast({ variant: "destructive", title: "Ошибка при удалении" }); }
    finally { setBulkProcessing(false); }
  };

  const handleBulkCopy = async () => {
    if (!selectedIds.size) return;
    setBulkProcessing(true);
    try {
      const { data, error } = await supabase.from("products").select("*").in("id", Array.from(selectedIds));
      if (error || !data) throw error;
      for (const product of data) {
        const { id, created_at, updated_at, ...rest } = product as any;
        await supabase.from("products").insert({ ...rest, name: `${rest.name} (копия)` });
      }
      toast({ title: `${selectedIds.size} товар(ов) скопировано` });
      setSelectedIds(new Set());
      fetchProducts();
    } catch { toast({ variant: "destructive", title: "Ошибка при копировании" }); }
    finally { setBulkProcessing(false); }
  };

  const pageAllSelected = paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.has(p.id));

  if (loading) {
    return (
      <AdminLayout title="Товары">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Товары">
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Товары</TabsTrigger>
          <TabsTrigger value="categories">Категории</TabsTrigger>
          <TabsTrigger value="import">Импорт из Excel</TabsTrigger>
        </TabsList>

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
            <div className="flex gap-2 flex-wrap">
              <Select onValueChange={selectByCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Выделить категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="sticky top-0 z-20 bg-primary text-primary-foreground rounded-lg p-3 flex flex-wrap items-center gap-2 shadow-lg animate-in slide-in-from-top-2 overflow-x-auto">
              <div className="flex items-center gap-2 mr-auto">
                <CheckSquare className="h-5 w-5" />
                <span className="font-medium text-sm whitespace-nowrap">
                  Выбрано: {selectedIds.size} из {filteredProducts.length}
                </span>
              </div>
              <Button size="sm" variant="secondary" onClick={toggleSelectAll}>
                {selectedIds.size === filteredProducts.length ? "Снять все" : `Выбрать все ${filteredProducts.length}`}
              </Button>
              <Button size="sm" variant="secondary" onClick={handleBulkShow} disabled={bulkProcessing}>
                <Eye className="h-4 w-4 mr-1" /> Показать
              </Button>
              <Button size="sm" variant="secondary" onClick={handleBulkHide} disabled={bulkProcessing}>
                <EyeOff className="h-4 w-4 mr-1" /> Скрыть
              </Button>
              <Button size="sm" variant="secondary" onClick={handleBulkCopy} disabled={bulkProcessing}>
                <Copy className="h-4 w-4 mr-1" /> Копировать
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={bulkProcessing}>
                <Trash2 className="h-4 w-4 mr-1" /> Удалить
              </Button>
              <Button size="sm" variant="ghost" className="text-primary-foreground hover:text-primary-foreground/80" onClick={() => setSelectedIds(new Set())}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Товары не найдены</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Mobile Cards */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {paginatedProducts.map((product) => (
                  <ProductMobileCard
                    key={product.id}
                    product={product}
                    isSelected={selectedIds.has(product.id)}
                    onToggleSelect={toggleSelect}
                    onToggleVisibility={handleToggleVisibility}
                    onCopy={handleCopyProduct}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Desktop Table */}
              <Card className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <input
                            type="checkbox"
                            checked={pageAllSelected}
                            onChange={toggleSelectPage}
                            className="h-4 w-4 rounded border-primary accent-primary cursor-pointer"
                          />
                        </TableHead>
                        <TableHead className="w-16">Фото</TableHead>
                        <TableHead>Название</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Метки</TableHead>
                        <TableHead className="w-40">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <ProductTableRow
                          key={product.id}
                          product={product}
                          isSelected={selectedIds.has(product.id)}
                          onToggleSelect={toggleSelect}
                          onToggleVisibility={handleToggleVisibility}
                          onCopy={handleCopyProduct}
                          onDelete={handleDelete}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Показано {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filteredProducts.length)} из {filteredProducts.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4 mr-1" /> Назад
                    </Button>
                    <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                      Далее <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="import">
          <ExcelImport onImportComplete={fetchProducts} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
