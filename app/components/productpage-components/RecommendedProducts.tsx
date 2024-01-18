import {useEffect, useState, Suspense, useCallback, useContext} from 'react';
import ArrowIcon from '../svg-components/ArrowIcon';
import {Money, Image} from '@shopify/hydrogen';
import TopProduct from './TopProduct';
import {UpdateContext} from '~/components/Layout';
import XMarkIcon from '../svg-components/XMarkIcon';
import ProductMosaic from './ProductMosaic';

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
  const [showDetails, setShowDetails] = useState(false);

  const popupContext = useContext(UpdateContext);
  //   console.log(products);

  const selectProducts = JSON.parse(
    JSON.stringify([...selectedProducts]),
  ) as any[];

  const topProduct = selectProducts.find((products) => products.top);

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
    if (id === topProduct.id) {
      if (popupContext) {
        popupContext.popupFunc(true);
      }
      setShowDetails(true);
    }
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

  // console.log(topProduct);

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
        <ProductMosaic topProduct={topProduct} onClose={closePopup} />
      ) : (
        <div />
      )}
      <div
        className="circular z-40 w-[500px] xl:w-[700px] 2xl:w-[50vw]"
        style={{height: circleHeight * 3}}
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
            disabled={product.id === topProduct.id ? false : true}
          >
            <img
              loading="lazy"
              className="rotating-object"
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
