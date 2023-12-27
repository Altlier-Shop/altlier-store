import {NavLink} from '@remix-run/react';
import type {MenuItem} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {useRootLoaderData} from '~/root';
import TelegramIcon from './svg-components/TelegramIcon';
import TwitterIcon from './svg-components/TwitterIcon';
import InstagramIcon from './svg-components/InstagramIcon';
import DiscordIcon from './svg-components/DiscordIcon';
import MirrorIcon from './svg-components/MirrorIcon';
import WhitePaperIcon from './svg-components/WhitePaperIcon';

export function Footer({
  menu,
  shop,
  full,
}: FooterQuery & {shop: HeaderQuery['shop'] | null; full?: boolean}) {
  if (full) {
    return (
      <footer className="absolute pt-16 left-0 bottom-0 w-full h-[30%] bg-altlierBlue xl:pl-[5%] xl:pr-[10%] lg:px-10 px-4 pt-12 pt-12 flex justify-between gap-16 [&>*]:text-root-secondary [&>*]:text-sm">
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
      <footer className="absolute pt-16 left-0 bottom-0 w-[45%] h-[30%] bg-altlierBlue xl:pl-[5%] xl:pr-[10%] lg:px-10 px-4 pt-12 flex justify-between [&>*]:text-root-secondary [&>*]:text-sm">
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
    <div className="[&>*]:text-root-secondary">
      <h1 className="pixel-font text-3xl">Shill For us!</h1>

      <div className="mt-4 w-full flex gap-6 items-end">
        <div className="w-full [&>*]:text-root-secondary">
          <label htmlFor="email" className="text-base default-font-bold">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            className="input-box border-root-secondary"
          ></input>
        </div>
        <button
          disabled={email !== '' ? false : true}
          onClick={handleSubscribe}
          className={`btn homepage-btn ${
            email !== ''
              ? 'hover:bg-root-secondary hover:text-altlierBlue'
              : 'pixel-font'
          } text-base h-[38px] px-2 w-1/2 border-root-secondary pixel-font`}
        >
          Subscribe
        </button>
      </div>

      <div className="mt-6 flex w-full items-center gap-6">
        <div>
          <span className="text-base default-font-bold text-root-secondary">
            Our
          </span>
          <span className="text-base default-font-bold text-root-secondary">
            &nbsp;Socials:
          </span>
        </div>
        <div className="flex w-full justify-between">
          <a
            className="pointer-events-auto w-12"
            href="https://t.me/altlier_co"
            target="_blank"
            rel="noreferrer"
          >
            <TelegramIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://twitter.com/Altlier_co"
            target="_blank"
            rel="noreferrer"
          >
            <TwitterIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://www.instagram.com/altlier.co/"
            target="_blank"
            rel="noreferrer"
          >
            <InstagramIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <DiscordIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noreferrer"
          >
            <WhitePaperIcon />
          </a>
          <a
            className="pointer-events-auto w-12"
            href="https://mirror.xyz/0xa4F906979A0886C4DB7b9683115fea2f3FfA84f2"
            target="_blank"
            rel="noreferrer"
          >
            <MirrorIcon />
          </a>
        </div>
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
      <h1 className="text-root-secondary default-font-bold">LEGAL INFO</h1>
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
      <h1 className="text-root-secondary default-font-bold">SUPPORT</h1>
      <NavLink
        end
        prefetch="intent"
        style={activeLinkStyle}
        to={'/pages/contact'}
      >
        Contact Us
      </NavLink>
      <NavLink end prefetch="intent" style={activeLinkStyle} to={'/pages/faq'}>
        FAQ
      </NavLink>
    </div>
  );
}

function FooterAbout() {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-root-secondary default-font-bold">ABOUT</h1>
      <NavLink end prefetch="intent" style={activeLinkStyle} to={'/our-story'}>
        Our Story
      </NavLink>
      <NavLink
        end
        prefetch="intent"
        style={activeLinkStyle}
        to={'/root-secondary-paper'}
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
    color: isPending ? 'grey' : 'root-secondary',
  };
}
