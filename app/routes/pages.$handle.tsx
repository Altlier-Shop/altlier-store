import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, type MetaFunction, Await} from '@remix-run/react';
import GridPage from '~/components/startpage-components/GridPage';
import {FOOTER_QUERY} from '~/routes/_index';
import {Suspense} from 'react';
import {Footer} from '~/components/Footer';
import computer from '../../public/Computer.png';
import altlierCircularWhite from '../../public/Altlier_Circular_light.png';
import {convert} from 'html-to-text';
import {ChevronUpIcon, ChevronDownIcon} from '@heroicons/react/20/solid';
import {PageLayout} from '~/components/PageLayout';

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

interface FAQ {
  q: string;
  a: string;
}

export default function Page() {
  const {page, footer} = useLoaderData<typeof loader>();
  const contactPage = page.title.toLocaleLowerCase().includes('contact');

  if (contactPage) {
    return (
      <PageLayout>
        <div className="flex flex-1 flex-col md:flex-row-reverse items-center md:justify-center gap-20 px-12 md:px-20 pb-12 md:pb-20 pt-28">
          <div className="flex justify-center relative max-w-[15rem] md:max-w-[22rem]">
            <img
              loading="lazy"
              src={computer}
              alt="computer"
              className="w-full max-h-full object-contain"
            />
            <img
              loading="lazy"
              src={altlierCircularWhite}
              alt="logo_circular"
              className="animate-spinSlow absolute w-1/2 h-1/3 top-[15%]"
            />
          </div>
          <div className="bg-root-primary w-full max-w-5xl px-12 py-6 md:px-20 md:py-14 rounded-xl shadow-xl">
            <h1 className="pixel-font text-2xl md:text-4xl">{page.title}</h1>
            <div
              className="mt-10"
              dangerouslySetInnerHTML={{__html: page.body}}
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

  const text = convert(page.body).split('\n');
  const faqList: FAQ[] = [];
  const faqObj: FAQ = {
    q: '',
    a: '',
  };
  text.forEach((line) => {
    if (line.startsWith('Question:')) {
      faqObj.q = line.replace('Question:', '');
    } else if (line.startsWith('Answer:')) {
      faqObj.a = line.replace('Answer:', '');
      faqList.push({...faqObj});
    }
  });

  return (
    <PageLayout>
      <div className="flex flex-1 px-12 md:px-20 pb-12 md:pb-20 pt-28">
        <div className="bg-root-primary w-full h-full px-12 py-6 md:px-20 md:py-14 rounded-xl shadow-xl">
          <h1 className="pixel-font text-4xl">{page.title}</h1>
          {faqList.map((item) => (
            <div key={item.q} className="mt-4">
              <button
                id="collapsible-card"
                className="flex w-full justify-between"
                onClick={handleCollapsible}
              >
                <span className="font-bold text-xl md:text-2xl default-font-bold text-left">
                  {item.q}
                </span>
                <ChevronDownIcon id="downArrow" className="h-12" />
                <ChevronUpIcon id="upArrow" className="h-12 hidden" />
              </button>
              <div className="collapsible-content" id="collapsible-content">
                <span className="font-bold mt-2 text-l">{item.a}</span>
              </div>
            </div>
          ))}
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

function handleCollapsible(e: any) {
  let target = e.target;
  while (target.id !== 'collapsible-card') {
    // could be we clicked a child element like the text or one of the arrow svgs
    target = target.parentNode;
  }
  const content = target.nextElementSibling; // we unfold the content and also switch up the arrow svgs
  const downArrow = target.querySelector('#downArrow');
  const upArrow = target.querySelector('#upArrow');
  if (content.style.maxHeight) {
    content.style.maxHeight = null;
    setTimeout(() => {
      downArrow.classList.remove('hidden');
      upArrow.classList.add('hidden');
    }, 100);
  } else {
    content.style.maxHeight = content.scrollHeight + 'px';
    setTimeout(() => {
      downArrow.classList.add('hidden');
      upArrow.classList.remove('hidden');
    }, 100);
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
