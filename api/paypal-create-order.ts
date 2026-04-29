type PayPalItem = {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  unitAmount: number;
};

type CreateOrderRequest = {
  items: PayPalItem[];
  currency?: string;
};

const getPayPalBaseUrl = () => {
  const env = (process.env.PAYPAL_ENV || 'sandbox').toLowerCase();
  return env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
};

const getAccessToken = async () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal auth failed: ${text}`);
  }

  const json = await response.json();
  return json.access_token as string;
};

const toMoney = (value: number) => {
  const normalized = Math.round(value * 100) / 100;
  return normalized.toFixed(2);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { items, currency } = req.body as CreateOrderRequest;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Missing items' });
      return;
    }

    const normalizedCurrency = (currency || 'MXN').toUpperCase();

    const safeItems = items.map((item) => {
      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitAmount = Number(item.unitAmount);

      if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
        throw new Error('Invalid unit amount');
      }

      return {
        name: item.name,
        quantity: quantity.toString(),
        unit_amount: {
          currency_code: normalizedCurrency,
          value: toMoney(unitAmount),
        },
        category: 'PHYSICAL_GOODS',
      };
    });

    const itemTotal = safeItems.reduce((sum, item) => {
      return sum + Number(item.unit_amount.value) * Number(item.quantity);
    }, 0);

    const accessToken = await getAccessToken();

    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: normalizedCurrency,
              value: toMoney(itemTotal),
              breakdown: {
                item_total: {
                  currency_code: normalizedCurrency,
                  value: toMoney(itemTotal),
                },
              },
            },
            items: safeItems,
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(500).json({ error: text || 'Unable to create PayPal order' });
      return;
    }

    const order = await response.json();
    res.status(200).json({ id: order.id });
  } catch (error: any) {
    console.error('PayPal create order error:', error);
    res.status(500).json({ error: 'Unable to create PayPal order' });
  }
}
