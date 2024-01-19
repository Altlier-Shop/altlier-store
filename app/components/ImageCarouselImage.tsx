import {Image} from '@shopify/hydrogen';

interface ImageCarouselImageProps {
  src: string;
  alt: string;
}

export function ImageCarouselImage({src, alt}: ImageCarouselImageProps) {
  return (
    <div className="w-full h-full overflow-hidden p-6 pb-10">
      <Image
        src={src}
        alt={alt}
        className="h-full max-w-[100%] !w-auto m-auto rounded-3xl shadow-image-carousel"
      />
    </div>
  );
}
