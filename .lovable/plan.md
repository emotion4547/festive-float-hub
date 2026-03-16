

## План: Удаление времени работы со всех страниц

### Изменения

**1. Header (`src/components/layout/Header.tsx`, строка 144)**
- Удалить строку `<p className="text-xs text-muted-foreground">Краснодар, ежедневно 10:00-20:00</p>`
- Оставить только город: `<p className="text-xs text-muted-foreground">Краснодар</p>`

**2. Footer (`src/components/layout/Footer.tsx`, строки 83-99)**
- Удалить весь блок «ВРЕМЯ РАБОТЫ» (заголовок + два пункта с Clock иконками)
- Убрать импорт `Clock` если больше нигде не используется

**3. Contacts (`src/pages/ContactsPage.tsx`, строки 96-104)**
- Удалить блок с иконкой Clock и `workHours`
- Удалить `useSetting("work_hours", ...)` на строке 18
- Убрать `Clock` из импорта если больше не используется

**4. SEO schema (`src/lib/seoSchemas.ts`, строки 160-165)**
- Удалить `openingHoursSpecification` из JSON-LD схемы

**5. Delivery SEO (`src/pages/DeliveryPage.tsx`, строка 38)**
- Убрать "10:00-20:00" из meta description

