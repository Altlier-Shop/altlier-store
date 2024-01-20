import {useState, useRef} from 'react';
import computer from '../../public/Computer.png';
import NotAPonzi from '~/components/svg-components/NotAPonzi';
import productGif from '../../public/landing-page-animation/gif-animation-version.gif';
import altlierCircularWhite from '../../public/Altlier_Circular_light.png';

export default function LandingPageMobile({data}: {data: any}) {
  const [showFud, setShowFud] = useState(false);
  const [scrollProportion, setScrollProportion] = useState(0);

  const handleShill = () => {
    window.location.href =
      window.location.href + data.isLoggedIn ? 'account' : 'account/register';
  };

  return (
    <div
      id="landing-page"
      className="flex w-full h-full bg-root-primary overflow-y-scroll relative"
    >
      <div className="2xl:px-20 px-10 pt-20">
        <div>
          <div className="grid gap-2">
            <h1 className="text-4xl pixel-font">YOUR</h1>
            <h1 className="text-4xl pixel-font">EVERYDAY</h1>
            <h1 className="text-4xl pixel-font">GEAR</h1>
          </div>
          <div className="mt-4 mb-4 grid gap-2 w-full">
            <div className="-ml-[2%] w-full">
              <NotAPonzi />
            </div>
            <p className="leading-5 text-sm">
              {`Altlier, a community for alternative outliers, blends wearable
              products with documentation of the Crypto/Web3 cultural movement,
              capturing the era's excitement in every unique design.`}
            </p>
            <div
              className="bg-root-secondary pointer-events-none w-screen -mx-10 mt-8"
              style={{
                backgroundImage: `
          linear-gradient(to right, gray 1px, transparent 1px),
          linear-gradient(to bottom, gray 1px, transparent 1px)`,
                backgroundSize: `10% 10%`,
              }}
            >
              <img src={productGif} alt="Product Gif" />
              <div className="px-10 w-full flex mb-5">
                <a
                  className="btn homepage-btn btn-dark pointer-events-auto w-full mx-auto text-center"
                  href="/products"
                >
                  SHOP NOW
                </a>
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-2">
            <h1 className="text-xl pixel-font  [word-spacing:-10px]">
              WEAVING
            </h1>
            <h1 className="text-xl pixel-font   [word-spacing:-10px]">
              THE WEB3 REVOLUTION
            </h1>
            <h1 className="text-xl pixel-font  [word-spacing:-10px]">
              INTO DAILY LIFE
            </h1>
            <p className="leading-5 text-sm">
              {`Discover Altlier: In the digital age's heart, we're a brand born
              from a crypto community's vision, embodying the web3 culture.
              Altlier isn't just about fashion; it's about a cultural
              metamorphosis, capturing the spirit of this era through clothing
              that's more than garments - each piece is a story, a symbol of
              innovation and connection. Join us, wear your story, and be part
              of this revolutionary movement. Altlier - Dressing the Revolution,
              One Stitch at a Time`}
            </p>
            <div className="my-8">
              <div className="relative h-96 flex justify-center items-end">
                <img
                  loading="lazy"
                  src={computer}
                  alt="computer"
                  className="w-full max-h-full object-contain"
                />
                <img
                  loading="lazy"
                  src={altlierCircularWhite}
                  alt="logo_circular"
                  className="animate-spinSlow absolute xl:top-[15%] lg:top-[20%] md:top-[30%] top-[15%] w-1/2 h-1/3 object-contain flex justify-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
