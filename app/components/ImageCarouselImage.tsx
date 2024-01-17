import {Image} from '@shopify/hydrogen';

interface ImageCarouselImageProps {
  src: string;
  alt: string;
}

export function ImageCarouselImage({src, alt}: ImageCarouselImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      className="h-full max-w-[100%] !w-auto m-auto pb-6"
    />
  );
}
