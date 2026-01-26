import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProduct } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";

  const { product, loading } = useProduct(isNew ? "" : id || "");

  if (!isNew && loading) {
    return (
      <AdminLayout title="Редактирование товара">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isNew ? "Новый товар" : "Редактирование товара"}>
      <ProductForm product={product || undefined} />
    </AdminLayout>
  );
}
