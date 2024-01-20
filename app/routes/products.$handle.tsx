import {Suspense, useState} from 'react';
import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';

import {FOOTER_QUERY} from '~/routes/_index';

import {getSelectedProductOptions} from '@shopify/hydrogen';

import {openAside} from '~/utils';
import CartIcon from '~/components/svg-components/CartIcon';
import ProfileIcon from '~/components/svg-components/ProfileIcon';
import {validateCustomerAccessToken} from '~/root';
import {Footer} from '~/components/Footer';
import TopProduct from '~/components/productpage-components/TopProduct';
import {Carousel} from '@material-tailwind/react';
import SizeGuide from '~/components/productpage-components/SizeGuide';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Altlier | ${data?.product.title ?? ''}`}];
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront, cart, session} = context;
  const customerAccessToken = session.get('customerAccessToken');
  const selectedOptions = getSelectedProductOptions(request).filter(
    (option) =>
      // Filter out Shopify predictive search query params
      !option.name.startsWith('_sid') &&
      !option.name.startsWith('_pos') &&
      !option.name.startsWith('_psq') &&
      !option.name.startsWith('_ss') &&
      !option.name.startsWith('_v') &&
      // Filter out third party tracking params
      !option.name.startsWith('fbclid'),
  );

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  // await the query for the critical product data
  const {product} = await storefront.query(PRODUCT_QUERY_DETAIL, {
    variables: {handle, selectedOptions},
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // validate the customer access token is valid
  const {isLoggedIn} = await validateCustomerAccessToken(
    session,
    customerAccessToken,
  );

  const cartPromise = cart.get();
  // defer the footer query (below the fold)
  const footerPromise = context.storefront.query(FOOTER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });

  return defer({
    product,
    isLoggedIn,
    cart: cartPromise,
    footer: footerPromise,
  });
}

export default function Product() {
  const {product, isLoggedIn, cart, footer} = useLoaderData<typeof loader>();

  return (
    <div className="product">
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
                    notification={cart && cart.totalQuantity > 0 ? true : false}
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

      <ProductMain product={product} />
      <Suspense>
        <Await resolve={footer}>
          {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
        </Await>
      </Suspense>
    </div>
  );
}

function ProductMain({product}: {product: any}) {
  const [sizeGuideVisible, setSetSizeGuideVisible] = useState(false);

  function handleSizeGuide(open: boolean) {
    setSetSizeGuideVisible(open);
  }
  const {images} = product;

  return (
    <div className="px-6 mt-24">
      <div>
        <ProductImages images={images.nodes} />
      </div>
      {sizeGuideVisible && (
        <div className="absolute left-0 z-10 h-full w-full flex items-end">
          <SizeGuide onClose={() => handleSizeGuide(false)} />
        </div>
      )}
      <div className="my-4">
        <TopProduct
          topProduct={product}
          onOpenSizeGuide={() => handleSizeGuide(true)}
          mobile={true}
        />
      </div>
    </div>
  );
}

function ProductImages({images}: {images: any[]}) {
  if (images.length === 0) {
    return <div className="product-image" />;
  } else {
    return (
      <Carousel>
        {images
          .slice(0)
          .reverse()
          .map((image) => (
            <img key={image.url} src={image.url} alt="product" />
          ))}
      </Carousel>
    );
  }
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment ProductDetail on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    options {
      name
      values
    }
    images(first:6, reverse:true) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    selectedVariant: variantBySelectedOptions(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    variants(first: 3) {
      nodes {
        ...ProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY_DETAIL = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductDetail
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
