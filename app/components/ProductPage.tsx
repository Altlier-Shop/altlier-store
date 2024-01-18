import {useEffect, useState, Suspense} from 'react';
import {Await} from '@remix-run/react';
import ProductCarousel from './productpage-components/ProductCarousel';
import ProductMosaic from './productpage-components/ProductMosaic';

interface ProductData {
  data: any;
}

export default function ProductPage(props: ProductData) {
  const [circleWidth, setCircleWidth] = useState(0);
  const [circleHeight, setCircleHeight] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

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
    <div className="h-screen w-full bg-root-primary">
      <div className="grid h-full relative justify-center items-end overflow-hidden">
        <div className="absolute z-10 h-full w-full flex items-end">
          <Suspense fallback={<div>Loading...</div>}>
            <Await resolve={props.data.recommendedProducts}>
              {({products}) => (
                <ProductCarousel
                  products={products.nodes}
                  onChange={setCurrentProduct}
                  onDetailsClick={setProductDetails}
                />
              )}
            </Await>
          </Suspense>
        </div>
        {!!productDetails && (
          <ProductMosaic
            topProduct={currentProduct}
            onClose={() => setProductDetails(null)}
          />
        )}
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
