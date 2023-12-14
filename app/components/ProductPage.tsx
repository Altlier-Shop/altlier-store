import {useEffect, useState, Suspense, useCallback} from 'react';
import {Await} from '@remix-run/react';
import {Money, Image} from '@shopify/hydrogen';

interface ProductData {
  data: any;
}

export default function ProductPage(props: ProductData) {
  const [circleWidth, setCircleWidth] = useState(0);
  const [circleHeight, setCircleHeight] = useState(0);

  const updateCircleProportions = () => {
    // Calculate the window ratio
    const ratio = window.innerWidth / window.innerHeight;
    if (ratio < 1) {
      setCircleHeight(Math.floor(((window.innerHeight * ratio) / 10) * 4));
      setCircleWidth(Math.floor((window.innerWidth / 10) * 8));
    } else {
      setCircleWidth(Math.floor((window.innerWidth / ratio / 10) * 8));
      setCircleHeight(Math.floor((window.innerHeight / 10) * 4));
    }
  };

  useEffect(() => {
    updateCircleProportions();
    window.addEventListener('resize', updateCircleProportions);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', updateCircleProportions);
  }, []);

  return (
    <div className="h-screen w-full bg-root">
      <div className="grid h-full relative justify-center items-end overflow-hidden">
        <div className="absolute z-10 h-full w-full grid justify-items-center items-center">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={props.data.recommendedProducts}>
              {({products}) => (
                <RecommendedProducts
                  products={products}
                  circleWidth={circleWidth}
                  circleHeight={circleHeight}
                />
              )}
            </Await>
          </Suspense>
        </div>

        <div
          className="half-circle upper-circle"
          style={{width: circleWidth, height: circleHeight}}
        ></div>
        <div
          className="half-circle lower-circle"
          style={{width: circleWidth, height: circleHeight}}
        ></div>
      </div>
    </div>
  );
}

function RecommendedProducts({
  products,
  circleWidth,
  circleHeight,
}: {
  products: any;
  circleWidth: number;
  circleHeight: number;
}) {
  const [hoveredProductId, setHoveredProductId] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]); // we use those to keep the next t-shirt in memory
  const [productsQueue, setProductsQueue] = useState<any[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [previousRotationState, setPreviousRotationState] = useState<
    boolean | null
  >(null);

  const handleRotate = (clockWise: boolean) => {
    const products = [...productsQueue];
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
      selectProducts[2].animation = 'rotateRightBottom 1s ease-out forwards';
      selectProducts[3].animation = 'rotateBottomLeft 1s ease-out forwards';
      setSelectedProducts(selectProducts);
    }
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

  useEffect(() => {
    if (products && selectedProducts.length === 0) {
      const newProducts = [...products.nodes.slice(0, 4)];
      setProductsQueue(products.nodes);
      assignInitialPosition(newProducts);
      setSelectedProducts(newProducts);
    }
  }, [products, selectedProducts, productsQueue]);

  return (
    <div className="h-full w-full grid justify-center items-center">
      <div
        className="circular top-1/2"
        style={{height: circleHeight * 3, width: circleWidth * 1.3}}
      >
        <button
          onClick={() => handleRotate(false)}
          className="ml-0 absolute z-10 -top-40 left-40"
        >
          <span className="text-8xl font-bold">&larr;</span>
        </button>
        <button
          onClick={() => handleRotate(true)}
          className="ml-0 absolute z-10 -top-40 right-40"
        >
          <span className="text-8xl font-bold">&rarr;</span>
        </button>
        {selectedProducts.map((product: any) => (
          <div key={product.id}>
            <h1>{JSON.stringify(product.topRank)}</h1>
            <Image
              className="rotating-object"
              onMouseOver={() => setHoveredProductId(product.id)}
              onMouseLeave={() => setHoveredProductId('')}
              data={
                hoveredProductId !== product.id
                  ? product.images.nodes[0]
                  : product.images.nodes[1]
              }
              // aspectRatio="1/1"
              style={{
                height: `${circleHeight * 1.5}px`,
                // width: `${circleWidth * 1.3}px`,
                transform: product.initialPosition,
                animation: product.animation,
              }}
              sizes="(min-width: 20em) 20vw, 40vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
