import {Suspense} from 'react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantsQuery,
} from 'storefrontapi.generated';
import {FOOTER_QUERY} from '~/routes/_index';

import {getSelectedProductOptions} from '@shopify/hydrogen';
import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {getVariantUrl, openAside} from '~/utils';
import CartIcon from '~/components/svg-components/CartIcon';
import ProfileIcon from '~/components/svg-components/ProfileIcon';
import {validateCustomerAccessToken} from '~/root';
import {Footer} from '~/components/Footer';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.product.title ?? ''}`}];
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

  const firstVariant = product.variants.nodes[0];
  const firstVariantIsDefault = Boolean(
    firstVariant.selectedOptions.find(
      (option: SelectedOption) =>
        option.name === 'Title' && option.value === 'Default Title',
    ),
  );

  // if (firstVariantIsDefault) {
  //   product.selectedVariant = firstVariant;
  // } else {
  //   // if no selected variant was returned from the selected options,
  //   // we redirect to the first variant's url with it's selected options applied
  //   if (!product.selectedVariant) {
  //     throw redirectToFirstVariant({product, request});
  //   }
  // }

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

  // In order to show which variants are available in the UI, we need to query
  // all of them. But there might be a *lot*, so instead separate the variants
  // into it's own separate query that is deferred. So there's a brief moment
  // where variant options might show as available when they're not, but after
  // this deffered query resolves, the UI will update.
  const variants = storefront.query(VARIANTS_QUERY, {
    variables: {handle},
  });

  return defer({
    product,
    variants,
    isLoggedIn,
    cart: cartPromise,
    footer: footerPromise,
  });
}

// export function redirectToFirstVariant({
//   product,
//   request,
// }: {
//   product: ProductFragment;
//   request: Request;
// }) {
//   const url = new URL(request.url);
//   const firstVariant = product.variants.nodes[0];

//   return redirect(
//     getVariantUrl({
//       pathname: url.pathname,
//       handle: product.handle,
//       selectedOptions: firstVariant.selectedOptions,
//       searchParams: new URLSearchParams(url.search),
//     }),
//     {
//       status: 302,
//     },
//   );
// }

export default function Product() {
  const {product, variants, isLoggedIn, cart, footer} =
    useLoaderData<typeof loader>();
  const {selectedVariant} = product;
  return (
    <div className="product">
      <div
        className={`fixed z-50 top-[55%] flex flex-col gap-6 right-5 2xl:right-20`}
      >
        <button onClick={openAside} className="pointer-events-auto">
          <Suspense>
            <Await resolve={cart}>
              {(cart) => (
                <div>
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
          className="pointer-events-auto"
        >
          <ProfileIcon notification={false} />
        </a>
      </div>

      <ProductMain
        selectedVariant={selectedVariant}
        product={product}
        variants={variants}
      />
      {/* TODO: footer needs to be mobile and non-sticky */}
      <Suspense>
        <Await resolve={footer}>
          {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
        </Await>
      </Suspense>
    </div>
  );
}

function ProductMain({
  selectedVariant,
  product,
  variants,
}: {
  product: any;
  selectedVariant: any;
  variants: Promise<ProductVariantsQuery>;
}) {
  const {title, descriptionHtml, images} = product;
  return (
    <div className="product-main">
      <h1>{title}</h1>
      <h1>
        {selectedVariant?.price.currencyCode}
        {selectedVariant?.price.amount}
      </h1>

      <ProductImages images={images.nodes} />
      <br />
      <p>
        <strong>Description</strong>
      </p>
      <br />
      <div dangerouslySetInnerHTML={{__html: descriptionHtml}} />
      <br />
    </div>
  );
}

function ProductImages({images}: {images: any[]}) {
  if (images.length === 0) {
    return <div className="product-image" />;
  } else {
    // TODO: This approach causes a bug
    const reversed = [...images.reverse()];

    return (
      <div className="product-image">
        {reversed.map((image) => (
          <img key={image.url} src={image.url} alt="product" />
        ))}
      </div>
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
    images(first: 5, reverse:true) {
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
    variants(first: 1) {
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

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment ProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query ProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductVariants
    }
  }
` as const;
