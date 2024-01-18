import GridPage from './startpage-components/GridPage';

export interface PageLayoutProps {
  children?: React.ReactNode;
}

export function PageLayout({children}: PageLayoutProps) {
  return (
    <div className="h-screen w-screen bg-root-secondary relative">
      <GridPage />
      <div className="flex flex-col absolute inset-0 overflow-auto">
        {children}
      </div>
    </div>
  );
}
