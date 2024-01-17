import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData} from '@remix-run/react';
import {AuthLayout} from '~/components/AuthLayout';
import password_reset from '../../public/login-page-images/password_reset.png';

type ActionResponse = {
  error?: string;
  resetRequested?: boolean;
};

export async function loader({context}: LoaderFunctionArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');
  if (customerAccessToken) {
    return redirect('/account');
  }

  return json({});
}

export async function action({request, context}: ActionFunctionArgs) {
  const {storefront} = context;
  const form = await request.formData();
  const email = form.has('email') ? String(form.get('email')) : null;

  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }

  try {
    if (!email) {
      throw new Error('Please provide an email.');
    }
    await storefront.mutate(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: unknown) {
    const resetRequested = false;
    if (error instanceof Error) {
      return json({error: error.message, resetRequested}, {status: 400});
    }
    return json({error, resetRequested}, {status: 400});
  }
}

function RecoverRequestedMessage() {
  return (
    <>
      <div className="grid gap-2">
        <h1 className="pixel-font 2xl:text-3xl lg:text-xl text-lg">
          Check Your Email!
        </h1>
        <p className="mt-2">
          If that email address is in our system, you will receive an email with
          instructions about how to reset your password in a few minutes.
        </p>
      </div>
      <Link className="mt-6 w-full text-emerald-light" to="/account/login">
        Back To Login!
      </Link>
    </>
  );
}

function RecoverForm({error}: {error: string | undefined}) {
  return (
    <>
      <div className="grid gap-2">
        <h1 className="pixel-font 2xl:text-5xl lg:text-4xl text-3xl">
          Forgot Password ¯\_(ツ)_/¯
        </h1>
        <p className="mt-2 text-neutral-400">
          Enter your email address to receive a link to reset your password!
        </p>
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
        </fieldset>
        {!!error && (
          <p>
            <mark>
              <small>{error}</small>
            </mark>
          </p>
        )}
        <div className="flex mt-6 w-full gap-6 items-center justify-between">
          <button
            type="submit"
            className="btn homepage-btn btn-light max-w-[400px] text-xl"
          >
            Send Email
          </button>
          <Link
            className="text-emerald-light whitespace-nowrap"
            to="/account/login"
          >
            I remember again!
          </Link>
        </div>
      </Form>
    </>
  );
}

export default function Recover() {
  const action = useActionData<ActionResponse>();
  return (
    <AuthLayout staticImage={{src: password_reset, alt: 'password forgotten'}}>
      {action?.resetRequested ? (
        <RecoverRequestedMessage />
      ) : (
        <RecoverForm error={action?.error} />
      )}
    </AuthLayout>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerrecover
const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover(
    $email: String!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
