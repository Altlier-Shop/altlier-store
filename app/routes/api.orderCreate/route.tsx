import type {ActionFunctionArgs} from '@shopify/remix-oxygen';
import {json, redirect} from '@shopify/remix-oxygen';

export async function action({
  request,
  context,
}: ActionFunctionArgs): Promise<any> {
  const data = await request.json();
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  const raw = JSON.stringify({
    order: {
      order_id: data?.id.toString(),
      customer_id: data?.customer?.id.toString(),
      email: data.email,
      order_date: data.created_at,
      items: data.line_items.map((item: any) => ({
        item_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price),
      })),
      payment_method: 'Fiat',
      wallet_address: '',
      total_spent: data.subtotal_price,
      referral_code: data.reference,
      status: data.fulfillment_status,
    },
  });

  const requestOptions: RequestInit = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch(
    'https://uvg9s9ce04.execute-api.us-east-1.amazonaws.com/Prod/orders',
    requestOptions,
  )
    .then((response) => response.text())
    .then((result) => console.log('pppppppppppppp', result))
    .catch((error) => console.error(error));

  return json({});
}
