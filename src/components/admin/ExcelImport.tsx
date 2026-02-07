import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

interface ExcelRow {
  "Tilda UID"?: string;
  "Title"?: string;
  "Description"?: string;
  "Text"?: string;
  "Photo"?: string;
  "Price"?: number | string;
  "Price Old"?: number | string;
  "Category"?: string;
  "Parent UID"?: string;
  "SKU"?: string;
}

// Utility to convert HTML to plain text with preserved line breaks
const convertHtmlToText = (html: string): string => {
  if (!html) return "";
  return html
    // Convert block elements to newlines
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    // Convert lists
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/?[ou]l[^>]*>/gi, "\n")
    // Strip remaining HTML tags (but preserve text inside)
    .replace(/<[^>]*>/g, "")
    // Decode common HTML entities
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Clean up excess whitespace but preserve intentional line breaks
    .replace(/[ \t]+/g, " ")          // Collapse horizontal whitespace
    .replace(/\n[ \t]+/g, "\n")       // Remove leading spaces after newlines
    .replace(/[ \t]+\n/g, "\n")       // Remove trailing spaces before newlines
    .replace(/\n{3,}/g, "\n\n")       // Max 2 consecutive newlines
    .trim();
};

// Generate slug from category name
const generateSlug = (name: string): string => {
  const translitMap: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
    ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
  };
  
  return name
    .toLowerCase()
    .split("")
    .map((char) => translitMap[char] || char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export function ExcelImport({ onImportComplete }: { onImportComplete?: () => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setResult(null);
    setProgress(0);
    setImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

      // Filter out variations (rows with Parent UID)
      const mainProducts = rows.filter((row) => !row["Parent UID"]);

      const importResult = await importProducts(mainProducts);
      setResult(importResult);

      if (importResult.errors.length === 0) {
        toast({
          title: "Импорт завершён",
          description: `Создано: ${importResult.created}, обновлено: ${importResult.updated}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Импорт завершён с ошибками",
          description: `Ошибок: ${importResult.errors.length}`,
        });
      }

      onImportComplete?.();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Не удалось обработать файл",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const importProducts = async (rows: ExcelRow[]): Promise<ImportResult> => {
    const result: ImportResult = {
      total: rows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    // Fetch existing categories
    const { data: existingCategories } = await supabase
      .from("categories")
      .select("id, name, slug");

    const categoryMap = new Map<string, string>();
    existingCategories?.forEach((cat) => {
      categoryMap.set(cat.name.toLowerCase(), cat.id);
      categoryMap.set(cat.slug.toLowerCase(), cat.id);
    });

    // Fetch existing products by name for update detection
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, name");

    const productMap = new Map<string, string>();
    existingProducts?.forEach((prod) => {
      productMap.set(prod.name.toLowerCase().trim(), prod.id);
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      setProgress(Math.round(((i + 1) / rows.length) * 100));

      try {
        const title = row["Title"]?.trim();
        if (!title) {
          result.skipped++;
          continue;
        }

        const price = parseFloat(String(row["Price"] || "0").replace(",", "."));
        if (isNaN(price) || price <= 0) {
          result.skipped++;
          continue;
        }

        // Parse images (space-separated URLs)
        const photoStr = row["Photo"] || "";
        const images = photoStr
          .split(/\s+/)
          .map((url) => url.trim().replace(/\\/g, ""))
          .filter((url) => url.startsWith("http"));

        // Parse category - take first category if multiple
        const categoryStr = row["Category"] || "";
        const categories = categoryStr.split(";").map((c) => c.trim()).filter(Boolean);
        let categoryId: string | null = null;

        if (categories.length > 0) {
          const firstCategory = categories[0];
          const existingCatId = categoryMap.get(firstCategory.toLowerCase());
          
          if (existingCatId) {
            categoryId = existingCatId;
          } else {
            // Create new category
            const slug = generateSlug(firstCategory);
            const { data: newCat, error: catError } = await supabase
              .from("categories")
              .insert({ name: firstCategory, slug })
              .select("id")
              .single();

            if (newCat && !catError) {
              categoryId = newCat.id;
              categoryMap.set(firstCategory.toLowerCase(), newCat.id);
            }
          }
        }

        // Parse old price
        const oldPriceStr = row["Price Old"];
        const oldPrice = oldPriceStr
          ? parseFloat(String(oldPriceStr).replace(",", "."))
          : null;

        // Calculate discount
        let discount: number | null = null;
        if (oldPrice && oldPrice > price) {
          discount = Math.round(((oldPrice - price) / oldPrice) * 100);
        }

        // Prepare description - convert HTML to text with preserved formatting
        const rawDescription = row["Text"] || row["Description"] || "";
        const description = convertHtmlToText(rawDescription);

        const productData = {
          name: title,
          description: description || null,
          price,
          old_price: oldPrice && oldPrice > 0 ? oldPrice : null,
          discount,
          images: images.length > 0 ? images : null,
          category_id: categoryId,
          in_stock: true,
          is_new: false,
          is_hit: false,
        };

        // Check if product exists
        const existingId = productMap.get(title.toLowerCase().trim());

        if (existingId) {
          // Update existing product
          const { error } = await supabase
            .from("products")
            .update(productData)
            .eq("id", existingId);

          if (error) {
            result.errors.push(`${title}: ${error.message}`);
          } else {
            result.updated++;
          }
        } else {
          // Create new product
          const { error, data: newProduct } = await supabase
            .from("products")
            .insert(productData)
            .select("id")
            .single();

          if (error) {
            result.errors.push(`${title}: ${error.message}`);
          } else {
            result.created++;
            if (newProduct) {
              productMap.set(title.toLowerCase().trim(), newProduct.id);
            }
          }
        }
      } catch (error) {
        result.errors.push(
          `Строка ${i + 1}: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
        );
      }
    }

    return result;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Импорт из Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Поддерживаемый формат: Excel-файл экспортированный из Tilda</p>
          <p className="mt-1">
            Маппинг полей: Title → Название, Price → Цена, Price Old → Старая цена, 
            Category → Категория, Photo → Изображения, Text/Description → Описание
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="w-full"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Импорт...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Выбрать файл
            </>
          )}
        </Button>

        {fileName && (
          <p className="text-sm text-muted-foreground">
            Файл: {fileName}
          </p>
        )}

        {importing && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">{progress}%</p>
          </div>
        )}

        {result && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Всего</Badge>
                <span className="font-medium">{result.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Создано
                </Badge>
                <span className="font-medium">{result.created}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Обновлено
                </Badge>
                <span className="font-medium">{result.updated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Пропущено</Badge>
                <span className="font-medium">{result.skipped}</span>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Ошибки ({result.errors.length}):</span>
                </div>
                <div className="max-h-48 overflow-y-auto text-sm space-y-1 bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-2 py-1 border-b border-destructive/10 last:border-0">
                      <span className="text-destructive font-medium shrink-0">#{i + 1}</span>
                      <span className="text-muted-foreground break-words">{err}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Прокрутите для просмотра всех ошибок. Исправьте данные в файле и загрузите снова.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
