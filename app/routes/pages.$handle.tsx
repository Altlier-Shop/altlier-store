import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Await} from '@remix-run/react';
import GridPage from '~/components/startpage-components/GridPage';
import {FOOTER_QUERY} from '~/routes/_index';
import {Suspense} from 'react';
import {Footer} from '~/components/Footer';
import computer from '../../public/Computer.png';
import altlierCircularWhite from '../../public/Altlier_Circular_light.png';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [{title: `Hydrogen | ${data?.page.title ?? ''}`}];
};

export async function loader({params, context}: LoaderFunctionArgs) {
  if (!params.handle) {
    throw new Error('Missing page handle');
  }

  const {page} = await context.storefront.query(PAGE_QUERY, {
    variables: {
      handle: params.handle,
    },
  });
  // defer the footer query (below the fold)
  const footerPromise = context.storefront.query(FOOTER_QUERY, {
    cache: context.storefront.CacheLong(),
    variables: {
      footerMenuHandle: 'footer', // Adjust to your footer menu handle
    },
  });

  if (!page) {
    throw new Response('Not Found', {status: 404});
  }

  return defer({
    footer: footerPromise,
    page,
  });
}

export default function Page() {
  const {page, footer} = useLoaderData<typeof loader>();
  const contactPage = page.title.toLocaleLowerCase().includes('contact');
  const faqPage = page.title.toLocaleLowerCase().includes('faq');

  if (contactPage) {
    return (
      <div className="h-screen w-screen bg-root-secondary relative">
        <GridPage />
        <div className="page absolute z-10 top-[12%] h-1/2 px-20 w-full flex items-end gap-20">
          <div className="bg-root-primary w-2/3 h-5/6 px-20 py-14 rounded-xl shadow-xl	">
            <h1 className="pixel-font text-4xl">{page.title}</h1>
            <div
              className="mt-10 overflow-scroll h-5/6"
              dangerouslySetInnerHTML={{__html: page.body}}
            />
          </div>
          <div className="relative h-full w-1/3 flex justify-center items-end">
            <img
              src={computer}
              alt="computer"
              className="w-full max-h-full object-contain"
            />

            <img
              src={altlierCircularWhite}
              alt="logo_circular"
              className="animate-spinSlow absolute xl:top-[15%] lg:top-[20%] md:top-[30%] top-[35%] w-1/2 h-1/3 object-contain flex justify-center"
            />
          </div>
        </div>
        <Suspense>
          <Await resolve={footer}>
            {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
          </Await>
        </Suspense>
      </div>
    );
  } else {
    return (
      <div className="h-screen w-screen bg-root-secondary relative">
        <GridPage />
        <div className="page absolute z-10 top-[12%] h-1/2 px-20 w-full ">
          <div className="bg-root-primary w-full h-full px-20 py-14 rounded-xl shadow-xl	">
            <h1 className="pixel-font text-4xl">{page.title}</h1>
            <div
              className="mt-10 overflow-scroll h-5/6"
              dangerouslySetInnerHTML={{__html: page.body}}
            />
          </div>
        </div>
        <Suspense>
          <Await resolve={footer}>
            {(footer) => <Footer menu={footer?.menu} shop={null} full={true} />}
          </Await>
        </Suspense>
      </div>
    );
  }
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
