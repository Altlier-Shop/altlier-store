import {useEffect, useState, Suspense} from 'react';
import {Await} from '@remix-run/react';
import ProductCarousel from './productpage-components/ProductCarousel';
import ProductMosaic from './productpage-components/ProductMosaic';
import TopProduct from './productpage-components/TopProduct';
import SizeGuide from './productpage-components/SizeGuide';

interface ProductData {
  recommendedProducts: any;
}

export default function ProductPage(props: ProductData) {
  const [circleWidth, setCircleWidth] = useState(0);
  const [circleHeight, setCircleHeight] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [sizeGuideVisible, setSetSizeGuideVisible] = useState(false);

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

  function handleSizeGuide(open: boolean) {
    setSetSizeGuideVisible(open);
  }

  useEffect(() => {
    updateCircleProportions();
    window.addEventListener('resize', updateCircleProportions);
    // Cleanup the event listener on component unmount
    return () => window.removeEventListener('resize', updateCircleProportions);
  }, []);

  useEffect(() => {
    if (props.recommendedProducts.products && !currentProduct) {
      setCurrentProduct(props.recommendedProducts.products.nodes[0]);
    }
  }, [props.recommendedProducts, currentProduct]);

  return (
    <div className="h-screen w-full bg-root-primary">
      <div className="grid h-full relative justify-center items-end overflow-hidden">
        <TopProduct
          topProduct={
            currentProduct
              ? currentProduct
              : props.recommendedProducts.products.nodes[0]
          }
          onOpenSizeGuide={() => handleSizeGuide(true)}
          mobile={false}
        />

        <div className="absolute z-20 h-full w-full flex items-end">
          <ProductCarousel
            products={props.recommendedProducts.products.nodes}
            onChange={setCurrentProduct}
            onDetailsClick={setProductDetails}
          />
        </div>

        {sizeGuideVisible && (
          <div className="absolute z-50 h-full w-full flex items-end">
            <SizeGuide onClose={() => handleSizeGuide(false)} />
          </div>
        )}

        {productDetails && currentProduct && (
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
