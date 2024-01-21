import {
  Form,
  NavLink,
  Outlet,
  useLoaderData,
  type MetaFunction,
} from '@remix-run/react';
import {json, redirect} from '@shopify/remix-oxygen';
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
// import type {CustomerFragment} from 'storefrontapi.generated';
import profileImg from 'public/Altlier_Circular_light.png';
import {useState} from 'react';
import {Money} from '@shopify/hydrogen';
import type {
  CustomerUpdateInput,
  MailingAddressInput,
} from '@shopify/hydrogen/storefront-api-types';

export function shouldRevalidate() {
  return true;
}

export const meta: MetaFunction = () => {
  return [{title: 'Altlier | User Profile'}];
};

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
    <AccountLayout customer={customer as any}>
      <br />
      <br />
      <Outlet context={{customer}} />
    </AccountLayout>
  );
}

export async function action({request, context}: ActionFunctionArgs) {
  const {session, storefront} = context;
  if (request.method !== 'POST') {
    return json({error: 'Method not allowed'}, {status: 405});
  }
  const customerAccessToken = await session.get('customerAccessToken');
  if (!customerAccessToken) {
    return json({error: 'Unauthorized'}, {status: 401});
  }
  try {
    const data: any = await request.json();
    if (data && Object.keys(data).length > 0) {
      // Update the Customer details on Storefront
      const customer: CustomerUpdateInput = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        password: data.password,
      };
      // update customer
      const updatedCustomer = await storefront.mutate(
        CUSTOMER_UPDATE_MUTATION,
        {
          variables: {
            customerAccessToken: customerAccessToken.accessToken,
            customer,
          },
        },
      );
      console.log('updated customer:', updatedCustomer);
      await updateCustomerAddress(
        data.defaultAddress,
        storefront,
        customerAccessToken,
        data.addressFormRequest,
      );
      // Save the default address
    } else {
      throw new Error('No data received');
    }
  } catch (err: any) {
    return json({error: err.message, customer: null}, {status: 400});
  }

  return json({}, {status: 201});
}

async function updateCustomerAddress(
  addressData: any,
  storefront: any,
  customerAccessToken: any,
  requestMethod: string,
) {
  try {
    const addressId = addressData?.id ? addressData?.id : 'new';

    if (!customerAccessToken) {
      return json({error: {[addressId]: 'Unauthorized'}}, {status: 401});
    }
    const {accessToken} = customerAccessToken;

    const defaultAddress = addressData;

    const address: MailingAddressInput = {};
    const keys: (keyof MailingAddressInput)[] = [
      'address1',
      'address2',
      'city',
      'company',
      'country',
      'firstName',
      'lastName',
      'phone',
      'province',
      'zip',
    ];

    for (const key of keys) {
      const value = addressData[key];
      if (typeof value === 'string') {
        address[key] = value;
      }
    }
    // console.log('requestMethod:', requestMethod);

    switch (requestMethod) {
      case 'POST': {
        // handle new address creation
        try {
          const {customerAddressCreate} = await storefront.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {customerAccessToken: accessToken, address},
            },
          );

          if (customerAddressCreate?.customerUserErrors?.length) {
            const error = customerAddressCreate.customerUserErrors[0];
            throw new Error(error.message);
          }

          const createdAddress = customerAddressCreate?.customerAddress;
          if (!createdAddress?.id) {
            throw new Error(
              'Expected customer address to be created, but the id is missing',
            );
          }

          if (defaultAddress) {
            const createdAddressId = decodeURIComponent(createdAddress.id);
            const {customerDefaultAddressUpdate} = await storefront.mutate(
              UPDATE_DEFAULT_ADDRESS_MUTATION,
              {
                variables: {
                  customerAccessToken: accessToken,
                  addressId: createdAddressId,
                },
              },
            );

            if (customerDefaultAddressUpdate?.customerUserErrors?.length) {
              const error = customerDefaultAddressUpdate.customerUserErrors[0];
              throw new Error(error.message);
            }
          }

          return json({error: null, createdAddress, defaultAddress});
        } catch (error: unknown) {
          if (error instanceof Error) {
            return json({error: {[addressId]: error.message}}, {status: 400});
          }
          return json({error: {[addressId]: error}}, {status: 400});
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {customerAddressUpdate} = await storefront.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                customerAccessToken: accessToken,
                id: decodeURIComponent(addressId),
              },
            },
          );

          const updatedAddress = customerAddressUpdate?.customerAddress;

          if (customerAddressUpdate?.customerUserErrors?.length) {
            const error = customerAddressUpdate.customerUserErrors[0];
            throw new Error(error.message);
          }

          if (defaultAddress) {
            const {customerDefaultAddressUpdate} = await storefront.mutate(
              UPDATE_DEFAULT_ADDRESS_MUTATION,
              {
                variables: {
                  customerAccessToken: accessToken,
                  addressId: decodeURIComponent(addressId),
                },
              },
            );

            if (customerDefaultAddressUpdate?.customerUserErrors?.length) {
              const error = customerDefaultAddressUpdate.customerUserErrors[0];
              throw new Error(error.message);
            }
          }

          return json({error: null, updatedAddress, defaultAddress});
        } catch (error: unknown) {
          if (error instanceof Error) {
            return json({error: {[addressId]: error.message}}, {status: 400});
          }
          return json({error: {[addressId]: error}}, {status: 400});
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {customerAddressDelete} = await storefront.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {customerAccessToken: accessToken, id: addressId},
            },
          );

          if (customerAddressDelete?.customerUserErrors?.length) {
            const error = customerAddressDelete.customerUserErrors[0];
            throw new Error(error.message);
          }
          return json({error: null, deletedAddress: addressId});
        } catch (error: unknown) {
          if (error instanceof Error) {
            return json({error: {[addressId]: error.message}}, {status: 400});
          }
          return json({error: {[addressId]: error}}, {status: 400});
        }
      }

      default: {
        return json(
          {error: {[addressId]: 'Method not allowed'}},
          {status: 405},
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return json({error: error.message}, {status: 400});
    }
    return json({error}, {status: 400});
  }
}

type StatusColor =
  | 'text-green-600'
  | 'text-orange-600'
  | 'text-red-600'
  | 'text-gray-600';

interface Status {
  text: string;
  color: StatusColor;
}

function AccountLayout({
  customer,
  children,
}: {
  customer: any;
  children: React.ReactNode;
}) {
  const [editFieldId, setEditFieldId] = useState('');
  const [customerEdit, setCustomer] = useState<any>(customer);

  async function saveCustomerData() {
    // console.log('save customerEdit:', customerEdit);

    const response = await fetch('/account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerEdit),
    });

    const result = await response.json();
    // console.log(result);
  }

  const orderStatus: Record<string, Status> = {
    FULFILLED: {text: 'Order Confirmed', color: 'text-green-600'},
    UNFULFILLED: {text: 'Pending Confirmation', color: 'text-orange-600'},
    CANCELLED: {text: 'Order Cancelled', color: 'text-red-600'},
    REFUNDED: {text: 'Order Refunded', color: 'text-gray-600'},
    UNKNOWN: {text: 'Order Status Unknown', color: 'text-gray-600'},
    // delivered: {text: 'Order Delivered', color: 'text-green-600'},
    // nft_deposited: {text: 'NFT Deposited', color: 'text-green-600'},
  };

  function determineFullfillmentStatus(
    cancelReason: string | null,
    fulfillmentStatus: string,
    paymentStatus: string,
  ): {color: string; text: string} {
    if (cancelReason) {
      return orderStatus.CANCELLED;
    } else if (fulfillmentStatus === 'FULFILLED' && paymentStatus === 'PAID') {
      return orderStatus.FULFILLED;
    } else if (
      fulfillmentStatus === 'UNFULFILLED' &&
      paymentStatus === 'PAID'
    ) {
      return orderStatus.UNFULFILLED;
    } else if (paymentStatus === 'REFUNDED') {
      return orderStatus.REFUNDED;
    } else {
      return orderStatus.UNKNOWN;
    }
  }

  let altpoints = 0;
  customer.orders.nodes.forEach((order: any) => {
    altpoints += Math.floor(Number(order.currentTotalPrice.amount));
  });

  const address = {
    address1: customerEdit.defaultAddress?.address1 || '',
    zip: customerEdit.defaultAddress?.zip || '',
    city: customerEdit.defaultAddress?.city || '',
    country: customerEdit.defaultAddress?.country || '',
  };
  if (customer.defaultAddress) {
    customerEdit.addressFormRequest = 'PUT';
  } else {
    customerEdit.addressFormRequest = 'POST';
  }

  return (
    <div className="h-screen">
      <div className="mx-4 lg:mx-0 md:max-w-7xl h-3/4 grid grid-cols-1 lg:grid-cols-5 gap-8 mt-28">
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
              <p className="text-root-primary text-4xl default-font-bold">
                {customerEdit.firstName?.toUpperCase() || ''}
              </p>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <p className="text-neutral-400  text-xl">Available Alt Points:</p>
          <p className="text-altlierBlue text-5xl default-font-bold">
            {altpoints}
          </p>
        </div>
        <div className="lg:col-span-1">
          <AccountMenu />
        </div>
        <div className="lg:col-span-2">
          <div className="border-gray-400 border ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
            <div className="py-2 px-8 default-font-bold text-lg border-b border-gray-400 bg-root-primary">
              Account Settings
            </div>
            {customerEdit ? (
              <ul className="divide-y divide-gray-400">
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex w-full gap-x-4">
                    <div className="flex-auto w-full">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Name
                      </p>
                      <div className="mt-1 truncate text-xs leading-5 [&>*]:text-neutral-400 w-full">
                        {editFieldId === 'name' ? (
                          <div className="flex flex-col gap-2 w-full">
                            <input
                              id="firstname"
                              type="text"
                              className="py-1 px-2 rounded-full w-full "
                              defaultValue={customerEdit.firstName || ''}
                              placeholder="First Name"
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  firstName: e.target.value,
                                })
                              }
                            />
                            <input
                              id="lastname"
                              type="text"
                              className="py-1 px-2 rounded-full w-full "
                              defaultValue={customerEdit.lastName || ''}
                              placeholder="Last Name"
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  lastName: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <span className="w-full text-neutral-400">
                            {customerEdit?.firstName || ''}{' '}
                            {customerEdit?.lastName || ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start [&>*]:text-neutral-400">
                    <button
                      onClick={() => setEditFieldId('name')}
                      className="text-sm leading-6"
                    >
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex w-full gap-x-4">
                    <div className="flex-auto w-full">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Email
                      </p>
                      <div className="mt-1 truncate text-xs leading-5 text-gray-500 w-full [&>*]:text-neutral-400">
                        {editFieldId === 'email' ? (
                          <div className="flex gap-2 w-full">
                            <input
                              id="email"
                              type="text"
                              className="py-1 px-2 rounded-full w-full"
                              defaultValue={customerEdit.email}
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <span className="w-full">{customerEdit.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start [&>*]:text-neutral-400">
                    <button
                      onClick={() => setEditFieldId('email')}
                      className="text-sm leading-6"
                    >
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex w-full gap-x-4">
                    <div className="flex-auto w-full">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Password
                      </p>
                      <div className="mt-1 truncate text-xs leading-5 [&>*]:text-neutral-400 w-full">
                        {editFieldId === 'password' ? (
                          <div className="flex gap-2 w-full">
                            <input
                              id="password"
                              type="password"
                              className="py-1 px-2 rounded-full w-full"
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  password: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <span className="w-full">********</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start [&>*]:text-neutral-400">
                    <button
                      onClick={() => setEditFieldId('password')}
                      className="text-sm leading-6"
                    >
                      Edit
                    </button>
                  </div>
                </li>
                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex w-full gap-x-4">
                    <div className="flex-auto w-full">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Shipping Address
                      </p>
                      <div className="mt-1 truncate text-xs leading-5 [&>*]:text-neutral-400 w-full">
                        {editFieldId === 'defaultAddress' ? (
                          <div className="flex flex-col gap-2 w-full">
                            <input
                              id="address"
                              type="text"
                              className={
                                address.address1
                                  ? 'py-1 px-2 rounded-full w-full'
                                  : 'py-1 px-2 rounded-full w-full border-red-500'
                              }
                              placeholder="Street and House Number"
                              defaultValue={address.address1}
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  defaultAddress: {
                                    ...customerEdit.defaultAddress,
                                    address1: e.target.value,
                                  },
                                })
                              }
                            />
                            <input
                              id="address"
                              type="text"
                              className={
                                address.zip
                                  ? 'py-1 px-2 rounded-full w-full'
                                  : 'py-1 px-2 rounded-full w-full border-red-500'
                              }
                              placeholder="Zip"
                              defaultValue={address.zip}
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  defaultAddress: {
                                    ...customerEdit.defaultAddress,
                                    zip: e.target.value,
                                  },
                                })
                              }
                            />
                            <input
                              id="address"
                              type="text"
                              className={
                                address.city
                                  ? 'py-1 px-2 rounded-full w-full'
                                  : 'py-1 px-2 rounded-full w-full border-red-500'
                              }
                              placeholder="City"
                              defaultValue={address.city}
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  defaultAddress: {
                                    ...customerEdit.defaultAddress,
                                    city: e.target.value,
                                  },
                                })
                              }
                            />
                            <input
                              id="address"
                              type="text"
                              className={
                                address.country
                                  ? 'py-1 px-2 rounded-full w-full'
                                  : 'py-1 px-2 rounded-full w-full border-red-500'
                              }
                              placeholder="Country"
                              defaultValue={address.country}
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  defaultAddress: {
                                    ...customerEdit.defaultAddress,
                                    country: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                        ) : (
                          <span className="w-full">
                            {address.address1} {address.zip} {address.city}{' '}
                            {address.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start [&>*]:text-neutral-400">
                    <button
                      onClick={() => setEditFieldId('defaultAddress')}
                      className="text-sm leading-6 "
                    >
                      Edit
                    </button>
                  </div>
                </li>

                <li className="flex justify-between gap-x-6 py-5 px-8">
                  <div className="flex w-full gap-x-4">
                    <div className="flex-auto w-full">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        Digital Wallet Address
                      </p>
                      <div className="mt-1 text-xs leading-5 [&>*]:text-neutral-400">
                        {editFieldId === 'digitalWalletAddress' ? (
                          <div className="flex gap-2">
                            <input
                              id="digitalWalletAddress"
                              type="password"
                              className="py-1 px-2 rounded-full w-full"
                              onChange={(e) =>
                                setCustomer({
                                  ...customerEdit,
                                  digitalWalletAddress: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <span>********</span>
                        )}
                      </div>
                      <span className="text-xs">
                        {`Your Wallet Address will be kept strictly confidential and
                      will only be used to deposit NFT's and rewards`}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-col justify-center w-[50px] items-start [&>*]:text-neutral-400">
                    <button
                      onClick={() => setEditFieldId('digitalWalletAddress')}
                      className="text-sm leading-6 "
                    >
                      Edit
                    </button>
                  </div>
                </li>
              </ul>
            ) : null}
          </div>
          <div className="flex justify-end">
            <button
              onClick={saveCustomerData}
              className="btn homepage-btn btn-dark mt-4 w-1/4 text-lg"
            >
              Save
            </button>
          </div>
        </div>
        <div className="lg:col-span-3 min-h-[500px] h-screen/2 overflow-y-scroll">
          <div className="border-gray-400  border ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
            <table className="divide-y divide-gray-300 w-full">
              <thead className="sticky top-0 z-10 bg-root-primary border-gray-400 border-b">
                <tr>
                  <th
                    scope="col"
                    className="py-2 pl-8 pr-3 text-left  font-semibold text-gray-900 default-font-bold text-lg"
                  >
                    Purchase History
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left  font-semibold text-gray-900 default-font-bold text-lg"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left  font-semibold text-gray-900 default-font-bold text-lg"
                  >
                    Edit Order
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left font-semibold text-gray-900 default-font-bold text-lg"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="relative py-2 pl-3 pr-4 pr-8 default-font-bold text-lg"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {customerEdit.orders && customerEdit.orders.nodes.length > 0 ? (
                  customerEdit.orders.nodes.map((order: any) => (
                    <tr key={order.id}>
                      <td className="whitespace-nowrap py-5 pl-8 pr-3 text-sm">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              Order: {order.orderNumber}
                            </div>
                            <div className="mt-1 text-gray-500">
                              {order.processedAt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-5 text-sm text-gray-500 ${
                          determineFullfillmentStatus(
                            order.cancelReason,
                            order.fulfillmentStatus,
                            order.financialStatus,
                          ).color
                        }`}
                      >
                        {
                          determineFullfillmentStatus(
                            order.cancelReason,
                            order.fulfillmentStatus,
                            order.financialStatus,
                          ).text
                        }
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <a
                          href={`mailto: hello@altlier.co?subject=Refund Request: #${order.orderNumber}&body=Hello, my name is ${customer.firstName} ${customer.lastName} I would like to request a refund for my order #${order.orderNumber}`}
                          className="text-gray-900"
                        >
                          {order.financialStatus !== 'REFUNDED'
                            ? 'Refund'
                            : '-'}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                        <Money data={order.currentTotalPrice} />
                      </td>
                      <td className="relative whitespace-nowrap py-5 pl-3 pr-8 text-right text-sm font-medium">
                        <a
                          href={order.statusUrl}
                          target="_blank"
                          className="text-indigo-600 hover:text-indigo-900"
                          rel="noreferrer"
                        >
                          View Order
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <div className=" w-full flex justify-center my-8">
                    {`You haven't made any orders yet.`}
                  </div>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountMenu() {
  return (
    <div className="flex justify-end">
      {/*<AccountProfile />*/}
      {/*<Orders />*7}
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

      <Logout />
      {/* </nav> */}
    </div>
  );
}

function Logout() {
  return (
    <Form className="account-logout" method="POST" action="/account/logout">
      &nbsp;
      <button type="submit" className="text-lg btn homepage-btn btn-light">
        Sign out
      </button>
    </Form>
  );
}

const ORDER_ITEM_FRAGMENT = `#graphql
  fragment OrderItem on Order {
    currentTotalPrice {
      amount
      currencyCode
    }
    financialStatus
    fulfillmentStatus
    id
    cancelReason
    lineItems(first: 10) {
      nodes {
        title
        variant {
          image {
            url
            altText
            height
            width
          }
        }
      }
    }
    orderNumber
    customerUrl
    statusUrl
    processedAt
  }
` as const;

export const CUSTOMER_FRAGMENT = `#graphql
  fragment Customer on Customer {
    acceptsMarketing
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
    numberOfOrders
    orders(
      sortKey: PROCESSED_AT,
      reverse: true,
      first: 250
    ) {
      nodes {
        ...OrderItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        endCursor
        startCursor
      }
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
  ${ORDER_ITEM_FRAGMENT}
` as const;

// export const CUSTOMER_ORDER_FRAGMENT = `#graphql
//   fragment CustomerOrders on Customer {
//     numberOfOrders
//     orders(
//       sortKey: PROCESSED_AT,
//       reverse: true,
//       first: $first,
//       last: $last,
//       before: $startCursor,
//       after: $endCursor
//     ) {
//       nodes {
//         ...OrderItem
//       }
//       pageInfo {
//         hasPreviousPage
//         hasNextPage
//         endCursor
//         startCursor
//       }
//     }
//   }
// ` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/customer
export const CUSTOMER_QUERY = `#graphql
  query Customer(
    $country: CountryCode
    $customerAccessToken: String!
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customer(customerAccessToken: $customerAccessToken) {
      ...Customer
    }
  }
  ${CUSTOMER_FRAGMENT}
` as const;

const CUSTOMER_UPDATE_MUTATION = `#graphql
  # https://shopify.dev/docs/api/storefront/latest/mutations/customerUpdate
  mutation customerUpdate(
    $customerAccessToken: String!,
    $customer: CustomerUpdateInput!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        acceptsMarketing
        email
        firstName
        id
        lastName
        phone
      }
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

// NOTE: https://shopify.dev/docs/api/storefront/2023-04/mutations/customeraddressupdate
const UPDATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressUpdate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $id: ID!
    $country: CountryCode
    $language: LanguageCode
 ) @inContext(country: $country, language: $language) {
    customerAddressUpdate(
      address: $address
      customerAccessToken: $customerAccessToken
      id: $id
    ) {
      customerAddress {
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

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerAddressDelete
const DELETE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressDelete(
    $customerAccessToken: String!,
    $id: ID!,
    $country: CountryCode,
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      customerUserErrors {
        code
        field
        message
      }
      deletedCustomerAddressId
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customerdefaultaddressupdate
const UPDATE_DEFAULT_ADDRESS_MUTATION = `#graphql
  mutation customerDefaultAddressUpdate(
    $addressId: ID!
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerDefaultAddressUpdate(
      addressId: $addressId
      customerAccessToken: $customerAccessToken
    ) {
      customer {
        defaultAddress {
          id
        }
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;

// NOTE: https://shopify.dev/docs/api/storefront/latest/mutations/customeraddresscreate
const CREATE_ADDRESS_MUTATION = `#graphql
  mutation customerAddressCreate(
    $address: MailingAddressInput!
    $customerAccessToken: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    customerAddressCreate(
      address: $address
      customerAccessToken: $customerAccessToken
    ) {
      customerAddress {
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
