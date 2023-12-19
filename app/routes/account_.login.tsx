import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, type MetaFunction} from '@remix-run/react';
import {CUSTOMER_QUERY} from './account';

type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Login'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  if (await context.session.get('customerAccessToken')) {
    return redirect('/account');
  }
  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, storefront, cart} = context;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    const form = await request.formData();
    const email = String(form.has('email') ? form.get('email') : '');
    const password = String(form.has('password') ? form.get('password') : '');
    const validInputs = Boolean(email && password);

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerAccessTokenCreate} = await storefront.mutate(
      LOGIN_MUTATION,
      {
        variables: {
          input: {email, password},
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error(customerAccessTokenCreate?.customerUserErrors[0].message);
    }

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    // const {customer} = await storefront.query(CUSTOMER_QUERY, {
    //   variables: {
    //     customerAccessToken: customerAccessToken.accessToken,
    //     country: storefront.i18n.country,
    //     language: storefront.i18n.language,
    //   },
    //   cache: storefront.CacheNone(),
    // });

    const {checkoutCreate} = await storefront.mutate(CREATE_CHECKOUT_MUTATION);

    console.log(checkoutCreate?.checkout);

    const {checkoutCustomerAssociateV2} = await storefront.mutate(
      CHECKOUT_CUSTOMER_ASSOCIATE,
      {
        variables: {
          checkoutId:
            checkoutCreate && checkoutCreate?.checkout
              ? checkoutCreate.checkout.id
              : '',
          customerAccessToken: customerAccessToken.accessToken,
        },
      },
    );
    console.log(checkoutCustomerAssociateV2?.checkout);

    // const result = await cart.updateBuyerIdentity({
    //   customerAccessToken: customerAccessToken.accessToken,
    //   email: customer?.email,
    //   countryCode: storefront.i18n.country,
    //   deliveryAddressPreferences: [
    //     {
    //       deliveryAddress: {
    //         firstName: customer?.firstName,
    //         lastName: customer?.lastName,
    //         address1: customer?.defaultAddress?.address1,
    //         address2: customer?.defaultAddress?.address2,
    //         city: customer?.defaultAddress?.city,
    //         province: customer?.defaultAddress?.province,
    //         zip: customer?.defaultAddress?.zip,
    //         country:
    //           customer?.defaultAddress?.country ?? storefront.i18n.country,
    //         phone: customer?.defaultAddress?.phone,
    //       },
    //     },
    //   ],
    // });
    const data = await storefront.mutate(ADD_LINE_ITEMS_MUTATION, {
      variables: {
        checkoutId:
          checkoutCreate && checkoutCreate?.checkout
            ? checkoutCreate.checkout.id
            : '',
        customerAccessToken: customerAccessToken.accessToken,
        lineItems: [
          {
            quantity: 1,
            variantId: 'gid://shopify/ProductVariant/43930300481685',
          },
        ],
      },
    });
    console.log('added lines', JSON.stringify(data));

    //console.log(JSON.stringify(customer));

    // pretty log json
    // console.log(JSON.stringify(customer, null, 2));

    // const headers = cart.setCartId(result.cart.id);

    //headers.append('Set-Cookie', await session.commit());

    return redirect('/account', {
      headers: {'Set-Cookie': await session.commit()},
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Login() {
  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <div className="login">
      <h1>Sign in.</h1>
      <Form method="POST">
        <fieldset>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            aria-label="Password"
            minLength={8}
            required
          />
        </fieldset>
        {error ? (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        ) : (
          <br />
        )}
        <button type="submit">Sign in</button>
      </Form>
      <br />
      <div>
        <p>
          <Link to="/account/recover">Forgot password →</Link>
        </p>
        <p>
          <Link to="/account/register">Register →</Link>
        </p>
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const LOGIN_MUTATION = `#graphql
  mutation login($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
` as const;

const CHECKOUT_CUSTOMER_ASSOCIATE = `#graphql
  mutation checkoutCustomerAssociateV2($checkoutId: ID!, $customerAccessToken: String!) {
    checkoutCustomerAssociateV2(checkoutId: $checkoutId, customerAccessToken: $customerAccessToken) {
      checkout {
        createdAt
        email
        id
        webUrl
      }
      checkoutUserErrors {
        code
        field
        message
      }
      customer {
        id
        email
        acceptsMarketing
      }
    }
  }
` as const;

const CREATE_CHECKOUT_MUTATION = `#graphql
  mutation checkoutCreate {
    checkoutCreate(input: {}) {
      checkout {
        id
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

// GraphQL mutation to add line items to a checkout
const ADD_LINE_ITEMS_MUTATION = `#graphql
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
      }
      checkoutUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
