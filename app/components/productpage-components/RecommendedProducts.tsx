import {useEffect, useState, Suspense, useCallback} from 'react';
import ArrowIcon from '../svg-components/ArrowIcon';
import {Money, Image} from '@shopify/hydrogen';
import TopProduct from './TopProduct';

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
    }, 500);
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
        setHoveredProductId(tempHoveredProductId);
      }, 150);
    } else {
      setHoveredProductId('');
    }
  }, [tempHoveredProductId]);

  return (
    <div className="h-full w-full grid justify-center items-center">
      {topProduct ? (
        <TopProduct
          topProduct={topProduct}
          onOpenSizeGuide={() => setOpenSizeGuide(true)}
        />
      ) : (
        <div></div>
      )}

      <div
        className="circular z-40"
        style={{height: circleHeight * 3, width: circleWidth * 1.3}}
      >
        <button
          disabled={disableRotation}
          onClick={() => handleRotate(false)}
          className="absolute top-1/2 left-20"
        >
          <span className="absolute z-10 font-bold h-24 w-32 -ml-16"></span>
          <ArrowIcon direction={'left'} />
        </button>
        <button
          disabled={disableRotation}
          onClick={() => handleRotate(true)}
          className="absolute top-1/2 right-20"
        >
          <span className="absolute z-10 font-bold h-24 w-32 -ml-16"></span>
          <ArrowIcon direction={'right'} />
        </button>
        {selectProducts.map((product: any) => (
          <div key={product.id}>
            <img
              className={
                product.id === topProduct.id
                  ? 'rotating-object cursor-pointer'
                  : 'rotating-object'
              }
              onMouseOver={() => handleImageHover(product.id)}
              onFocus={() => handleImageHover(product.id)}
              onMouseLeave={() => setTempHoveredProductId('')}
              src={
                hoveredProductId !== product.id
                  ? product.images.nodes[0].url
                  : product.images.nodes[1].url
              }
              style={{
                height: `${circleHeight * 2}px`,
                // width: `${circleWidth * 1.3}px`,
                transform: product.initialPosition,
                animation: product.animation,
              }}
              alt="shirt"
            ></img>
          </div>
        ))}
      </div>
    </div>
  );
}
