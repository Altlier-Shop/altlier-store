import {Suspense} from 'react';
import {defer, redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, Link, useLoaderData, type MetaFunction} from '@remix-run/react';
import type {
  ProductFragment,
  ProductVariantFragment,
} from 'storefrontapi.generated';
import {FOOTER_QUERY} from '~/routes/_index';
import {Image, Money, getSelectedProductOptions} from '@shopify/hydrogen';
import {Footer} from '~/components/Footer';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Products`}];
};

export async function loader({params, request, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  console.log(params, storefront, JSON.stringify(request));

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

  // await the query for the critical product data
  const {products} = await storefront.query(PRODUCTS_QUERY);
  // defer the footer query (below the fold)
  const footerPromise = context.storefront.query(FOOTER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });

  if (products.length === 0) {
    throw new Response(null, {status: 404});
  }

  return defer({products, footer: footerPromise});
}

export default function Product() {
  const {products, footer} = useLoaderData<typeof loader>();

  return (
    <>
      {products.nodes.length > 0 ? (
        <ProductMain products={products.nodes} footer={footer} />
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

function ProductMain({
  products,
  footer,
}: {
  products: ProductFragment[];
  footer: FooterQuery;
}) {
  return (
    <>
      <div className="h-full grid grid-cols-2 gap-16">
        {products.map((product: any) => (
          <div key={product.id}>
            <ProductImage image={product.images.nodes[0]} />
            <h1>{product.title}</h1>
            <h1>
              {product.priceRange.minVariantPrice.currencyCode}
              {Math.floor(product.priceRange.minVariantPrice.amount)}
            </h1>

            <br />
          </div>
        ))}
        {/* TODO: footer needs to be mobile and non-sticky */}
        <Suspense>
          <Await resolve={footer}>
            {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
          </Await>
        </Suspense>
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
    images(first: 5, reverse:true) {
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
