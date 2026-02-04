export function AnnouncementBar() {
  const text = "Окончательную цену уточняйте при заказе. Доставка по городу от 500 руб.";
  
  return (
    <div className="bg-secondary text-secondary-foreground py-2 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-8 text-sm font-medium">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
