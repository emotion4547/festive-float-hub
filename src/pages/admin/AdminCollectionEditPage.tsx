import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Trash2, Search } from "lucide-react";
import { SortableList } from "@/components/admin/SortableList";
import { SortableItem } from "@/components/admin/SortableItem";

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CollectionProduct {
  id: string;
  product_id: string;
  sort_order: number;
  product: Product;
}

interface CollectionCategory {
  id: string;
  category_id: string;
  category: Category;
}

export default function AdminCollectionEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<CollectionProduct[]>([]);
  const [collectionCategories, setCollectionCategories] = useState<CollectionCategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const fetchData = async () => {
    if (!id) return;

    // Fetch collection
    const { data: collectionData, error: collectionError } = await supabase
      .from("collections")
      .select("id, name, slug")
      .eq("id", id)
      .maybeSingle();

    if (collectionError || !collectionData) {
      toast({ title: "Подборка не найдена", variant: "destructive" });
      navigate("/admin/collections");
      return;
    }
    setCollection(collectionData);

    // Fetch collection products
    const { data: productsData } = await supabase
      .from("collection_products")
      .select(`
        id,
        product_id,
        sort_order,
        product:products(id, name, price, images)
      `)
      .eq("collection_id", id)
      .order("sort_order", { ascending: true });

    setCollectionProducts(
      (productsData || []).map((item: any) => ({
        ...item,
        product: item.product,
      }))
    );

    // Fetch collection categories
    const { data: categoriesData } = await supabase
      .from("collection_categories")
      .select(`
        id,
        category_id,
        category:categories(id, name, slug)
      `)
      .eq("collection_id", id);

    setCollectionCategories(
      (categoriesData || []).map((item: any) => ({
        ...item,
        category: item.category,
      }))
    );

    // Fetch all products for selection
    const { data: allProductsData } = await supabase
      .from("products")
      .select("id, name, price, images")
      .order("name", { ascending: true });

    setAllProducts(allProductsData || []);

    // Fetch all categories for selection
    const { data: allCategoriesData } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    setAllCategories(allCategoriesData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddProduct = async () => {
    if (!selectedProductId || !id) return;

    const existing = collectionProducts.find((cp) => cp.product_id === selectedProductId);
    if (existing) {
      toast({ title: "Товар уже добавлен", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("collection_products").insert({
      collection_id: id,
      product_id: selectedProductId,
      sort_order: collectionProducts.length,
    });

    if (error) {
      toast({ title: "Ошибка добавления", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Товар добавлен" });
    setSelectedProductId("");
    setProductDialogOpen(false);
    fetchData();
  };

  const handleRemoveProduct = async (productRelationId: string) => {
    const { error } = await supabase
      .from("collection_products")
      .delete()
      .eq("id", productRelationId);

    if (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
      return;
    }

    toast({ title: "Товар удален из подборки" });
    fetchData();
  };

  const handleReorderProducts = async (reorderedItems: CollectionProduct[]) => {
    setCollectionProducts(reorderedItems);

    // Update sort_order for all items
    for (let i = 0; i < reorderedItems.length; i++) {
      await supabase
        .from("collection_products")
        .update({ sort_order: i })
        .eq("id", reorderedItems[i].id);
    }

    toast({ title: "Порядок сохранен" });
  };

  const handleAddCategory = async () => {
    if (!selectedCategoryId || !id) return;

    const existing = collectionCategories.find((cc) => cc.category_id === selectedCategoryId);
    if (existing) {
      toast({ title: "Категория уже добавлена", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("collection_categories").insert({
      collection_id: id,
      category_id: selectedCategoryId,
    });

    if (error) {
      toast({ title: "Ошибка добавления", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Категория добавлена" });
    setSelectedCategoryId("");
    setCategoryDialogOpen(false);
    fetchData();
  };

  const handleRemoveCategory = async (categoryRelationId: string) => {
    const { error } = await supabase
      .from("collection_categories")
      .delete()
      .eq("id", categoryRelationId);

    if (error) {
      toast({ title: "Ошибка удаления", variant: "destructive" });
      return;
    }

    toast({ title: "Категория удалена из подборки" });
    fetchData();
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Загрузка...">
        <p>Загрузка данных подборки...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Подборка: ${collection?.name || ""}`}>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/collections")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Назад к подборкам
        </Button>

        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">Отдельные товары ({collectionProducts.length})</TabsTrigger>
            <TabsTrigger value="categories">Категории ({collectionCategories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Перетащите товары для изменения порядка
              </p>
              <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Добавить товар в подборку</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Поиск товара..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredProducts.slice(0, 20).map((product) => {
                        const isAdded = collectionProducts.some((cp) => cp.product_id === product.id);
                        return (
                          <div
                            key={product.id}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-colors ${
                              selectedProductId === product.id
                                ? "border-primary bg-primary/5"
                                : isAdded
                                ? "border-muted bg-muted/50 opacity-50"
                                : "border-transparent hover:bg-muted"
                            }`}
                            onClick={() => !isAdded && setSelectedProductId(product.id)}
                          >
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.price} ₽</p>
                            </div>
                            {isAdded && <Badge variant="secondary">Добавлен</Badge>}
                          </div>
                        );
                      })}
                    </div>
                    <Button onClick={handleAddProduct} disabled={!selectedProductId} className="w-full">
                      Добавить выбранный товар
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {collectionProducts.length === 0 ? (
              <p className="text-muted-foreground py-4">Товары не добавлены</p>
            ) : (
              <div className="space-y-2">
                <SortableList items={collectionProducts} onReorder={handleReorderProducts}>
                  {collectionProducts.map((cp) => (
                    <SortableItem key={cp.id} id={cp.id} className="p-2">
                      <div className="flex items-center gap-3 flex-1">
                        {cp.product?.images?.[0] ? (
                          <img
                            src={cp.product.images[0]}
                            alt={cp.product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{cp.product?.name}</p>
                          <p className="text-sm text-muted-foreground">{cp.product?.price} ₽</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemoveProduct(cp.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </SortableItem>
                  ))}
                </SortableList>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Все товары из выбранных категорий будут показаны в подборке
              </p>
              <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить категорию
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить категорию в подборку</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Выберите категорию</Label>
                      <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories
                            .filter((c) => !collectionCategories.some((cc) => cc.category_id === c.id))
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddCategory} disabled={!selectedCategoryId} className="w-full">
                      Добавить категорию
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {collectionCategories.length === 0 ? (
              <p className="text-muted-foreground py-4">Категории не добавлены</p>
            ) : (
              <div className="space-y-2">
                {collectionCategories.map((cc) => (
                  <div key={cc.id} className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{cc.category?.name}</p>
                      <p className="text-sm text-muted-foreground">/{cc.category?.slug}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveCategory(cc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
