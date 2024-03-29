import {defer, json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {Link, useLoaderData, type MetaFunction, Await} from '@remix-run/react';
import {type Shop} from '@shopify/hydrogen/storefront-api-types';
import GridPage from '~/components/startpage-components/GridPage';
import {PageLayout} from '~/components/PageLayout';
import {Footer} from '~/components/Footer';
import {FOOTER_QUERY} from '~/routes/_index';
import {Suspense} from 'react';

type SelectedPolicies = keyof Pick<
  Shop,
  'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
>;

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Altlier | ${data?.policy.title ?? ''}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(
    /-([a-z])/g,
    (_: unknown, m1: string) => m1.toUpperCase(),
  ) as SelectedPolicies;

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const footerPromise = context.storefront.query(FOOTER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }
  return defer({
    footer: footerPromise,
    policy,
  });
}

export default function Policy() {
  const {footer, policy} = useLoaderData<typeof loader>();

  return (
    <PageLayout>
      <div className="flex flex-1 px-6 md:px-20 pb-12 md:pb-20 pt-24">
        <div className="bg-root-primary px-12 py-6 md:px-20 md:py-14 rounded-xl shadow-xl">
          <h1 className="pixel-font text-4xl">{policy.title}</h1>
          <div
            id="pages"
            className="mt-4 overflow-auto"
            dangerouslySetInnerHTML={{__html: policy.body}}
          />
        </div>
      </div>
      <Suspense>
        <Await resolve={footer}>
          {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
        </Await>
      </Suspense>
    </PageLayout>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
}
query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
` as const;
