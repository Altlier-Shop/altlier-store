import {Carousel} from '@material-tailwind/react';
import artboard_2 from '../../public/login-page-images/artboard_2.png';
import artboard_3 from '../../public/login-page-images/artboard_3.png';
import artboard_4 from '../../public/login-page-images/artboard_4.png';
import artboard_5 from '../../public/login-page-images/artboard_5.png';
import artboard_6 from '../../public/login-page-images/artboard_6.png';

export default function ImageCarousel() {
  return (
    <div className="absolute h-full w-full grid items-center justify-items-center">
      <Carousel
        transition={{duration: 0.5}}
        autoplay={true}
        loop={true}
        autoplayDelay={2500}
        className="rounded-xl absolute h-fit w-2/3"
        prevArrow={() => <div />}
        nextArrow={() => <div />}
        navigation={({setActiveIndex, activeIndex, length}) => (
          <div className="absolute bottom-0 left-2/4 z-50 flex -translate-x-2/4 gap-4">
            {new Array(length).fill('').map((_, i) => (
              <button
                aria-label={'button'}
                // eslint-disable-next-line react/no-array-index-key
                key={`button-${i}`}
                className={`block h-3 w-3 cursor-pointer rounded-full transition-all ${
                  activeIndex === i ? 'bg-altlierBlue' : 'bg-altlierBlue/50'
                }`}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>
        )}
      >
        <img
          loading="lazy"
          src={artboard_2}
          alt="test1"
          className="h-full w-full object-cover"
        />
        <img
          loading="lazy"
          src={artboard_3}
          alt="test2"
          className="h-full w-full object-cover"
        />
        <img
          loading="lazy"
          src={artboard_4}
          alt="test3"
          className="h-full w-full object-cover"
        />
        <img
          loading="lazy"
          src={artboard_5}
          alt="test3"
          className="h-full w-full object-cover"
        />
        <img
          loading="lazy"
          src={artboard_6}
          alt="test3"
          className="h-full w-full object-cover"
        />
      </Carousel>
    </div>
  );
}
