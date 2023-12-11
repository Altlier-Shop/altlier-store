import {useState} from 'react';
import GridPage from './startpage-components/GridPage';
import Links from './startpage-components/Links';
import Popup from './startpage-components/Popup';
import ScrollableContent from './startpage-components/ScrollableContent';
export default function StartPage() {
  const [showFud, setShowFud] = useState(false);
  const handleShill = () => {
    window.location.href = window.location.href + 'account/register';
  };

  return (
    <div className="flex w-full h-full bg-root overflow-y-scroll relative">
      <div className="fixed bg-root 2xl:px-20 px-10 pt-10 w-full">
        <h1>Altlier</h1>
      </div>
      <div className="2xl:px-20 px-10 pt-32" style={{width: '45%'}}>
        <ScrollableContent />
        <div className="sticky bottom-0 bg-root pointer-events-none pt-10 pb-32 ">
          <Links onShill={handleShill} onFud={() => setShowFud(true)} />
        </div>
      </div>
      <div
        className="sticky top-0 right-0 bg-root-secondary pointer-events-none"
        style={{width: '55%'}}
      >
        <GridPage />
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
