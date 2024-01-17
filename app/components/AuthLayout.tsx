import GridPage from './startpage-components/GridPage';
import ImageCarousel from './ImageCarousel';
import {Image} from '@shopify/hydrogen';

type AuthLayoutProps = {
  children: React.ReactNode;
  staticImage?: {
    src: string;
    alt: string;
  };
};

export function AuthLayout({children, staticImage}: AuthLayoutProps) {
  return (
    <div className={'w-screen h-screen flex flex-col md:flex-row'}>
      <div className="flex-1 min-w-[50%] min-h-[350px] overflow-hidden bg-root-secondary relative">
        <GridPage />
        <div className="absolute inset-0 flex justify-center items-center">
          <div className="h-full pt-20 md:pt-0 md:max-w-[572px] md:h-auto">
            {!staticImage ? (
              <ImageCarousel />
            ) : (
              <Image
                src={staticImage.src}
                alt={staticImage.alt}
                className="h-full max-w-[100%] !w-auto m-auto pb-6"
              />
            )}
          </div>
        </div>
      </div>
      <div
        className={
          'flex flex-1 flex-col justify-center bg-root-primary p-6 md:px-14 lg:px-16 xl:px-28'
        }
      >
        {children}
      </div>
    </div>
  );
}
