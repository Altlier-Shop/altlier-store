import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {CustomerFragment} from 'storefrontapi.generated';
import AccountProfile from './account.profile';
import Orders from './account.orders._index';

export function shouldRevalidate() {
  return true;
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const {session, storefront} = context;
  const {pathname} = new URL(request.url);
  const customerAccessToken = await session.get('customerAccessToken');
  const isLoggedIn = !!customerAccessToken?.accessToken;
  const isAccountHome = pathname === '/account' || pathname === '/account/';
  const isPrivateRoute =
    /^\/account\/(orders|orders\/.*|profile|addresses|addresses\/.*)$/.test(
      pathname,
    );

  if (!isLoggedIn) {
    if (isPrivateRoute || isAccountHome) {
      session.unset('customerAccessToken');
      return redirect('/account/login', {
        headers: {
          'Set-Cookie': await session.commit(),
        },
      });
    } else {
      // public subroute such as /account/login...
      return json({
        isLoggedIn: false,
        isAccountHome,
        isPrivateRoute,
        customer: null,
      });
    }
  } else {
    // loggedIn, default redirect to the orders page
    if (isAccountHome) {
      return redirect('/account/orders');
    }
  }

  try {
    const {customer} = await storefront.query(CUSTOMER_QUERY, {
      variables: {
        customerAccessToken: customerAccessToken.accessToken,
        country: storefront.i18n.country,
        language: storefront.i18n.language,
      },
      cache: storefront.CacheNone(),
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return json(
      {isLoggedIn, isPrivateRoute, isAccountHome, customer},
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('There was a problem loading account', error);
    session.unset('customerAccessToken');
    return redirect('/account/login', {
      headers: {
        'Set-Cookie': await session.commit(),
      },
    });
  }
}

export default function Acccount() {
  const {customer, isPrivateRoute, isAccountHome} =
    useLoaderData<typeof loader>();

  if (!isPrivateRoute && !isAccountHome) {
    return <Outlet context={{customer}} />;
  }

  return (
    <AccountLayout customer={customer as CustomerFragment}>
      <br />
      <br />
      <Outlet context={{customer}} />
    </AccountLayout>
  );
}

function AccountLayout({
  customer,
  children,
}: {
  customer: CustomerFragment;
  children: React.ReactNode;
}) {
  const heading = customer
    ? customer.firstName
      ? `Welcome, ${customer.firstName}`
      : `Welcome to your account.`
    : 'Account Details';
  // console.log('customer.altpoints:', customer?.altpoints);

  // console.log('customer address: ', customer.defaultAddress);
  // console.log('customer email: ', customer.email);
  // console.log('customer firstname: ', customer.firstName);
  // console.log('customer lastname: ', customer.lastName);
  //console.log('customer firstname: ', customer?.digitalWalletAddress);
  // console.log('customer payment info: ', customer.);

  return (
    <div className="account">
      <AccountMenu />
      <h1>{heading}</h1>
      <br />
      <div className="w-full h-screen flex gap-12 items-center">
        <div className="w-1/4">Account setting</div>
        <div className="w-3/4">Purchase History</div>
      </div>

      {children}
    </div>
  );
}

function AccountMenu() {
  function isActiveStyle({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) {
    return {
      fontWeight: isActive ? 'bold' : undefined,
      color: isPending ? 'grey' : 'altlierBlue',
    };
  }

  return (
    <div>
      <AccountProfile />
      <Orders />
      {/* <nav role="navigation">
        <NavLink to="/account/orders" style={isActiveStyle}>
          Orders &nbsp;
        </NavLink>
        &nbsp;|&nbsp;
        <NavLink to="/account/profile" style={isActiveStyle}>
          &nbsp; Profile &nbsp;
        </NavLink>
        &nbsp;|&nbsp;
        <NavLink to="/account/addresses" style={isActiveStyle}>
          &nbsp; Addresses &nbsp;
        </NavLink> */}
      &nbsp;|&nbsp;
      <Logout />
      {/* </nav> */}
    </div>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;<button type="submit">Sign out</button>
    </Form>
  );
}

export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    acceptsMarketing
    addresses(first: 6) {
      nodes {
        ...Address
      }
    }
    defaultAddress {
      ...Address
    }
    email
    firstName
    lastName
    numberOfOrders
    phone
    altpoints: metafield(namespace: "customer.metafields.custom.altpoints", key: "customer.metafields.custom.altpoints") {
      value
      type
    }
  }
  fragment Address on MailingAddress {
    id
    formatted
    firstName
    lastName
    company
    address1
    address2
    country
    province
    city
    zip
    phone
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/customer
export const CUSTOMER_QUERY = `#graphql
  query Customer(
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
` as const;
