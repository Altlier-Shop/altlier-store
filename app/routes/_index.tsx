import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Await, useLoaderData, type MetaFunction} from '@remix-run/react';
import {Suspense, useContext, useEffect, useRef, useState} from 'react';
import {useThrottle, openAside} from '~/utils';
// import type {
//   FeaturedCollectionFragment,
//   RecommendedProductsQuery,
// } from 'storefrontapi.generated';
import LandingPage from '~/components/LandingPage';
import ProductPage from '~/components/ProductPage';
import CartIcon from '~/components/svg-components/CartIcon';
import ProfileIcon from '~/components/svg-components/ProfileIcon';
import {validateCustomerAccessToken} from '~/root';
import FooterPage from '~/components/FooterPage';
import {FooterMobile} from '~/components/Footer';
import {UpdateContext} from '~/components/Layout';
import LandingPageMobile from '~/components/LandingPageMobile';
import type {Firestore} from 'firebase/firestore';

export const meta: MetaFunction = () => {
  return [{title: 'Altlier | Home'}];
};

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront, session, cart} = context;
  const firestoreDB = context.firestoreDB as Firestore;
  const customerAccessToken = session.get('customerAccessToken');

  // validate the customer access token is valid
  const {isLoggedIn} = await validateCustomerAccessToken(
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
  const cartPromise = cart.get();
  return defer({
    recommendedProducts,
    isLoggedIn,
    footer: footerPromise,
    cart: cartPromise,
    firestoreDB,
  });
}

export default function Homepage() {
  const [landingPageBottom, setLandingPageBottom] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const data = useLoaderData<typeof loader>();
  const firestoreDB = data.firestoreDB as Firestore;

  const homepage = useRef<HTMLDivElement>(null);
  const landingPage = useRef<HTMLDivElement>(null);
  const productPage = useRef<HTMLDivElement>(null);
  const footerPage = useRef<HTMLDivElement>(null);

  const handleScroll = (event: WheelEvent) => {
    // Prevent the default scroll behavior of the mouse wheel
    // event.preventDefault();
    if (window.location.hash.length > 1) {
      return;
    }
    const page = homepage.current;
    const landing = landingPage.current;
    const products = productPage.current;
    const footer = footerPage.current;
    if (page && products && footer && landing) {
      if (event.deltaY != 0) {
        if (event.deltaY > 0) {
          if (products.classList.contains('currentPage')) {
            products.classList.remove('currentPage');
            footer.classList.add('topPage');
            footer.classList.remove('bottomPage');
            footer.classList.add('currentPage');
          } else if (landing.classList.contains('currentPage')) {
            if (landingPageBottom) {
              landing.classList.remove('currentPage', 'z-30');
              products.classList.add('topPage');
              products.classList.remove('bottomPage');
              products.classList.add('currentPage');
            }
          }
        } else {
          if (footer.classList.contains('currentPage')) {
            footer.classList.remove('currentPage');
            footer.classList.add('bottomPage');
            footer.classList.remove('topPage');
            products.classList.add('currentPage');
          } else if (products.classList.contains('currentPage')) {
            products.classList.remove('currentPage');
            products.classList.add('bottomPage');
            products.classList.remove('topPage');
            landing.classList.add('currentPage');
          }
        }
      }
    }
  };
  const throttledScrollHandler = useThrottle(handleScroll, 1500);

  const checkMobileView = () => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    if (windowWidth / windowHeight < 1 || windowHeight < 450) {
      setMobileView(true);
    } else {
      setMobileView(false);
    }
  };

  useEffect(() => {
    window.addEventListener('wheel', throttledScrollHandler);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('wheel', throttledScrollHandler);
  }, [throttledScrollHandler]);

  useEffect(() => {
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  if (mobileView) {
    return (
      <div>
        <LandingPageMobile data={data} />
        <div className="relative">
          <Suspense>
            <Await resolve={data.footer}>
              {(footer) => (
                <FooterMobile firestoreDB={firestoreDB} menu={footer?.menu} />
              )}
            </Await>
          </Suspense>
        </div>
      </div>
    );
  }
  return (
    <div
      ref={homepage}
      className="home w-screen h-screen overflow-hidden relative"
    >
      <div
        className={`fixed z-50 top-[55%] flex flex-col gap-6 right-5 2xl:right-20`}
      >
        <button onClick={openAside} className="pointer-events-auto">
          <Suspense>
            <Await resolve={data.cart}>
              {(cart) => (
                <div className="w-10 h-10">
                  <CartIcon
                    notification={cart && cart.totalQuantity > 0 ? true : false}
                  />
                </div>
              )}
            </Await>
          </Suspense>
        </button>
        <a
          href={data.isLoggedIn ? '/account' : '/account/login'}
          className="pointer-events-auto w-10 h-10"
        >
          <ProfileIcon notification={false} />
        </a>
      </div>
      <div
        ref={landingPage}
        className="absolute z-30 w-screen h-screen currentPage"
        id="landingPage"
      >
        <LandingPage
          data={data}
          onBottom={(bottom: boolean) => setLandingPageBottom(bottom)}
        />
      </div>
      <div
        ref={productPage}
        className="absolute z-10 w-screen h-screen bottomPage"
        id="productPage"
      >
        <ProductPage data={data} />
      </div>
      <div
        ref={footerPage}
        className="absolute z-20 w-screen h-screen bottomPage"
        id="footerPage"
      >
        <Suspense>
          <Await resolve={data.footer}>
            {(footer) => (
              <FooterPage firestoreDB={firestoreDB} menu={footer?.menu} />
            )}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
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

export const PRODUCT_FRAGMENT = `#graphql
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
    images(first: 11) {
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

export const PRODUCT_VARIANTS_FRAGMENT = `#graphql
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

export const RECOMMENDED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  query RecommendedProducts ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    products(first: 9, sortKey: UPDATED_AT, reverse: true) {
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

export const FOOTER_QUERY = `#graphql
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
