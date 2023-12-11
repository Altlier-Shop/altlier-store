import GridPage from './startpage-components/GridPage';
import Links from './startpage-components/Links';
import ScrollableContent from './startpage-components/ScrollableContent';

export default function StartPage() {
  return (
    <div className="flex w-full h-full bg-root overflow-y-scroll">
      <div className="fixed bg-root 2xl:px-20 px-10 pt-10 w-full">
        <h1>Altlier</h1>
      </div>
      <div className="2xl:px-20 px-10 pt-32" style={{width: '45%'}}>
        <ScrollableContent />
        <div className="sticky left-0 bottom-0 bg-root pointer-events-none pt-10 pb-32">
          <Links />
        </div>
      </div>
      <div
        className="sticky top-0 right-0 bg-root-secondary pointer-events-none"
        style={{width: '55%'}}
      >
        <GridPage />
      </div>
    </div>
  );
}
