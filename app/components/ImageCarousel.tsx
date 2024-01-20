import {Carousel} from '@material-tailwind/react';
import type {navigation} from '@material-tailwind/react/types/components/carousel';
import {ImageCarouselImage} from './ImageCarouselImage';

import artboard_2 from '../../public/login-page-images/artboard_2.jpg';
import artboard_3 from '../../public/login-page-images/artboard_3.jpg';
import artboard_4 from '../../public/login-page-images/artboard_4.jpg';
import artboard_5 from '../../public/login-page-images/artboard_5.jpg';
import artboard_6 from '../../public/login-page-images/artboard_6.jpg';

const carouselNavigation: navigation = ({
  activeIndex,
  setActiveIndex,
  length,
}) => (
  <div className="absolute z-50 flex gap-4 bottom-3 left-2/4 -translate-x-2/4">
    {new Array(length).fill(null).map((_, i) => (
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
);

export default function ImageCarousel() {
  return (
    <Carousel
      transition={{duration: 0.5}}
      autoplay={true}
      loop={true}
      className="overflow-x-hidden overflow-y-visible"
      autoplayDelay={2500}
      prevArrow={() => <></>}
      nextArrow={() => <></>}
      navigation={carouselNavigation}
    >
      <ImageCarouselImage src={artboard_2} alt="artboard_2" />
      <ImageCarouselImage src={artboard_3} alt="artboard_3" />
      <ImageCarouselImage src={artboard_4} alt="artboard_4" />
      <ImageCarouselImage src={artboard_5} alt="artboard_5" />
      <ImageCarouselImage src={artboard_6} alt="artboard_6" />
    </Carousel>
  );
}
