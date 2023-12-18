import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, Link, type MetaFunction} from '@remix-run/react';
import {Suspense} from 'react';
import {Image, Money} from '@shopify/hydrogen';
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
  //const {collections} = await storefront.query(FEATURED_COLLECTION_QUERY);
  //const featuredCollection = collections.nodes[0];
  const recommendedProducts = storefront.query(RECOMMENDED_PRODUCTS_QUERY);

  return defer({recommendedProducts, isLoggedIn, headers});
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="home w-screen h-screen">
      <div className="fixed z-20 top-1/2 flex flex-col gap-8 right-24">
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
      {/* <FeaturedCollection collection={data.featuredCollection} /> */}
      {/* <RecommendedProducts products={data.recommendedProducts} /> */}
    </div>
  );
}

// function RecommendedProducts({
//   products,
// }: {
//   products: Promise<RecommendedProductsQuery>;
// }) {
//   return (
//     <div className="recommended-products">
//       <h2>Recommended Products</h2>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Await resolve={products}>
//           {({products}) => (
//             <div className="recommended-products-grid">
//               {products.nodes.map((product) => (
//                 <Link
//                   key={product.id}
//                   className="recommended-product"
//                   to={`/products/${product.handle}`}
//                 >
//                   <Image
//                     data={product.images.nodes[0]}
//                     aspectRatio="1/1"
//                     sizes="(min-width: 45em) 20vw, 50vw"
//                   />
//                   <h4>{product.title}</h4>
//                   <small>
//                     <Money data={product.priceRange.minVariantPrice} />
//                   </small>
//                 </Link>
//               ))}
//             </div>
//           )}
//         </Await>
//       </Suspense>
//       <br />
//     </div>
//   );
// }

// function FeaturedCollection({
//   collection,
// }: {
//   collection: FeaturedCollectionFragment;
// }) {
//   if (!collection) return null;
//   const image = collection?.image;
//   console.log(collection);

//   return (
//     <Link
//       className="featured-collection"
//       to={`/collections/${collection.handle}`}
//     >
//       {image && (
//         <div className="featured-collection-image">
//           <Image data={image} sizes="100vw" />
//         </div>
//       )}
//       <h1>{collection.title}</h1>
//     </Link>
//   );
// }

// const FEATURED_COLLECTION_QUERY = `#graphql
//   fragment FeaturedCollection on Collection {
//     id
//     title
//     image {
//       id
//       url
//       altText
//       width
//       height
//     }
//     handle
//   }
//   query FeaturedCollection($country: CountryCode, $language: LanguageCode)
//     @inContext(country: $country, language: $language) {
//     collections(first: 1, sortKey: UPDATED_AT, reverse: true) {
//       nodes {
//         ...FeaturedCollection
//       }
//     }
//   }
// ` as const;

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
