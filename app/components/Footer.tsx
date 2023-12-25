import {NavLink} from '@remix-run/react';
import type {MenuItem} from '@shopify/hydrogen/storefront-api-types';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';

export function Footer({
  menu,
  shop,
}: FooterQuery & {shop: HeaderQuery['shop'] | null}) {
  return (
    <footer className="absolute pt-20 left-0 bottom-0 w-[45%] h-[30%] bg-altlierBlue pl-[5%] pr-[10%] pt-12 flex justify-between [&>*]:text-white [&>*]:text-sm">
      <FooterMenu menu={menu} primaryDomainUrl={''} />
    </footer>
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
      <NavLink end prefetch="intent" style={activeLinkStyle} to={'/contact'}>
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
