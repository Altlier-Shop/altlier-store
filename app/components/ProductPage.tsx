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

  const renewProductsQueue = useCallback(
    (clockWise?: boolean) => {
      let adjustedQueue: any = [];
      if (clockWise) {
        // console.log('clockWise', clockWise);

        adjustedQueue = [...productsQueue.slice(0, productsQueue.length - 1)];
      } else {
        adjustedQueue = [...productsQueue.slice(1)];
        // console.log('clockWise', clockWise);
      }

      console.log(
        'adjustedQueue: ',
        adjustedQueue.map((e) => e.title),
      );
      if (adjustedQueue.length <= 4) {
        const queueAugments = [...products.nodes].filter(
          (product) => !adjustedQueue.includes(product),
        );
        console.log(
          'queueAugments: ',
          queueAugments.map((e) => e.title),
        );
        // Adjust the Queue
        const newQueue = [...queueAugments, ...adjustedQueue];
        console.log(
          'newQueue: ',
          newQueue.map((e) => e.title),
        );
        setProductsQueue(newQueue);
      } else {
        setProductsQueue(adjustedQueue);
      }
    },
    [productsQueue, products],
  );

  const handleRotate = (clockWise: boolean) => {
    if (clockWise) {
      // adjust products queue
      const newProducts = [...productsQueue.slice(productsQueue.length - 4)];
      //console.log(newProducts.map((product) => product.title));

      // assign position and rotation
      assignInitialPosition(newProducts);

      newProducts[0].animation = 'rotateLeftTop 1s ease-out forwards';
      newProducts[1].animation = 'rotateTopRight 1s ease-out forwards';
      newProducts[2].animation = 'rotateRightBottom 1s ease-out forwards';
      newProducts[3].animation = 'rotateBottomLeft 1s ease-out forwards';

      selectProducts(newProducts);
      renewProductsQueue(true);
    } else {
      // adjust products queue
      const newProducts = [...productsQueue.slice(productsQueue.length - 4)];
      const firstQueueItem = [...productsQueue.slice(1)];
      const oldProducts = [...selectedProducts];
      console.log(newProducts.map((product) => product.title));

      const newProductCombination = [...newProducts];
      newProductCombination[0] = newProducts[2];
      newProductCombination[1] = newProducts[3];
      newProductCombination[2] = oldProducts[3];
      newProductCombination[3] = firstQueueItem[0];
      // assign position and rotation
      assignInitialPosition(newProductCombination);

      newProducts[0].animation = 'rotateTopLeft 1s ease-out forwards';
      newProducts[1].animation = 'rotateRightTop 1s ease-out forwards';
      newProducts[2].animation = 'rotateBottomRight 1s ease-out forwards';
      newProducts[3].animation = 'rotateLeftBottom 1s ease-out forwards';

      selectProducts(newProducts);
      renewProductsQueue(false); // we remove queue first item
    }
  };

  const assignInitialPosition = (selectedProducts: any) => {
    let degree = 90; // we intend to start with 180 degrees
    for (let i = 0; i < selectedProducts.length; i++) {
      degree += 90;
      selectedProducts[
        i
      ].initialPosition = `rotate(${degree}deg) translateX(50%) rotate(90deg)`;
    }
  };
  const selectProducts = useCallback((selectedProducts: any) => {
    setSelectedProducts(selectedProducts);
  }, []);

  useEffect(() => {
    if (products && selectedProducts.length === 0) {
      const newProducts = [...productsQueue.slice(productsQueue.length - 4)];
      assignInitialPosition(newProducts);
      selectProducts(newProducts);
      // console.log(newProducts.map((product) => product.title));

      renewProductsQueue(true);
    }
  }, [
    products,
    selectProducts,
    selectedProducts,
    productsQueue,
    renewProductsQueue,
  ]);

  return (
    <div className="h-full w-full grid justify-center items-center">
      <div
        className="h-full w-full circular top-1/2"
        style={{height: circleHeight * 3, width: circleWidth * 1.5}}
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
                transform: product.initialPosition,
                animation: product.animation,
              }}
              sizes="(min-width: 20em) 40vw, 50vw"
            />
          </div>
        ))}
      </div>

      <br />
    </div>
  );
}
