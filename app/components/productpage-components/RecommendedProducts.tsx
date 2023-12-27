import {useEffect, useState, Suspense, useCallback, useContext} from 'react';
import ArrowIcon from '../svg-components/ArrowIcon';
import {Money, Image} from '@shopify/hydrogen';
import TopProduct from './TopProduct';
import {UpdateContext} from '~/components/Layout';
import XMarkIcon from '../svg-components/XMarkIcon';

export default function RecommendedProducts({
  products,
  circleWidth,
  circleHeight,
}: {
  products: any;
  circleWidth: number;
  circleHeight: number;
}) {
  const [hoveredProductId, setHoveredProductId] = useState('');
  const [tempHoveredProductId, setTempHoveredProductId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // we use those to keep the next t-shirt in memory
  const [productsQueue, setProductsQueue] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [previousRotationState, setPreviousRotationState] = useState<
    boolean | null
  >(null);
  const [disableRotation, setDisableRotation] = useState(false);
  const [openSizeGuide, setOpenSizeGuide] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const popupContext = useContext(UpdateContext);
  //   console.log(products);

  const selectProducts = JSON.parse(
    JSON.stringify([...selectedProducts]),
  ) as any[];

  const topProduct = selectProducts.find((products) => products.top);

  if (topProduct) {
    // Fetch Sizes
    topProduct.sizes = topProduct.options.find(
      (option: any) => option.name === 'Size',
    ).values;

    // Fetch Material Information
    const reMaterial = new RegExp('Material:\\s*(.*)\\sProduct');
    const materialMatch = topProduct.description.match(reMaterial);
    topProduct.material = materialMatch ? materialMatch[1].trim() : '';

    // Fetch Product Code
    const reProduct = new RegExp('Product\\sCode\\s*:(.*)');
    const productCodeMatch = topProduct.description.match(reProduct);
    topProduct.productCode = productCodeMatch ? productCodeMatch[1].trim() : '';
  }

  const handleRotate = (clockWise: boolean) => {
    setDisableRotation(true);
    const products = JSON.parse(JSON.stringify(productsQueue)) as any[];
    // console.log(products.map((product) => product.title));
    const selectProducts = [];
    if (!clockWise) {
      let start = startIndex;
      if (!previousRotationState) {
        if (startIndex < products.length - 1) {
          start = startIndex + 1;
          setStartIndex(startIndex + 1);
        } else {
          start = 0;
          setStartIndex(0);
        }
      }
      setPreviousRotationState(false);

      let j = 0;
      for (let i = 0; i < 4; i++) {
        if (i + start < products.length) {
          selectProducts.push(products[i + start]);
        } else {
          selectProducts.push(products[j]);
          j++;
        }
      }
      assignInitialPosition(selectProducts);
      // console.log(selectProducts.map((product) => product.title));
      selectProducts[0].animation = 'rotateTopLeft 1s ease-out forwards';
      selectProducts[1].animation = 'rotateRightTop 1s ease-out forwards';
      selectProducts[2].animation = 'rotateBottomRight 1s ease-out forwards';
      selectProducts[2].top = true;
      selectProducts[3].animation = 'rotateLeftBottom 1s ease-out forwards';
      setSelectedProducts(selectProducts);
    } else {
      let start = startIndex;
      if (previousRotationState) {
        if (startIndex > 0) {
          start = startIndex - 1;
          setStartIndex(startIndex - 1);
        } else {
          start = products.length - 1;
          setStartIndex(products.length - 1);
        }
      }
      setPreviousRotationState(true);

      let j = 0;
      for (let i = 0; i < 4; i++) {
        if (i + start < products.length) {
          selectProducts.push(products[i + start]);
        } else {
          selectProducts.push(products[j]);
          j++;
        }
      }
      assignInitialPosition(selectProducts);
      // console.log(selectProducts.map((product) => product.title));
      selectProducts[0].animation = 'rotateLeftTop 1s ease-out forwards';
      selectProducts[1].animation = 'rotateTopRight 1s ease-out forwards';
      selectProducts[1].top = true;
      selectProducts[2].animation = 'rotateRightBottom 1s ease-out forwards';
      selectProducts[3].animation = 'rotateBottomLeft 1s ease-out forwards';
      setSelectedProducts(selectProducts);
    }
    setTimeout(() => {
      setDisableRotation(false);
    }, 650);
  };

  const assignInitialPosition = (selectedProducts: any) => {
    let degree = 0; // we intend to start with 90 degrees
    for (let i = 0; i < selectedProducts.length; i++) {
      degree += 90;
      selectedProducts[
        i
      ].initialPosition = `rotate(${degree}deg) translateX(50%) rotate(90deg)`;
    }
  };

  const handleImageHover = (id: string) => {
    if (id === topProduct.id) {
      setTempHoveredProductId(id);
    }
  };
  const openPopup = (id: string) => {
    if (popupContext) {
      popupContext.popupFunc(true);
    }
    setShowDetails(true);
  };
  const closePopup = () => {
    if (popupContext) {
      popupContext.popupFunc(false);
    }
    setShowDetails(false);
  };
  useEffect(() => {
    if (products && selectedProducts.length === 0) {
      const newProducts = JSON.parse(
        JSON.stringify([...products.nodes.slice(0, 4)]),
      ) as any[];
      newProducts[2].top = true;
      setProductsQueue(products.nodes);
      assignInitialPosition(newProducts);
      setSelectedProducts(newProducts);
    }
  }, [products, selectedProducts, productsQueue]);

  useEffect(() => {
    if (tempHoveredProductId !== '') {
      setTimeout(() => {
        if (tempHoveredProductId !== '') {
          setHoveredProductId(tempHoveredProductId);
        }
      }, 200);
    } else {
      setHoveredProductId('');
    }
  }, [tempHoveredProductId, hoveredProductId]);

  console.log(topProduct);

  return (
    <div className="h-full w-full grid justify-center items-center">
      {topProduct ? (
        <TopProduct
          topProduct={topProduct}
          onOpenSizeGuide={() => setOpenSizeGuide(true)}
        />
      ) : (
        <div />
      )}

      {topProduct && showDetails ? (
        <button
          className="fixed top-0 z-[1000] bg-black bg-opacity-40 h-screen w-screen flex items-center justify-center"
          onClick={closePopup}
        >
          <div className="h-5/6 w-5/6 bg-root-secondary p-6">
            <div className="w-full h-full grid grid-cols-12 grid-rows-10">
              <div className="col-span-10 flex justify-between items-end">
                <div className="divide-y-0 divide-x-0">
                  <p className="text-sm">SERIES 0</p>
                  <p className="text-sm">{topProduct.title}</p>
                </div>
                <p className="align-self-end text-sm mr-4">
                  {topProduct.productCode}
                </p>
              </div>
              <button
                onClick={closePopup}
                className="col-start-12 flex items-start justify-end  divide-y-0 divide-x-0"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-root-tertiary active:bg-neutral-400 border-2 retro-border">
                  <XMarkIcon />
                </div>
              </button>

              <div className="row-start-2 row-span-full col-start-1 col-span-4 border-altlierBlue border mr-4">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="col-1"
                />
              </div>
              <div className="row-start-2 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4 mb-4">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>

              <div className="row-start-2 row-span-6 col-start-7 col-span-4 border-altlierBlue border mr-4 mb-4">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>
              <div className="row-start-2 row-span-full col-start-11 col-span-2 border-altlierBlue border">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>
              <div className="row-start-5 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4 mb-4">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>
              <div className="row-start-8 row-span-3 col-start-5 col-span-2 border-altlierBlue border mr-4">
                <img
                  className="h-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>
              <div className="row-start-8 row-span-3 col-start-7 col-span-4 border-altlierBlue border mr-4">
                <img
                  className="h-full w-full"
                  src={topProduct.images.nodes[1].url}
                  alt="mosaic"
                />
              </div>
            </div>
          </div>
        </button>
      ) : (
        <div />
      )}

      <div
        className="circular z-40"
        style={{height: circleHeight * 3, width: circleWidth * 1.1}}
      >
        <div className="absolute z-50 top-[72%] w-full grid justify-center">
          <button
            onClick={() => openPopup(topProduct.id)}
            className="border-b-2 text-neutral-400 border-neutral-400 w-32 text-center hover:text-altlierBlue hover:border-altlierBlue cursor-pointer"
          >
            See more details
          </button>
        </div>
        <button
          disabled={disableRotation}
          onClick={() => handleRotate(false)}
          className={`absolute top-1/2 w-40 h-96 -left-10 grid justify-center ${
            disableRotation ? '' : 'z-30'
          }`}
        >
          <ArrowIcon direction={'left'} width={'3rem'} />
        </button>
        <button
          disabled={disableRotation}
          onClick={() => handleRotate(true)}
          className={`absolute top-1/2 w-40 h-96 -right-10 grid justify-center ${
            disableRotation ? '' : 'z-30'
          }`}
        >
          <ArrowIcon direction={'right'} width={'3rem'} />
        </button>
        {selectProducts.map((product: any) => (
          <button
            key={product.id}
            onMouseOver={() => handleImageHover(product.id)}
            onFocus={() => ''}
            onClick={() => openPopup(product.id)}
            onMouseLeave={() => setTempHoveredProductId('')}
          >
            <img
              loading="lazy"
              className={
                product.id === topProduct.id
                  ? 'rotating-object cursor-pointer w-full'
                  : 'rotating-object'
              }
              src={
                hoveredProductId !== '' && hoveredProductId === product.id
                  ? product.images.nodes[1].url
                  : product.images.nodes[0].url
              }
              style={{
                // height: `${circleHeight * 2}px`,
                // width: `${circleWidth * 1.3}px`,
                transform: product.initialPosition,
                animation: product.animation,
              }}
              alt="shirt"
            ></img>
          </button>
        ))}
      </div>
    </div>
  );
}
