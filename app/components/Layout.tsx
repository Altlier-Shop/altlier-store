import {Await} from '@remix-run/react';
import {Suspense, useState, createContext} from 'react';
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
  checkoutUrl?: string;
};

type UpdateContextType = {
  popupFunc: (popup: boolean) => void;
  popup: boolean;
};
export const UpdateContext = createContext<UpdateContextType | null>(null);

export function Layout({cart, children = null, checkoutUrl}: LayoutProps) {
  const [isPopup, setIsPopup] = useState(false);
  const updateParentComponent: UpdateContextType = {
    popupFunc: (popup: boolean) => {
      setIsPopup(popup);
    },
    popup: isPopup,
  };

  return (
    <UpdateContext.Provider value={updateParentComponent}>
      <button
        onClick={handleHomeClick}
        className={`fixed z-50 top-8 2xl:mx-20 mx-10 ${
          isPopup ? 'masked-button' : ''
        }`}
      >
        <AltlierLogo />
      </button>
      <CartAside cart={cart} checkoutUrl={checkoutUrl} />
      {/* <SearchAside /> */}
      {/* <MobileMenuAside menu={header?.menu} shop={header?.shop} /> */}
      <main>{children}</main>
    </UpdateContext.Provider>
  );
}

function CartAside({
  cart,
  checkoutUrl,
}: {
  cart: LayoutProps['cart'];
  checkoutUrl: LayoutProps['checkoutUrl'];
}) {
  return (
    <Aside id="cart-aside" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return (
              <CartMain cart={cart} checkoutUrl={checkoutUrl} layout="aside" />
            );
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
