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
import {setUserEmail} from '../firebase-service';
import {getFirestore, type Firestore} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

export type LayoutProps = {
  cart: Promise<CartApiQueryFragment | null>;
  children?: React.ReactNode;
  checkoutUrl?: string;
  firestoreDB: any;
};

type UpdateContextType = {
  popupFunc: (popup: boolean) => void;
  popup: boolean;
};
export const UpdateContext = createContext<UpdateContextType | null>(null);

export function Layout({
  cart,
  children = null,
  checkoutUrl,
  firestoreDB,
}: LayoutProps) {
  const [isPopup, setIsPopup] = useState(false);
  const updateParentComponent: UpdateContextType = {
    popupFunc: (popup: boolean) => {
      setIsPopup(popup);
    },
    popup: isPopup,
  };
  // const db = initFireStore();

  async function testFirebase(firestoreDB: FirebaseApp) {
    const db = getFirestore(firestoreDB);
    console.log(db);
    await setUserEmail(db, 'ju');
  }

  console.log(firestoreDB);
  // const db = getFirestore(firestoreDB);
  // console.log(db);

  return (
    <UpdateContext.Provider value={updateParentComponent}>
      <button
        onClick={handleHomeClick}
        className={`fixed z-50 top-9 2xl:mx-20 md:mx-10 mx-6  max-w-36 lg:max-w-48 ${
          isPopup ? 'masked-button' : ''
        }`}
      >
        <AltlierLogo />
        <button
          onClick={() => testFirebase(firestoreDB)}
          className="btn homepage-btn btn-dark"
        >
          CLICK TO CHECK FIREBASE
        </button>
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
