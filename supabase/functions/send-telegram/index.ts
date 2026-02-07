import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramPayload {
  type: 'callback' | 'order';
  data: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram credentials not configured');
    }

    const payload: TelegramPayload = await req.json();
    let message = '';

    if (payload.type === 'callback') {
      const { name, phone, comment } = payload.data as { name: string; phone: string; comment?: string };
      message = `📞 *Заявка на обратный звонок*\n\n` +
        `👤 Имя: ${escapeMarkdown(name)}\n` +
        `📱 Телефон: ${escapeMarkdown(phone)}\n` +
        (comment ? `💬 Комментарий: ${escapeMarkdown(comment)}` : '');
    } else if (payload.type === 'order') {
      const { 
        orderNumber, 
        customerName, 
        customerPhone, 
        customerEmail,
        deliveryMethod,
        deliveryAddress,
        deliveryDate,
        deliveryTime,
        paymentMethod,
        total,
        items,
        comment
      } = payload.data as {
        orderNumber: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        deliveryMethod: string;
        deliveryAddress?: string;
        deliveryDate?: string;
        deliveryTime?: string;
        paymentMethod: string;
        total: number;
        items: Array<{ name: string; quantity: number; price: number }>;
        comment?: string;
      };

      const itemsList = items.map(item => 
        `  • ${escapeMarkdown(item.name)} × ${item.quantity} = ${item.price * item.quantity} ₽`
      ).join('\n');

      const deliveryMethodText = deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка';
      const paymentMethodText = paymentMethod === 'cash' ? 'Наличными' : 'Картой';

      message = `🛒 *Новый заказ ${escapeMarkdown(orderNumber)}*\n\n` +
        `👤 Клиент: ${escapeMarkdown(customerName)}\n` +
        `📱 Телефон: ${escapeMarkdown(customerPhone)}\n` +
        (customerEmail ? `📧 Email: ${escapeMarkdown(customerEmail)}\n` : '') +
        `\n📦 Способ получения: ${deliveryMethodText}\n` +
        (deliveryAddress ? `📍 Адрес: ${escapeMarkdown(deliveryAddress)}\n` : '') +
        (deliveryDate ? `📅 Дата: ${escapeMarkdown(deliveryDate)}\n` : '') +
        (deliveryTime ? `⏰ Время: ${escapeMarkdown(deliveryTime)}\n` : '') +
        `💳 Оплата: ${paymentMethodText}\n` +
        `\n🧾 *Товары:*\n${itemsList}\n` +
        `\n💰 *Итого: ${total} ₽*` +
        (comment ? `\n\n💬 Комментарий: ${escapeMarkdown(comment)}` : '');
    } else {
      throw new Error('Unknown message type');
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', result);
      throw new Error(`Telegram API error: ${result.description || 'Unknown error'}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function escapeMarkdown(text: string): string {
  if (!text) return '';
  return text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
}
