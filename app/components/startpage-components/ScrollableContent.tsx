import NotAPonzi from '../svg-components/NotAPonzi';
export default function ScrollableContent() {
  return (
    //  we need slight padding to not show the edges of our text next to the overlay divs
    <div className="p-0.5">
      <div className="grid 2xl:gap-10 lg:gap-6">
        <h1 className="4xl:text-8xl 3xl:text-7xl xl:text-6xl l:text-5xl md:text-4xl pixel-font">
          YOUR
        </h1>
        <h1 className="4xl:text-8xl 3xl:text-7xl xl:text-6xl l:text-5xl md:text-4xl pixel-font">
          EVERYDAY
        </h1>
        <h1 className="4xl:text-8xl 3xl:text-7xl xl:text-6xl l:text-5xl md:text-4xl pixel-font">
          GEAR
        </h1>
      </div>
      <div className="mt-6 mb-6 grid 2xl:gap-6 lg:gap-4">
        <div className="-ml-[2%]">
          <NotAPonzi />
        </div>
        <p className="leading-10 text-2xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam
          et urna vitae vehicula. Praesent volutpat accumsan arcu, eu suscipit
          urna semper at. Nulla pretium velit et elit consequat placerat.
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
        <p className="leading-10 text-2xl">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aliquam
          et urna vitae vehicula. Praesent volutpat accumsan arcu, eu suscipit
          urna semper at. Nulla pretium velit et elit consequat placerat.
        </p>
        <div className="mt-20"></div>
      </div>
    </div>
  );
}
