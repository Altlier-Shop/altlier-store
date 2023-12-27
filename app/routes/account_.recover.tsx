import {
  json,
  redirect,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from '@shopify/remix-oxygen';
import {Form, Link, useActionData} from '@remix-run/react';
import GridPage from '~/components/startpage-components/GridPage';
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

export default function Recover() {
  const action = useActionData<ActionResponse>();

  return (
    <div className="account-recover">
      <div className="login w-screen h-screen flex">
        <div className="flex w-1/2 h-full bg-root-secondary relative">
          <GridPage />
          <div className="absolute h-full w-full grid items-center justify-items-center">
            <img
              className="w-2/3"
              src={password_reset}
              alt="password forgotten"
            />
          </div>
        </div>
        <div className="w-1/2 h-full bg-root-primary relative">
          {action?.resetRequested ? (
            <div className="mt-[25%] 3xl:px-[15%] px-[10%]">
              <div className="grid gap-6 md:gap-2">
                <h1 className="pixel-font 2xl:text-3xl lg:text-xl md:text-lg">
                  Check Your Email!
                </h1>
                <p className="mt-2">
                  If that email address is in our system, you will receive an
                  email with instructions about how to reset your password in a
                  few minutes.
                </p>
              </div>
              <Link
                className="flex mt-6 w-full text-emerald-light"
                to="/account/login"
              >
                Back To Login!
              </Link>
            </div>
          ) : (
            <div className="mt-[25%] 3xl:px-[15%] px-[10%]">
              <div className="grid gap-6 md:gap-2">
                <h1 className="pixel-font 2xl:text-3xl lg:text-xl md:text-lg">
                  Forgot Password ¯\_(ツ)_/¯
                </h1>

                <p className="mt-2 text-neutral-400">
                  Enter your email address to receive a link to reset your
                  password!
                </p>
              </div>

              <Form method="POST">
                <fieldset className="gap-6 mt-[10%]">
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

                {action?.error ? (
                  <p>
                    <mark>
                      <small>{action.error}</small>
                    </mark>
                  </p>
                ) : (
                  <br />
                )}
                <div className="flex mt-8 w-full gap-6 items-center">
                  <button
                    type="submit"
                    className="btn homepage-btn btn-light w-full text-xl"
                  >
                    Send Email
                  </button>
                  <Link
                    className="root-secondaryspace-nowrap grid justify-end text-emerald-light"
                    to="/account/login"
                  >
                    I remember again!
                  </Link>
                </div>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
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
