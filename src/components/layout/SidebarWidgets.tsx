import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

const newsItems = [
  {
    id: 1,
    title: "Украшения и подарки из воздушных шаров к Новому году 2026",
    image: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=150&h=100&fit=crop",
    href: "/news/1",
  },
  {
    id: 2,
    title: "Новогодняя фотозона из шаров для корпоративов и больших компаний",
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=150&h=100&fit=crop",
    href: "/news/2",
  },
];

export function SidebarWidgets() {
  return (
    <div className="space-y-6">
      {/* Bonus Program Banner */}
      <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">ПРИСОЕДИНЯЙСЯ К НАШЕЙ</p>
            <p className="text-xs text-muted-foreground mb-2">БОНУСНОЙ ПРОГРАММЕ</p>
            <div className="bg-secondary text-secondary-foreground rounded-lg py-2 px-3 mb-2">
              <span className="text-xl font-bold">ПОЛУЧИ</span>
            </div>
            <div className="text-3xl font-bold text-primary">1000</div>
            <div className="text-sm text-primary font-semibold">БАЛЛОВ</div>
            <div className="text-xs text-muted-foreground mt-1">1 балл=1 рублю</div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 mb-3 border-b pb-3">
            <span className="text-sm font-medium">Оплата</span>
            <span className="text-sm text-muted-foreground">Доставка</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <img src="https://cdn.svgporn.com/logos/mastercard.svg" alt="Mastercard" className="h-6" />
            <img src="https://cdn.svgporn.com/logos/visa.svg" alt="Visa" className="h-6" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">МИР</span>
          </div>
          <Link to="/payment" className="text-sm text-primary hover:underline mt-3 block">
            Подробнее &gt;
          </Link>
        </CardContent>
      </Card>

      {/* News */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold mb-4">Новости</h3>
          <div className="space-y-4">
            {newsItems.map((item) => (
              <Link key={item.id} to={item.href} className="flex gap-3 group">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-16 h-12 object-cover rounded"
                />
                <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors line-clamp-3">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
          <Link to="/news" className="text-sm text-primary hover:underline mt-4 block">
            Все новости
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
