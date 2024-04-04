import ArrowIcon from './svg-components/ArrowIcon';

/**
 * A side bar component with Overlay that works without JavaScript.
 * @example
 * ```jsx
 * <Aside id="search-aside" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 */
export function Aside({
  children,
  heading,
  id = 'aside',
}: {
  children?: React.ReactNode;
  heading: React.ReactNode;
  id?: string;
}) {
  function isTouchDevice() {
    if (typeof window === 'undefined') {
      console.log('alternative route, window not defined');

      const ua = navigator.userAgent;
      if (/mobile/i.test(ua)) {
        return true;
      } else if (/iPad|Android|Touch/i.test(ua)) {
        return true;
      } else {
        return false;
      }
    } else {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
  }

  const touchDevice = isTouchDevice();
  // console.log('Touch Device:', touchDevice);

  return (
    <div aria-modal className="overlay" id={id} role="dialog">
      <button
        aria-label="Close Aside"
        className="close-outside"
        onClick={() => {
          if (!touchDevice) {
            history.go(-1);
          } else {
            window.location.href = location.origin + location.pathname;
          }
        }}
      />
      <aside className="px-4 bg-root-secondary" id="aside-component">
        <div className="pixel-font flex gap-4 mt-12">
          <button
            className="pl-6"
            onClick={() => {
              if (!touchDevice) {
                history.go(-1);
              } else {
                window.location.href = location.origin + location.pathname;
              }
            }}
          >
            <ArrowIcon direction="right" width={'1.5rem'} still={true} />
          </button>
          <h1 className="text-4xl">{heading}</h1>
        </div>
        <main>{children}</main>
      </aside>
    </div>
  );
}

function CloseAside() {
  return (
    /* eslint-disable-next-line jsx-a11y/anchor-is-valid */
    <a className="close" href="#" onChange={() => history.go(-1)}>
      &times;
    </a>
  );
}
