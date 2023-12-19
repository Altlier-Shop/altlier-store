import {Await} from '@remix-run/react';
import {Suspense} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {Header, HeaderMenu} from '~/components/Header';
import {CartMain} from '~/components/Cart';
import {
  PredictiveSearchForm,
  PredictiveSearchResults,
} from '~/components/Search';
import AltlierLogo from './svg-components/AltlierLogo';

export type LayoutProps = {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  header: HeaderQuery;
};

export function Layout({cart, children = null, header}: LayoutProps) {
  return (
    <>
      <button
        onClick={handleHomeClick}
        className="fixed z-20 top-8 2xl:px-20 px-10"
      >
        <AltlierLogo />
      </button>
      <CartAside cart={cart} />
      <SearchAside />
      <MobileMenuAside menu={header?.menu} shop={header?.shop} />
      {/* {header && <Header header={header} cart={cart} isLoggedIn={isLoggedIn} />} */}
      <main>{children}</main>
    </>
  );
}

function CartAside({cart}: {cart: LayoutProps['cart']}) {
  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />;
          }}
        </Await>
      </Suspense>
    </Aside>
  );
}

function handleHomeClick() {
  const location = window.location;
  if (location.pathname === '/') {
    window.scrollTo({top: 0, left: 0, behavior: 'smooth'});
    document
      .getElementById('landing-page')
      ?.scrollTo({top: 0, left: 0, behavior: 'smooth'});
  } else {
    window.location.href = location.origin;
  }
}

function SearchAside() {
  return (
    <Aside id="search-aside" heading="SEARCH">
      <div className="predictive-search">
        <br />
        <PredictiveSearchForm>
          {({fetchResults, inputRef}) => (
            <div>
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
              />
              &nbsp;
              <button type="submit">Search</button>
            </div>
          )}
        </PredictiveSearchForm>
        <PredictiveSearchResults />
      </div>
    </Aside>
  );
}

function MobileMenuAside({
  menu,
  shop,
}: {
  menu: HeaderQuery['menu'];
  shop: HeaderQuery['shop'];
}) {
  return (
    menu &&
    shop?.primaryDomain?.url && (
      <Aside id="mobile-menu-aside" heading="MENU">
        <HeaderMenu
          menu={menu}
          viewport="mobile"
          primaryDomainUrl={shop.primaryDomain.url}
        />
      </Aside>
    )
  );
}
