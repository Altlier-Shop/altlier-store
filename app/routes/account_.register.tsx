import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData, useNavigation} from '@remix-run/react';
import type {CustomerCreateMutation} from 'storefrontapi.generated';
import {AuthLayout} from '~/components/AuthLayout';

type ActionResponse = {
  error: string | null;
  newCustomer:
    | NonNullable<CustomerCreateMutation['customerCreate']>['customer']
    | null;
};

export async function loader({context}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (customerAccessToken) {
    return redirect('/account');
  }

  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  const {storefront, session} = context;
  const form = await request.formData();
  const email = String(form.has('email') ? form.get('email') : '');
  const password = form.has('password') ? String(form.get('password')) : null;
  const passwordConfirm = form.has('passwordConfirm')
    ? String(form.get('passwordConfirm'))
    : null;

  const validPasswords =
    password && passwordConfirm && password === passwordConfirm;

  const validInputs = Boolean(email && password);
  try {
    if (!validPasswords) {
      throw new Error('Passwords do not match');
    }

    if (!validInputs) {
      throw new Error('Please provide both an email and a password.');
    }

    const {customerCreate} = await storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {email, password},
      },
    });

    if (customerCreate?.customerUserErrors?.length) {
      throw new Error(customerCreate?.customerUserErrors[0].message);
    }

    const newCustomer = customerCreate?.customer;
    if (!newCustomer?.id) {
      throw new Error('Could not create customer');
    }

    // get an access token for the new customer
    const {customerAccessTokenCreate} = await storefront.mutate(
      REGISTER_LOGIN_MUTATION,
      {
        variables: {
          input: {
            email,
            password,
          },
        },
      },
    );

    if (!customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      throw new Error('Missing access token');
    }
    session.set(
      'customerAccessToken',
      customerAccessTokenCreate?.customerAccessToken,
    );

    return json(
      {error: null, newCustomer},
      {
        status: 302,
        headers: {
          'Set-Cookie': await session.commit(),
          Location: '/account',
        },
      },
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Register() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const data = useActionData<ActionResponse>();
  const error = data?.error || null;

  return (
    <AuthLayout>
      <div className="grid gap-2">
        <h1 className="pixel-font 2xl:text-5xl lg:text-4xl text-3xl">
          <span className="line-through">Chill</span>Shill
        </h1>
        <h1 className="pixel-font 2xl:text-5xl lg:text-4xl text-3xl">
          with us
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
          <input
            className="input-box"
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autoComplete="current-password"
            placeholder="Re-enter password"
            aria-label="Re-enter password"
            minLength={8}
            required
          />
        </fieldset>
        {error && (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        )}
        <div className="flex mt-6 w-full gap-6 items-center justify-between">
          <button
            disabled={isSubmitting}
            type="submit"
            className={`btn homepage-btn max-w-[400px] lg:text-2xl text-lg ${
              isSubmitting ? 'btn-dark-submitted' : 'btn-dark'
            }`}
          >
            Register
          </button>
          <Link
            className="text-emerald-light whitespace-nowrap"
            to="/account/login"
          >
            Have An Account?
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerCreate
const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation customerCreate(
    $input: CustomerCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraccesstokencreate
const REGISTER_LOGIN_MUTATION = `#graphql
  mutation registerLogin(
    $input: CustomerAccessTokenCreateInput!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
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
