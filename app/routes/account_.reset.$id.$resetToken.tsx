import {type ActionFunctionArgs, json, redirect} from '@shopify/remix-oxygen';
import {Form, useActionData, type MetaFunction, Link} from '@remix-run/react';
import {AuthLayout} from '~/components/AuthLayout';
import password_reset from '../../public/login-page-images/password_reset.jpg';

type ActionResponse = {
  error: string | null;
};

export const meta: MetaFunction = () => {
  return [{title: 'Reset Password'}];
};

export async function action({request, context, params}: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }
  const {id, resetToken} = params;
  const {session, storefront} = context;

  try {
    if (!id || !resetToken) {
      throw new Error('customer token or id not found');
    }

    const form = await request.formData();
    const password = form.has('password') ? String(form.get('password')) : '';
    const passwordConfirm = form.has('passwordConfirm')
      ? String(form.get('passwordConfirm'))
      : '';
    const validInputs = Boolean(password && passwordConfirm);
    if (validInputs && password !== passwordConfirm) {
      throw new Error('Please provide matching passwords');
    }

    const {customerReset} = await storefront.mutate(CUSTOMER_RESET_MUTATION, {
      variables: {
        id: `gid://shopify/Customer/${id}`,
        input: {password, resetToken},
      },
    });

    if (customerReset?.customerUserErrors?.length) {
      throw new Error(customerReset?.customerUserErrors[0].message);
    }

    if (!customerReset?.customerAccessToken) {
      throw new Error('Access token not found. Please try again.');
    }
    session.set('customerAccessToken', customerReset.customerAccessToken);

    return redirect('/account', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

export default function Reset() {
  const action = useActionData<ActionResponse>();

  return (
    <AuthLayout staticImage={{src: password_reset, alt: 'password forgotten'}}>
      <div className="grid gap-6 md:gap-2">
        <h1 className="pixel-font 2xl:text-3xl lg:text-xl md:text-lg">
          Reset Password
        </h1>
        <p className="mt-2 text-neutral-400">
          Enter a new password for your account
        </p>
      </div>
      <Form className="mt-8 md:max-w-[450px]" method="POST">
        <fieldset className="gap-6">
          <input
            className="input-box"
            aria-label="Password"
            autoComplete="current-password"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            id="password"
            minLength={8}
            name="password"
            placeholder="Password"
            required
            type="password"
          />
          <input
            className="input-box"
            aria-label="Re-enter password"
            autoComplete="current-password"
            id="passwordConfirm"
            minLength={8}
            name="passwordConfirm"
            placeholder="Re-enter password"
            required
            type="password"
          />
        </fieldset>
        <div className="flex mt-6 w-full gap-6 items-center justify-between">
          <button
            type="submit"
            className="btn homepage-btn btn-light max-w-[400px]"
          >
            Reset
          </button>
          <Link
            className="text-emerald-light whitespace-nowrap"
            to="/account/recover"
          >
            Back To Login!
          </Link>
        </div>
      </Form>
    </AuthLayout>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerreset
const CUSTOMER_RESET_MUTATION = `#graphql
  mutation customerReset(
    $id: ID!,
    $input: CustomerResetInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
