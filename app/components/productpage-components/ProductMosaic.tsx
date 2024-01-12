import XMarkIcon from '../svg-components/XMarkIcon';
import AltlierLogo from '../svg-components/AltlierLogo';

interface MosaicProps {
  topProduct: any;
  onClose: () => void;
}

export default function ProductMosaic(props: MosaicProps) {
  return (
    <div className="fixed top-0 z-[1000] bg-black bg-opacity-40 h-screen w-screen flex items-center justify-center">
      <div className="h-5/6  bg-root-secondary p-6">
        <div className="w-full h-full grid grid-cols-23 grid-rows-10">
          <div className="col-span-21 flex justify-between items-end">
            <div className="divide-y-0 divide-x-0">
              <p className="text-sm">SERIES 0</p>
              <p className="text-sm">{props.topProduct.title}</p>
            </div>
            <p className="align-self-end text-sm mr-4">
              {props.topProduct.productCode}
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="col-start-22 flex items-start justify-end divide-y-0 divide-x-0"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-root-tertiary active:bg-neutral-400 border-2 retro-border">
              <XMarkIcon />
            </div>
          </button>

          <div className="row-start-2 row-span-full col-start-1 col-span-8 border-altlierBlue border mr-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[2].url}
              alt="col-1"
            />
          </div>
          <div className="row-start-2 row-span-3 col-start-9 col-span-4 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[3].url}
              alt="mosaic"
            />
          </div>

          <div className="row-start-2 row-span-6 col-start-13 col-span-8 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[6].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-2 row-span-full col-start-21 col-span-2 object-fit">
            <AltlierLogo light={true} />
          </div>
          <div className="row-start-5 row-span-3 col-start-9 col-span-4 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[4].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-8 row-span-3 col-start-9 col-span-4 border-altlierBlue border mr-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[5].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-8 row-span-3 col-start-13 col-span-8 border-altlierBlue border mr-4">
            <img
              className="h-full w-full object-cover"
              src={props.topProduct.images.nodes[7].url}
              alt="mosaic"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
