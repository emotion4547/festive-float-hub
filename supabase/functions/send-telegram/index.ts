import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://radugaprazdnika.ru';

interface TelegramPayload {
  type: 'callback' | 'order';
  data: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    let TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: settings } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['telegram_bot_token', 'telegram_chat_id']);

      if (settings) {
        const tokenSetting = settings.find(s => s.key === 'telegram_bot_token');
        const chatSetting = settings.find(s => s.key === 'telegram_chat_id');
        if (!TELEGRAM_BOT_TOKEN && tokenSetting?.value) TELEGRAM_BOT_TOKEN = tokenSetting.value;
        if (!TELEGRAM_CHAT_ID && chatSetting?.value) TELEGRAM_CHAT_ID = chatSetting.value;
      }
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram credentials not configured');
    }

    const payload: TelegramPayload = await req.json();
    let message = '';

    if (payload.type === 'callback') {
      const { name, phone, comment } = payload.data as { name: string; phone: string; comment?: string };
      message = `📞 <b>Заявка на обратный звонок</b>\n\n` +
        `👤 Имя: ${esc(name)}\n` +
        `📱 Телефон: ${esc(phone)}\n` +
        (comment ? `💬 Комментарий: ${esc(comment)}` : '');

    } else if (payload.type === 'order') {
      const { 
        orderNumber, customerName, customerPhone, customerEmail,
        deliveryMethod, deliveryAddress, deliveryDate, deliveryTime,
        paymentMethod, total, items, comment
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
        items: Array<{ name: string; quantity: number; price: number; productId?: string }>;
        comment?: string;
      };

      const itemsList = items.map(item => {
        const line = `  • ${esc(item.name)} × ${item.quantity} = ${item.price * item.quantity} ₽`;
        if (item.productId) {
          return `${line}\n    🔗 <a href="${SITE_URL}/product/${item.productId}">Открыть товар</a>`;
        }
        return line;
      }).join('\n');

      const deliveryMethodText = deliveryMethod === 'pickup' ? 'Самовывоз' : 'Доставка';
      
      const paymentMethodMap: Record<string, string> = {
        'cash': 'Наличными при получении',
        'card': 'Картой при получении',
        'invoice': 'Счёт для юр. лиц'
      };
      const paymentMethodText = paymentMethodMap[paymentMethod] || paymentMethod;

      message = `🛒 <b>Новый заказ ${esc(orderNumber)}</b>\n\n` +
        `👤 Клиент: ${esc(customerName)}\n` +
        `📱 Телефон: ${esc(customerPhone)}\n` +
        (customerEmail ? `📧 Email: ${esc(customerEmail)}\n` : '') +
        `\n📦 Способ получения: ${deliveryMethodText}\n` +
        (deliveryAddress ? `📍 Адрес: ${esc(deliveryAddress)}\n` : '') +
        (deliveryDate ? `📅 Дата: ${esc(deliveryDate)}\n` : '') +
        (deliveryTime ? `⏰ Время: ${esc(deliveryTime)}\n` : '') +
        `💳 Оплата: ${paymentMethodText}\n` +
        `\n🧾 <b>Товары:</b>\n${itemsList}\n` +
        `\n💰 <b>Итого: ${total} ₽</b>` +
        (comment ? `\n\n💬 Комментарий: ${esc(comment)}` : '');
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
        parse_mode: 'HTML',
        disable_web_page_preview: true,
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

function esc(text: string): string {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
