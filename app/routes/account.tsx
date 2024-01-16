import {Form, NavLink, Outlet, useLoaderData} from '@remix-run/react';
import {json, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import type {CustomerFragment} from 'storefrontapi.generated';
import profileImg from 'public/Altlier_Circular_light.png';

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

type StatusColor = 'green' | 'orange' | 'red' | 'gray';

interface Status {
  text: string;
  color: StatusColor;
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
  console.log('customer:', customer);

  const status: Record<string, Status> = {
    confirmed: {text: 'Order Confirmed', color: 'green'},
    pending: {text: 'Pending Delivery', color: 'orange'},
    cancelled: {text: 'Order Cancelled', color: 'red'},
    refunded: {text: 'Refunded', color: 'gray'},
    delivered: {text: 'Order Delivered', color: 'green'},
    nft_deposited: {text: 'NFT Deposited', color: 'green'},
  };

  const orders = [
    {
      id: '123456AB',
      status: 'confirmed',
      date: '30 Dec 2023',
      amount: '500 USD',
    },
    {id: '123456AB', status: 'pending', date: '30 Dec 2023', amount: '500 USD'},
    {
      id: '123456AB',
      status: 'cancelled',
      date: '30 Dec 2023',
      amount: '500 USD',
    },
    {
      id: '123456AB',
      status: 'refunded',
      date: '30 Dec 2023',
      amount: '500 USD',
    },
    {
      id: '123456AB',
      status: 'delivered',
      date: '30 Dec 2023',
      amount: '500 USD',
    },
    {
      id: '123456AB',
      status: 'nft_deposited',
      date: '30 Dec 2023',
      amount: '500 USD',
    },
  ];
  // console.log('customer.altpoints:', customer?.altpoints);

  // console.log('customer address: ', customer.defaultAddress);
  // console.log('customer email: ', customer.email);
  // console.log('customer firstname: ', customer.firstName);
  // console.log('customer lastname: ', customer.lastName);
  //console.log('customer firstname: ', customer?.digitalWalletAddress);
  // console.log('customer payment info: ', customer.);

  return (
    <div className="account">
      <div className="mx-4 lg:mx-0 md:max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 mt-28">
        <div className="lg:col-span-2 h-24 bg-altlierBlue rounded-full flex gap-4">
          <img
            src={profileImg}
            alt="Avatar"
            className="object-cover h-20 w-20 m-2 rounded-full"
          />
          <div className="h-24 flex flex-col justify-center">
            <div>
              <h1 className="text-root-primary uppercase text-2xl">
                Welcome Back!
              </h1>
              <p className="text-root-primary text-lg font-bold">
                {customer.firstName} {customer.lastName}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3">
          <p className="text-root-tertiary">Available Alt Points</p>
          <p className="text-altlierBlue text-5xl font-bold">
            {customer.altpoints?.value || 0}
          </p>
        </div>
        <div className="flow-root lg:col-span-2">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-gray-400 border ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
              <div className="py-2 px-8 font-bold border-b border-gray-400 bg-root-primary">
                Account Settings
              </div>
              <ul className="divide-y divide-gray-400">
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Name
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {customer.firstName} {customer.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Email
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Password
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        ********
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Reset
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Shipping Address
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        {customer.defaultAddress?.formatted}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Digital Wallet Address
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        ******** <br />
                        Your Wallet Address will be kept strictly confidential
                        and will only be used to deposit NFT's and rewards
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex min-w-0 gap-x-4">
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Payment
                      </p>
                      <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                        ********
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start">
                    <button className="text-sm leading-6 text-gray-900">
                      Update
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flow-root lg:col-span-3 overflow-y-auto">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden border-gray-400 border ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-root-primary border-b border-gray-400">
                  <tr>
                    <th
                      scope="col"
                      className="py-2 pl-8 pr-3 text-left text-sm font-semibold text-gray-900"
                    >
                      Purchase History
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      Change Order
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 text-left text-sm font-semibold text-gray-900"
                    >
                      Amount
                    </th>
                    <th scope="col" className="relative py-2 pl-3 pr-4 pr-8">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-5 pl-8 pr-3 text-sm">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              Order: {order.id}
                            </div>
                            <div className="mt-1 text-gray-500">
                              {order.date}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-5 text-sm text-gray-500 ${
                          status[order.status].color === 'green'
                            ? 'text-green-600'
                            : status[order.status].color === 'orange'
                            ? 'text-orange-600'
                            : status[order.status].color === 'red'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {status[order.status].text}
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <div className="text-gray-900">Refund</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        {order.amount}
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-8 text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
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
    <nav role="navigation">
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
      </NavLink>
      &nbsp;|&nbsp;
      <Logout />
    </nav>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;
      <button type="submit">Sign out</button>
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
