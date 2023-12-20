import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, type MetaFunction} from '@remix-run/react';

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
    console.log('cart ID:', cart.getCartId());

    const {customerAccessToken} = customerAccessTokenCreate;
    session.set('customerAccessToken', customerAccessToken);

    const {checkoutCreate} = await storefront.mutate(CREATE_CHECKOUT_MUTATION);

    console.log('new checkout ID', checkoutCreate?.checkout);

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
    console.log(
      'updated checkout',
      JSON.stringify(checkoutCustomerAssociateV2?.checkout),
      '\n',
    );
    if (
      checkoutCustomerAssociateV2 &&
      checkoutCustomerAssociateV2.customer &&
      checkoutCustomerAssociateV2.customer.defaultAddress
    ) {
      const {checkoutShippingAddressUpdateV2} = await storefront.mutate(
        UPDATE_SHIPPING_ADDRESS,
        {
          variables: {
            checkoutId:
              checkoutCreate && checkoutCreate?.checkout
                ? checkoutCreate.checkout.id
                : '',
            shippingAddress:
              checkoutCustomerAssociateV2.customer.defaultAddress,
          },
        },
      );
      console.log(
        'updated checkout shipping address',
        JSON.stringify(checkoutShippingAddressUpdateV2?.checkout),
      );
    }

    const checkoutId: string = checkoutCustomerAssociateV2?.checkout?.id || '';
    const checkoutUrl: string =
      checkoutCustomerAssociateV2?.checkout?.webUrl || '';
    // pretty log json
    // console.log(JSON.stringify(customer, null, 2));
    const checkoutRegex = new RegExp('Checkout\\/(.*)\\?');
    const checkoutIdentification = checkoutId.match(checkoutRegex);
    if (checkoutIdentification) {
      session.set('checkoutIdentifier', checkoutIdentification[1]);
    }

    session.set('checkoutId', checkoutId);
    session.set('checkoutUrl', checkoutUrl);
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
        taxExempt
        buyerIdentity {
          countryCode
        }
        shippingLine {
          title
          price {
            amount
            currencyCode
          }
        }
      }
      checkoutUserErrors {
        code
        field
        message
      }
      customer {
        id
        email
        defaultAddress {
          address1
          address2
          city
          company
          country
          firstName
          lastName
          zip
          province
        }
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

const UPDATE_SHIPPING_ADDRESS = `#graphql
  mutation updateShippingAddress($checkoutId: ID!, $shippingAddress: MailingAddressInput!) {
    checkoutShippingAddressUpdateV2(checkoutId: $checkoutId, shippingAddress: $shippingAddress) {
      checkout {
        id
        shippingAddress {
          address1
          address2
          city
          company
          country
          firstName
          lastName
          province
          zip
        }
      }
      userErrors {
        field
        message
      }
      checkoutUserErrors {
        field
        message
        code
      }
    }
  }
` as const;
