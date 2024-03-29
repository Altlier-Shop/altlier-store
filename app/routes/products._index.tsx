import {Suspense} from 'react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import type {
  FooterQuery,
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import {FOOTER_QUERY} from '~/routes/_index';
import {Image, Money, getSelectedProductOptions} from '@shopify/hydrogen';
import {Footer, FooterMobile} from '~/components/Footer';
import CartIcon from '~/components/svg-components/CartIcon';
import ProfileIcon from '~/components/svg-components/ProfileIcon';
import {openAside} from '~/utils';
import {validateCustomerAccessToken} from '~/root';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Products`}];
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {storefront, cart, session} = context;
  const customerAccessToken = session.get('customerAccessToken');

  // await the query for the critical product data
  const {products} = await storefront.query(PRODUCTS_QUERY);
  // defer the footer query (below the fold)
  const footerPromise = context.storefront.query(FOOTER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });

  // validate the customer access token is valid
  const {isLoggedIn} = await validateCustomerAccessToken(
    session,
    customerAccessToken,
  );

  const cartPromise = cart.get();

  if (!products) {
    throw new Response(null, {status: 404});
  }

  return defer({
    products,
    footer: footerPromise,
    cart: cartPromise,
    isLoggedIn,
  });
}

export default function Product() {
  const {products, footer, cart, isLoggedIn} = useLoaderData<typeof loader>();

  return (
    <>
      {products.nodes.length > 0 ? (
        <div>
          <div className="w-full bg-altlierBlue py-1 flex justify-center">
            <span className="text-white text-center text-sm default-font-bold">
              Free Shipping For Orders Above USD200
            </span>
          </div>
          <div className={`fixed z-50 top-9 flex gap-6 right-6`}>
            <button onClick={openAside} className="pointer-events-auto">
              <Suspense>
                <Await resolve={cart}>
                  {(cart) => (
                    <div className="w-8 h-8">
                      <CartIcon
                        notification={
                          cart && cart.totalQuantity > 0 ? true : false
                        }
                      />
                    </div>
                  )}
                </Await>
              </Suspense>
            </button>
            <a
              href={isLoggedIn ? '/account' : '/account/login'}
              className="pointer-events-auto w-8 h-8"
            >
              <ProfileIcon notification={false} />
            </a>
          </div>

          <ProductMain products={products.nodes} />
          {/* TODO: footer needs to be mobile and non-sticky */}
          <Suspense>
            <Await resolve={footer}>
              {(footer) => <FooterMobile menu={footer?.menu} shop={null} />}
            </Await>
          </Suspense>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

function ProductImage({image}: {image: ProductVariantFragment['image']}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image">
      <img src={image.url} alt="product" />
    </div>
  );
}

function ProductMain({products}: {products: ProductFragment[]}) {
  return (
    <>
      <div className="h-full grid grid-cols-2 gap-4 p-6 mt-16">
        {products.map((product: any) => (
          <Link to={`/products/${product.handle}`} key={product.id}>
            <div className="border border-altlierBlue h-full bg-altlierBlue">
              <div>
                <ProductImage
                  image={product.images.nodes[product.images.nodes.length - 1]}
                />
              </div>
              <div className="p-1 text-xs">
                <h1 className="text-white">{product.title}</h1>
                <h1 className="text-white">
                  {product.priceRange.minVariantPrice.currencyCode}
                  {Math.floor(product.priceRange.minVariantPrice.amount)}
                </h1>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

const PRODUCT_MOBILE_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    description
    images(first:6, reverse:true) {
      nodes {
        __typename
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    seo {
      description
      title
    }
  }
` as const;

const PRODUCTS_QUERY = `#graphql
  query Products ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...Product
      }
    }
  }
  ${PRODUCT_MOBILE_FRAGMENT}
` as const;
