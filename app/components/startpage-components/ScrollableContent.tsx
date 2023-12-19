import NotAPonzi from '../svg-components/NotAPonzi';
export default function ScrollableContent() {
  return (
    //  we need slight padding to not show the edges of our text next to the overlay divs
    <div className="p-0.5">
      <div className="grid 2xl:gap-6 lg:gap-4">
        <h1 className="4xl:text-9xl 3xl:text-8xl xl:text-7xl l:text-6xl md:text-5xl pixel-font">
          YOUR
        </h1>
        <h1 className="4xl:text-9xl 3xl:text-8xl xl:text-7xl l:text-6xl md:text-5xl pixel-font">
          EVERYDAY
        </h1>
        <h1 className="4xl:text-9xl 3xl:text-8xl xl:text-7xl l:text-6xl md:text-5xl pixel-font">
          GEAR
        </h1>
      </div>
      <div className="mt-6 mb-6 grid 2xl:gap-6 lg:gap-4">
        <div className="-ml-[2%]">
          <NotAPonzi />
        </div>
        <p className="xl:leading-8 lg:leading-6 text-xl">
          Altlier, a community for alternative outliers, blends wearable
          products with documentation of the Crypto/Web3 cultural movement,
          capturing the era’s excitement in every unique design.
        </p>
      </div>
      <div className="mt-32 grid 2xl:gap-6 lg:gap-4">
        <h1 className="4xl:text-4xl 3xl:text-3xl xl:text-2xl l:text-xl md:text-xl pixel-font  [word-spacing:-10px]">
          WEAVING
        </h1>
        <h1 className="4xl:text-4xl 3xl:text-3xl xl:text-2xl l:text-xl md:text-xl pixel-font   [word-spacing:-10px]">
          THE WEB3 REVOLUTION
        </h1>
        <h1 className="4xl:text-4xl 3xl:text-3xl xl:text-2xl l:text-xl md:text-xl pixel-font  [word-spacing:-10px]">
          INTO DAILY LIFE
        </h1>
        <p className="xl:leading-8 lg:leading-6 text-xl">
          Discover Altlier: In the digital age's heart, we're a brand born from
          a crypto community's vision, embodying the web3 culture. Altlier isn't
          just about fashion; it's about a cultural metamorphosis, capturing the
          spirit of this era through clothing that's more than garments - each
          piece is a story, a symbol of innovation and connection. Join us, wear
          your story, and be part of this revolutionary movement. Altlier -
          Dressing the Revolution, One Stitch at a Time
        </p>
        <div className="mt-20"></div>
      </div>
    </div>
  );
}
