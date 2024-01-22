import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  type MetaFunction,
} from '@remix-run/react';
import type {CheckoutLineItemInput} from '@shopify/hydrogen/storefront-api-types';
import {AuthLayout} from '~/components/AuthLayout';

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

    const cartProperties = await cart.get();
    const cartLines = cartProperties?.lines;
    console.log('cart lines', cartLines);

    let newCheckoutId = '';
    if (cartLines) {
      const convertedLines: CheckoutLineItemInput[] = cartLines?.nodes.map(
        (line) => {
          console.log('cart line', line);

          return {
            quantity: line.quantity || 0,
            variantId: line.merchandise.id,
          };
        },
      );
      const {checkoutCreate} = await storefront.mutate(
        CREATE_CHECKOUT_MUTATION,
        {
          variables: {
            lineItems: convertedLines,
          },
        },
      );
      newCheckoutId = checkoutCreate?.checkout?.id || '';
    } else {
      const {checkoutCreate} = await storefront.mutate(
        CREATE_CHECKOUT_MUTATION_EMPTY,
      );
      newCheckoutId = checkoutCreate?.checkout?.id || '';
    }

    // console.log('cartItems', cartItems?.lines);

    if (newCheckoutId === '') {
      throw new Error("Couldn't create new checkout");
    }
    console.log('new checkout ID', newCheckoutId);

    const {checkoutCustomerAssociateV2} = await storefront.mutate(
      CHECKOUT_CUSTOMER_ASSOCIATE,
      {
        variables: {
          checkoutId: newCheckoutId,
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
            checkoutId: newCheckoutId,
            shippingAddress:
              checkoutCustomerAssociateV2.customer.defaultAddress,
          },
        },
      );
      console.log(
        'updated checkout shipping address',
        JSON.stringify(checkoutShippingAddressUpdateV2?.checkout),
      );

      if (cartProperties) {
        const cartResult = await cart.updateBuyerIdentity({
          customerAccessToken: customerAccessToken.accessToken,
          email: checkoutCustomerAssociateV2.customer.email,
          countryCode: storefront.i18n.country,
          deliveryAddressPreferences: [
            {
              deliveryAddress: {
                firstName:
                  checkoutCustomerAssociateV2.customer.defaultAddress.firstName,
                lastName:
                  checkoutCustomerAssociateV2.customer.defaultAddress.firstName,
                address1:
                  checkoutCustomerAssociateV2.customer.defaultAddress.address1,
                address2:
                  checkoutCustomerAssociateV2.customer.defaultAddress.address2,
                city: checkoutCustomerAssociateV2.customer.defaultAddress.city,
                province:
                  checkoutCustomerAssociateV2.customer.defaultAddress.province,
                zip: checkoutCustomerAssociateV2.customer.defaultAddress.zip,
                country:
                  checkoutCustomerAssociateV2.customer.defaultAddress?.country,
              },
            },
          ],
        });
        console.log(cartResult.cart.deliveryGroups);
      }
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
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <AuthLayout>
      <div className="grid gap-2">
        <h1 className="pixel-font 2xl:text-5xl lg:text-4xl text-3xl">
          WELCOME BACK
        </h1>
        <h1 className="pixel-font 2xl:text-5xl lg:text-4xl text-3xl">
          ALTLIER!
        </h1>
      </div>
      <Form className="mt-8 md:max-w-[450px]" method="POST">
        <fieldset className="gap-6">
          <input
            className="input-box"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email"
            aria-label="Email"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
          <input
            className="input-box"
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
        {!!error && (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        )}
        <div className="flex mt-6 gap-6 items-center justify-between">
          <button
            disabled={isSubmitting}
            type="submit"
            className={`btn homepage-btn max-w-[400px] ${
              isSubmitting ? 'btn-dark-submitted' : 'btn-dark'
            }`}
          >
            Login
          </button>
          <Link
            className="text-emerald-light whitespace-nowrap"
            to="/account/recover"
          >
            Forgot password?
          </Link>
        </div>
        <div className="mt-6 w-full grid justify-center">
          <p className="text-neutral-400">
            {`Don't have an account? Anyone can be an Altlier!`}
          </p>
          <Link
            className="mt-2 text-emerald-light justify-self-center"
            to="/account/register"
          >
            Sign Up Here!
          </Link>
        </div>
      </Form>
    </AuthLayout>
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
  mutation checkoutCreate($lineItems: [CheckoutLineItemInput!]!) {
    checkoutCreate(input: {lineItems: $lineItems}) {
      checkout {
        id
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
  fragment LineItem on CheckoutLineItem {
    id
    title
    quantity
    variant {
      id
    }
  }
` as const;

const CREATE_CHECKOUT_MUTATION_EMPTY = `#graphql
  mutation checkoutCreateEmpty {
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
