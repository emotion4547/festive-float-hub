

# Исправление сброса вкладок во всех админ-страницах

## Что делаем
Заменяем неконтролируемые `<Tabs defaultValue="...">` на контролируемые с `useSearchParams` в 7 файлах + исправляем навигацию в ProductForm.

## Изменения

### Паттерн (одинаковый для всех страниц)
```typescript
import { useSearchParams } from "react-router-dom";

const [searchParams, setSearchParams] = useSearchParams();
const tab = searchParams.get("tab") || "DEFAULT";
const setTab = (v: string) => setSearchParams({ tab: v }, { replace: true });

<Tabs value={tab} onValueChange={setTab}>
```

### Файлы

| Файл | Default tab |
|------|-------------|
| `AdminProductsPage.tsx` | `products` |
| `AdminSettingsPage.tsx` | `branding` |
| `AdminOrdersPage.tsx` | `orders` |
| `AdminUsersPage.tsx` | `customers` |
| `AdminShowcasePage.tsx` | `banners` |
| `AdminWheelPage.tsx` | `segments` |
| `AdminCollectionEditPage.tsx` | `products` |

### ProductForm.tsx
- Строка 427: `navigate("/admin/products")` → `navigate("/admin/products?tab=products")`
- Строка 844: `navigate("/admin/products")` → `navigate("/admin/products?tab=products")`

Для страниц без `useSearchParams` в импортах — добавить импорт. Для `AdminProductsPage` и `ProductForm` — `useSearchParams` уже может быть импортирован, нужно проверить.

