import {Await} from '@remix-run/react';
import {Suspense, useState, createContext} from 'react';
import type {
  CartApiQueryFragment,
  FooterQuery,
  HeaderQuery,
} from 'storefrontapi.generated';
import {Aside} from '~/components/Aside';
import {CartMain} from '~/components/Cart';

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
        className={`fixed z-50 top-9 2xl:mx-20 md:mx-10 mx-6  max-w-36 lg:max-w-48 ${
          isPopup ? 'masked-button' : ''
        }`}
      >
        <AltlierLogo />
      </button>
      <CartAside cart={cart} checkoutUrl={checkoutUrl} />
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
