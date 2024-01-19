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
  return (
    <div aria-modal className="overlay" id={id} role="dialog">
      <button
        aria-label="Close Aside"
        className="close-outside"
        onClick={() => {
          window.history.back();
        }}
      />
      <aside className="px-4 bg-root-secondary" id="aside-component">
        <div className="pixel-font flex gap-4 mt-12">
          <button className="pl-6" onClick={() => window.history.back()}>
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
