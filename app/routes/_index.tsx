import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Footer} from '~/components/Footer';
// import type {
//   FeaturedCollectionFragment,
//   RecommendedProductsQuery,
// } from 'storefrontapi.generated';
import LandingPage from '~/components/LandingPage';
import ProductPage from '~/components/ProductPage';
import CartIcon from '~/components/svg-components/CartIcon';
import ProfileIcon from '~/components/svg-components/ProfileIcon';
import {validateCustomerAccessToken} from '~/root';

export const meta: MetaFunction = () => {
  return [{title: 'Hydrogen | Home'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront, session} = context;
  const customerAccessToken = session.get('customerAccessToken');

  // validate the customer access token is valid
  const {isLoggedIn, headers} = await validateCustomerAccessToken(
    session,
    customerAccessToken,
  );

  // defer the footer query (below the fold)
  const footerPromise = storefront.query(FOOTER_QUERY, {
    cache: storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });
  //const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  //const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({
    recommendedProducts,
    isLoggedIn,
    headers,
    footer: footerPromise,
  });
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home w-screen h-screen">
      <div className="fixed z-20 top-[55%] flex flex-col gap-8 right-24">
        <a href="#cart-aside" className="pointer-events-auto">
          <CartIcon notification={false} />
        </a>
        <a
          href={data.isLoggedIn ? '/account' : '/account/login'}
          className="pointer-events-auto"
        >
          <ProfileIcon notification={false} />
        </a>
      </div>
      <LandingPage data={data} />
      <ProductPage data={data} />
      <Suspense>
        <Await resolve={data.footer}>
          {(footer) => <Footer menu={footer?.menu} shop={null} />}
        </Await>
      </Suspense>
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment RecommendedProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
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
  fragment RecommendedProduct on Product {
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
    images(first: 2) {
      nodes {
        __typename
        id
        url
        altText
        width
        height
      }
    }
    variants(first: 3) {
      nodes {
        ...RecommendedProductVariant
      }
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_VARIANTS_FRAGMENT = `#graphql
  fragment RecommendedProductVariants on Product {
    variants(first: 250) {
      nodes {
        ...RecommendedProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

export const VARIANTS_QUERY = `#graphql
  ${PRODUCT_VARIANTS_FRAGMENT}
  query RecommendedProductVariants(
    $country: CountryCode
    $language: LanguageCode
    $handle: String!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...RecommendedProductVariants
    }
  }
` as const;

const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 8, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        ...RecommendedProduct
      }
    }
  }
` as const;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
` as const;

const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
` as const;
