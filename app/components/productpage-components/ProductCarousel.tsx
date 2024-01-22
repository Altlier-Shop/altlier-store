import {useState} from 'react';
import ArrowIcon from '../svg-components/ArrowIcon';

const TRANSLATE_DISTANCE_IN_PX = 250;
const ROTATION_TIMEOUT = 700;

const isTopProduct = (index: number, currentIndex: number) => {
  return index === currentIndex;
};

const isRightProduct = (
  index: number,
  currentIndex: number,
  lastIndex: number,
) => {
  if (currentIndex === 0) {
    return index === lastIndex;
  }
  return index === currentIndex - 1;
};

const isLeftProduct = (
  index: number,
  currentIndex: number,
  lastIndex: number,
) => {
  if (currentIndex === lastIndex) {
    return index === 0;
  }
  return index === currentIndex + 1;
};

const isNextLeftProduct = (
  index: number,
  currentIndex: number,
  lastIndex: number,
) => {
  if (currentIndex === lastIndex) {
    return index === 1;
  }
  if (currentIndex === lastIndex - 1) {
    return index === 0;
  }
  return index === currentIndex + 2;
};

const isNextRightProduct = (
  index: number,
  currentIndex: number,
  lastIndex: number,
) => {
  if (currentIndex === 0) {
    return index === lastIndex - 1;
  }
  if (currentIndex === 1) {
    return index === lastIndex;
  }
  return index === currentIndex - 2;
};

const getProductStyle = (
  index: number,
  currentIndex: number,
  lastIndex: number,
) => {
  if (isTopProduct(index, currentIndex)) {
    return {
      transform: `translateY(-${TRANSLATE_DISTANCE_IN_PX}px) rotate(0deg)`,
      cursor: 'pointer',
    };
  }
  if (isLeftProduct(index, currentIndex, lastIndex)) {
    return {
      transform: `translateX(-${TRANSLATE_DISTANCE_IN_PX}px) rotate(-90deg)`,
    };
  }
  if (isRightProduct(index, currentIndex, lastIndex)) {
    return {
      transform: `translateX(${TRANSLATE_DISTANCE_IN_PX}px) rotate(90deg)`,
    };
  }
  if (isNextLeftProduct(index, currentIndex, lastIndex)) {
    return {
      transform: `translateY(${
        TRANSLATE_DISTANCE_IN_PX * 2.5
      }px) rotate(-90deg)`,
    };
  }
  if (isNextRightProduct(index, currentIndex, lastIndex)) {
    return {
      transform: `translateY(${
        TRANSLATE_DISTANCE_IN_PX * 2.5
      }px) rotate(90deg)`,
    };
  }
  return {
    transform: `translateY(${TRANSLATE_DISTANCE_IN_PX * 2.5}px) rotate(180deg)`,
  };
};

interface ProductCarouselProps {
  products: any[];
  onDetailsClick: (product: any) => void;
  onChange: (product: any) => void;
}

export default function ProductCarousel({
  products,
  onChange,
  onDetailsClick,
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [disableRotation, setDisableRotation] = useState(false);
  const [isMouseOverProduct, setIsMouseOverProduct] = useState(false);

  const handleRotate = (clockWise: boolean) => {
    const newIndex = clockWise
      ? currentIndex === products.length - 1
        ? 0
        : currentIndex + 1
      : currentIndex === 0
      ? products.length - 1
      : currentIndex - 1;

    setCurrentIndex(newIndex);
    onChange(products[newIndex]);
    setDisableRotation(true);
    setTimeout(() => {
      setDisableRotation(false);
    }, ROTATION_TIMEOUT);
  };

  const handleMouseOver = (index: number) => {
    if (index !== currentIndex) {
      return;
    }

    if (!isMouseOverProduct) {
      setIsMouseOverProduct(true);
    }
  };

  const handleMouseLeave = (index: number) => {
    if (index !== currentIndex) {
      return;
    }
    if (isMouseOverProduct) {
      setIsMouseOverProduct(false);
    }
  };

  return (
    <div className="relative w-full h-full flex justify-center items-end overflow-hidden">
      {products.map((product, index) => (
        <img
          style={getProductStyle(index, currentIndex, products.length - 1)}
          className={`absolute w-[500px] xl:w-[550px] transition-transform ease-in-out duration-700 origin-bottom ${
            index === currentIndex ? 'cursor-pointer' : ''
          }}`}
          key={product.id}
          src={
            !isMouseOverProduct || index !== currentIndex
              ? product.images.nodes[0].url
              : product.images.nodes[1].url
          }
          alt={product.title}
          onClick={() => onDetailsClick(products[currentIndex])}
          onMouseOver={() => handleMouseOver(index)}
          onMouseLeave={() => handleMouseLeave(index)}
          onFocus={() => handleMouseOver(index)}
          onBlur={() => handleMouseLeave(index)}
          aria-hidden="true"
        />
      ))}
      <button
        onClick={() => onDetailsClick(products[currentIndex])}
        className="border-b-2 text-neutral-400 border-neutral-400 w-32 text-center hover:text-altlierBlue hover:border-altlierBlue cursor-pointer translate-y-[-100px]"
      >
        See more details
      </button>
      <button
        disabled={disableRotation}
        onClick={() => handleRotate(false)}
        className={`absolute h-96 translate-x-[-250px] translate-y-[-220px] ${
          disableRotation ? '' : 'z-30'
        }`}
      >
        <ArrowIcon direction={'left'} width={'3rem'} />
      </button>
      <button
        disabled={disableRotation}
        onClick={() => handleRotate(true)}
        className={`absolute h-96 translate-x-[250px] translate-y-[-220px] ${
          disableRotation ? '' : 'z-30'
        }`}
      >
        <ArrowIcon direction={'right'} width={'3rem'} />
      </button>
    </div>
  );
}
