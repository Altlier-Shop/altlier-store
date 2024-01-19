import {json, redirect, type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {type MetaFunction} from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [{title: 'Logout'}];
};

export async function loader() {
  return redirect('/account/login');
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, cart} = context;
  session.unset('customerAccessToken');
  session.unset('checkoutId');
  session.unset('checkoutUrl');
  session.unset('checkoutIdentifier');

  const res = await cart.create({});
  const headers = cart.setCartId(res.cart.id);

  headers.append('Set-Cookie', await session.destroy());

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  return redirect('/', {
    headers,
  });
}

export default function Logout() {
  return null;
}
