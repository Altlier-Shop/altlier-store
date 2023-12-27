import {useState, useRef} from 'react';
import GridPage from './startpage-components/GridPage';
import Links from './startpage-components/Links';
import Popup from './startpage-components/Popup';
import ScrollableContent from './startpage-components/ScrollableContent';
import GridAnimation from './startpage-components/GridAnimation';

export default function LandingPage({
  data,
  onBottom,
}: {
  data: any;
  onBottom: (bottom: boolean) => void;
}) {
  const [showFud, setShowFud] = useState(false);
  const [scrollProportion, setScrollProportion] = useState(0);

  const divRef = useRef<HTMLDivElement>(null);
  const handleShill = () => {
    window.location.href =
      window.location.href + data.isLoggedIn ? 'account' : 'account/register';
  };
  const handleScroll = () => {
    const current = divRef.current;
    if (current) {
      if (current.scrollTop + window.innerHeight >= current.scrollHeight - 10) {
        onBottom(true);
      } else {
        onBottom(false);
      }
      const scrollProportion =
        Math.round(
          (current.scrollTop / (current.scrollHeight - window.innerHeight)) *
            100,
        ) / 100;
      setScrollProportion(scrollProportion);
    }
  };

  return (
    <div
      id="landing-page"
      className="flex w-full h-full bg-root-primary overflow-y-scroll relative"
      onScroll={handleScroll}
      ref={divRef}
    >
      <div className="2xl:px-20 px-10 pt-32" style={{width: '45%'}}>
        <ScrollableContent />
        <div className="sticky bottom-0 bg-root-primary pointer-events-none pt-8 pb-14 ">
          <Links onShill={handleShill} onFud={() => setShowFud(true)} />
        </div>
      </div>
      <div
        className="sticky top-0 right-0 bg-root-secondary pointer-events-none"
        style={{width: '55%'}}
      >
        <GridPage />
        <GridAnimation scrollProportion={scrollProportion} />
      </div>
      {showFud ? (
        <div className="fixed h-full w-full flex items-center justify-center">
          <Popup onClose={() => setShowFud(false)} onShill={handleShill} />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
