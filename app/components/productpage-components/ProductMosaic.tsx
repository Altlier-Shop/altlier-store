import XMarkIcon from '../svg-components/XMarkIcon';

interface MosaicProps {
  topProduct: any;
  onClose: () => void;
}

export default function ProductMosaic(props: MosaicProps) {
  return (
    <div className="fixed top-0 z-[1000] bg-black bg-opacity-40 h-screen w-screen flex items-center justify-center">
      <div className="h-5/6 w-5/6 bg-root-secondary p-6">
        <div className="w-full h-full grid grid-cols-12 grid-rows-10">
          <div className="col-span-10 flex justify-between items-end">
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
            className="col-start-12 flex items-start justify-end  divide-y-0 divide-x-0"
          >
            <div className="w-8 h-8 flex items-center justify-center bg-root-tertiary active:bg-neutral-400 border-2 retro-border">
              <XMarkIcon />
            </div>
          </button>

          <div className="row-start-2 row-span-full col-start-1 col-span-4 border-altlierBlue border mr-4">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="col-1"
            />
          </div>
          <div className="row-start-2 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>

          <div className="row-start-2 row-span-6 col-start-7 col-span-4 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-2 row-span-full col-start-11 col-span-2 border-altlierBlue border">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-5 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4 mb-4">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-8 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4">
            <img
              className="h-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>
          <div className="row-start-8 row-span-3 col-start-7 col-span-4 border-altlierBlue border mr-4">
            <img
              className="h-full w-full"
              src={props.topProduct.images.nodes[1].url}
              alt="mosaic"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
