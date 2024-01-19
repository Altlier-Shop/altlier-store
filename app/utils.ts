import {useLocation} from '@remix-run/react';

import type {SelectedOption} from '@shopify/hydrogen/storefront-api-types';
import {useMemo, useRef, useCallback} from 'react';

export function useVariantUrl(
  handle: string,
  selectedOptions: SelectedOption[],
) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}: {
  handle: string;
  pathname: string;
  searchParams: URLSearchParams;
  selectedOptions: SelectedOption[];
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;

  const path = isLocalePathname
    ? `${match![0]}products/${handle}`
    : `/products/${handle}`;

  selectedOptions.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

export function useThrottle(
  callback: (event: WheelEvent) => void,
  delay: number,
) {
  const lastCall = useRef(0);

  const throttledFunc = useCallback(
    (...args: any[]) => {
      const now = new Date().getTime();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        // @ts-expect-error
        callback(...args);
      }
    },
    [callback, delay],
  );

  return throttledFunc;
}

export const openAside = () => {
  const location = window.location;
  window.location.href = location.origin + location.pathname + '#cart-aside';
};
