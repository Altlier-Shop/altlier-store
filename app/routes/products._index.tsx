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
import {Footer} from '~/components/Footer';
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

  if (products.length === 0) {
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
          <div
            className={`fixed z-50 top-[55%] flex flex-col gap-6 right-5 2xl:right-20`}
          >
            <button onClick={openAside} className="pointer-events-auto">
              <Suspense>
                <Await resolve={cart}>
                  {(cart) => (
                    <div>
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
              className="pointer-events-auto"
            >
              <ProfileIcon notification={false} />
            </a>
          </div>
          <ProductMain products={products.nodes} />
          {/* TODO: footer needs to be mobile and non-sticky */}
          <Suspense>
            <Await resolve={footer}>
              {(footer) => (
                <Footer menu={footer?.menu} shop={null} full={true} />
              )}
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
      <div className="h-full grid grid-cols-2 gap-16">
        {products.map((product: any) => (
          <Link to={`/products/${product.handle}`} key={product.id}>
            <ProductImage image={product.images.nodes[0]} />
            <h1>{product.title}</h1>
            <h1>
              {product.priceRange.minVariantPrice.currencyCode}
              {Math.floor(product.priceRange.minVariantPrice.amount)}
            </h1>

            <br />
          </Link>
        ))}
      </div>
    </>
  );
}

function ProductPrice({
  selectedVariant,
}: {
  selectedVariant: ProductFragment['selectedVariant'];
}) {
  return (
    <div className="product-price">
      {selectedVariant?.compareAtPrice ? (
        <>
          <p>Sale</p>
          <br />
          <div className="product-price-on-sale">
            {selectedVariant ? <Money data={selectedVariant.price} /> : null}
            <s>
              <Money data={selectedVariant.compareAtPrice} />
            </s>
          </div>
        </>
      ) : (
        selectedVariant?.price && <Money data={selectedVariant?.price} />
      )}
    </div>
  );
}

const PRODUCT_MOBILE_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    description
    images(first: 1) {
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
