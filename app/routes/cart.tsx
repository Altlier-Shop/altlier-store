import {Await, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import type {CartQueryData, Storefront} from '@shopify/hydrogen';
import {CartForm} from '@shopify/hydrogen';
import {json, type ActionFunctionArgs} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/Cart';
import {useRootLoaderData} from '~/root';
import type {
  CartLineInput,
  CheckoutLineItemInput,
  CheckoutLineItemUpdateInput,
} from '@shopify/hydrogen/storefront-api-types';

export const meta: MetaFunction = () => {
  return [{title: `Altlier | Cart`}];
};

async function updateLinesCheckout(
  quantity: number,
  variantId: string,
  storefront: Storefront,
  checkoutId: string,
  checkoutIdentifier: string,
) {
  const variantRegex = new RegExp('ProductVariant/(.*)');
  const variantIdentification = variantId.match(variantRegex);
  if (variantIdentification && quantity > 0) {
    const variantIdentifier = variantIdentification[1];
    const checkoutLineId = `gid://shopify/CheckoutLineItem/${variantIdentifier}0?checkout=${checkoutIdentifier}`;
    // console.log('to remove lines', JSON.stringify(lineIds));
    console.log('checkoutLineId:', checkoutLineId);
    const convertedLine: CheckoutLineItemUpdateInput[] = [
      {
        id: checkoutLineId,
        quantity,
        variantId,
      },
    ];
    const data = await storefront.mutate(UPDATE_LINE_ITEMS_MUTATION, {
      variables: {
        checkoutId,
        lineItems: convertedLine,
      },
    });
    const errors = data.checkoutLineItemsUpdate?.checkoutUserErrors;
    // console.log('error status', errors);
    if (errors && errors?.length > 0) {
      throw new Error('Error finding line item to delete');
    }
  }
}

async function removeLinesCheckout(
  variantId: string,
  storefront: Storefront,
  checkoutId: string,
  checkoutIdentifier: string,
) {
  const variantRegex = new RegExp('ProductVariant/(.*)');
  const variantIdentification = variantId.match(variantRegex);
  if (variantIdentification) {
    const variantIdentifier = variantIdentification[1];
    const checkoutLineId = `gid://shopify/CheckoutLineItem/${variantIdentifier}0?checkout=${checkoutIdentifier}`;
    // console.log('to remove lines', JSON.stringify(lineIds));
    // console.log('checkoutLineId:', checkoutLineId);
    console.log('checkoutId:', checkoutId);

    const data = await storefront.mutate(REMOVE_LINE_ITEMS_MUTATION, {
      variables: {
        checkoutId,
        lineItemIds: [checkoutLineId],
      },
    });
    const errors = data.checkoutLineItemsRemove?.checkoutUserErrors;
    // console.log(
    //   'error status',
    //   data.checkoutLineItemsRemove?.checkoutUserErrors,
    // );
    if (errors && errors?.length > 0) {
      throw new Error('Error finding line item to delete');
    }
  }
}

async function addLinesCheckout(
  lines: CartLineInput[],
  storefront: Storefront,
  checkoutId: string,
) {
  // console.log('to add lines', JSON.stringify(lines));
  const convertedLines: CheckoutLineItemInput[] = lines.map((line) => {
    return {
      quantity: line.quantity || 0,
      variantId: line.merchandiseId,
    };
  });
  const data = await storefront.mutate(ADD_LINE_ITEMS_MUTATION, {
    variables: {
      checkoutId,
      lineItems: convertedLines,
    },
  });
  console.log(
    'add lines',
    JSON.stringify(data.checkoutLineItemsAdd?.checkout?.lineItems),
  );
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, cart, storefront} = context;
  const checkoutId = session.get('checkoutId');
  const checkoutIdentifier = session.get('checkoutIdentifier');

  const [formData, customerAccessToken] = await Promise.all([
    request.formData(),
    session.get('customerAccessToken'),
  ]);

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result: CartQueryData;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd:
      result = await cart.addLines(inputs.lines);
      if (checkoutId) {
        await addLinesCheckout(inputs.lines, storefront, checkoutId);
      }

      break;
    case CartForm.ACTIONS.LinesUpdate:
      if (checkoutId) {
        await updateLinesCheckout(
          inputs.lines[0].quantity || 0,
          inputs.lines[0].merchandiseId || '',
          storefront,
          checkoutId,
          checkoutIdentifier,
        );
      }
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      const formInputDelete: any = JSON.parse(inputs.lineIds[0]);
      // console.log(formInputDelete);
      if (checkoutId) {
        await removeLinesCheckout(
          formInputDelete.variantId,
          storefront,
          checkoutId,
          checkoutIdentifier,
        );
      }
      result = await cart.removeLines([formInputDelete.lineId]);

      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = (
        formDiscountCode ? [formDiscountCode] : []
      ) as string[];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
        customerAccessToken: customerAccessToken?.accessToken,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  const cartId = result.cart.id;
  const headers = cart.setCartId(result.cart.id);
  const {cart: cartResult, errors} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return json(
    {
      cart: cartResult,
      errors,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

export default function Cart() {
  const rootData = useRootLoaderData();
  const cartPromise = rootData.cart;
  const checkoutUrl = rootData.checkoutUrl;

  return (
    <div className="cart">
      <h1>Cart</h1>

      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await
          resolve={cartPromise}
          errorElement={<div>An error occurred</div>}
        >
          {(cart) => {
            return (
              <CartMain layout="page" cart={cart} checkoutUrl={checkoutUrl} />
            );
          }}
        </Await>
      </Suspense>
    </div>
  );
}

const LINE_ITEM_FRAGMENT = `#graphql
  fragment LineItem on CheckoutLineItem {
    id
    title
    quantity
    variant {
      id
    }
  }
` as const;
// GraphQL mutation to add line items to a checkout
export const ADD_LINE_ITEMS_MUTATION = `#graphql
  mutation checkoutLineItemsAdd($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
    checkoutLineItemsAdd(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        email
        webUrl
        subtotalPrice {
          amount
          currencyCode
        }
        lineItems(first: 100) {
          nodes {
        ...LineItem
      }
    }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
  ${LINE_ITEM_FRAGMENT}
` as const;

// GraphQL mutation to add line items to a checkout
export const REMOVE_LINE_ITEMS_MUTATION = `#graphql
  mutation checkoutLineItemsRemove($checkoutId: ID!, $lineItemIds: [ID!]!) {
    checkoutLineItemsRemove(checkoutId: $checkoutId, lineItemIds: $lineItemIds) {
      checkout {
        id
        email
        webUrl
        lineItems(first: 100) {
          nodes {
            ...LineItem
          }
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
  ${LINE_ITEM_FRAGMENT}
` as const;

export const UPDATE_LINE_ITEMS_MUTATION = `#graphql
  mutation checkoutLineItemsUpdate($checkoutId: ID!, $lineItems: [CheckoutLineItemUpdateInput!]!) {
    checkoutLineItemsUpdate(checkoutId: $checkoutId, lineItems: $lineItems) {
      checkout {
        id
        email
        webUrl
        subtotalPrice {
          amount
          currencyCode
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
