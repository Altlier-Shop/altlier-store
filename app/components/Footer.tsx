import {NavLink} from '@remix-run/react';
import type {MenuItem} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';

export function Footer({
  menu,
  shop,
  full,
}: FooterQuery & {shop: HeaderQuery['shop'] | null; full?: boolean}) {
  if (full) {
    return (
      <footer className="absolute pt-16 left-0 bottom-0 w-full h-[30%] bg-altlierBlue pl-[10%] pr-[10%] pt-12 flex justify-between gap-16 [&>*]:text-white [&>*]:text-sm">
        <div className="w-[55%] z-10">
          <FooterSocials />
        </div>
        <div className="w-[45%]">
          <FooterMenu menu={menu} primaryDomainUrl={''} />
        </div>
      </footer>
    );
  } else {
    return (
      <footer className="absolute pt-16 left-0 bottom-0 w-[45%] h-[30%] bg-altlierBlue pl-[5%] pr-[10%] pt-12 flex justify-between [&>*]:text-white [&>*]:text-sm">
        <FooterMenu menu={menu} primaryDomainUrl={''} />
      </footer>
    );
  }
}
function FooterSocials() {
  const [email, setEmail] = useState('');
  const handleSubscribe = () => {
    if (email !== '') {
      // TODO: handle Subscribe
      console.log('subscribed', email);
      setEmail('');
    }
  };
  return (
    <div className="[&>*]:text-white">
      <h1 className=" pixel-font text-3xl">Shill For us!</h1>

      <div className="mt-4 w-full flex gap-6 items-end">
        <div className="w-full [&>*]:text-white">
          <label htmlFor="email" className="text-lg default-font-bold">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="input-box border-white"
          ></input>
        </div>
        <button
          disabled={email !== '' ? false : true}
          onClick={handleSubscribe}
          className={`btn homepage-btn ${
            email !== ''
              ? 'hover:bg-white hover:text-altlierBlue'
              : 'pixel-font'
          } text-lg h-[38px] px-2 w-1/2 border-white pixel-font`}
        >
          Subscribe
        </button>
      </div>
    </div>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
}) {
  const {publicStoreDomain} = useRootLoaderData();

  const policies = menu?.items.filter(
    (item: any) => item.type === 'SHOP_POLICY',
  );
  // console.log(JSON.stringify(menu));
  // console.log(policies);

  return (
    <nav className="footer-menu" role="navigation">
      <FooterLegal
        menu={policies ? policies : []}
        publicStoreDomain={publicStoreDomain}
        primaryDomainUrl={primaryDomainUrl}
      />
      <FooterSupport />
      <FooterAbout />
    </nav>
  );
}

interface FooterProps {
  menu: Pick<
    MenuItem,
    'id' | 'url' | 'resourceId' | 'tags' | 'title' | 'type'
  >[];
  publicStoreDomain: string;
  primaryDomainUrl: string;
}
function FooterLegal(props: FooterProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-white default-font-bold">LEGAL INFO</h1>
      {props.menu.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(props.publicStoreDomain) ||
          item.url.includes(props.primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </div>
  );
}

function FooterSupport() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-white default-font-bold">SUPPORT</h1>
      <NavLink
        end
        prefetch="intent"
        style={activeLinkStyle}
        to={'/pages/contact'}
      >
        Contact Us
      </NavLink>
      <NavLink end prefetch="intent" style={activeLinkStyle} to={'/faq'}>
        FAQ
      </NavLink>
    </div>
  );
}

function FooterAbout() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-white default-font-bold">ABOUT</h1>
      <NavLink end prefetch="intent" style={activeLinkStyle} to={'/our-story'}>
        Our Story
      </NavLink>
      <NavLink
        end
        prefetch="intent"
        style={activeLinkStyle}
        to={'/white-paper'}
      >
        White Paper
      </NavLink>
    </div>
  );
}

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
