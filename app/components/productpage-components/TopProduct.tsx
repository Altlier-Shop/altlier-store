import {useState} from 'react';
import {Listbox} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {CartForm} from '@shopify/hydrogen';

interface TopProductProps {
  topProduct: any;
  onOpenSizeGuide: () => void;
}

export default function TopProduct(props: TopProductProps) {
  const [size, setSize] = useState(null);

  const productFirstNode = props.topProduct.variants.nodes[0];
  const selectedProduct = props.topProduct.variants.nodes.find(
    (variant: any) => variant.title === size,
  );
  // console.log(selectedProduct);
  const lines = selectedProduct
    ? [
        {
          merchandiseId: selectedProduct.id,
          quantity: 1,
        },
      ]
    : [];

  return (
    <div className="absolute z-30 w-96 right-0 top-20 grid justify-items-center">
      <div className="btn homepage-btn w-fit px-6 bg-altlierBlue text-white text-center">
        <span className="text-white pixel-font text-xl">
          {props.topProduct.title}
        </span>
      </div>
      <h1 className="mt-4 text-2xl">
        {productFirstNode.price.currencyCode}
        {Math.round(productFirstNode.price.amount)}
      </h1>
      <div className="mt-4 w-4/5 text-neutral-500">
        <p className="text-neutral-500">
          Product Code: {props.topProduct.productCode}
        </p>
        <p className="text-neutral-500">
          Material: {props.topProduct.material}
        </p>
        <br />
        <div className="flex justify-between mb-4">
          <span className="text-neutral-500">
            Size: {props.topProduct.sizes.join(', ')}
          </span>
          <button
            onClick={props.onOpenSizeGuide}
            className="border-b-2 border-neutral-500 text-neutral-500 w-32 text-center hover:text-altlierBlue hover:border-altlierBlue cursor-pointer"
          >
            Size Guide
          </button>
        </div>
        <Listbox value={size} onChange={setSize}>
          <div className="grid justify-items-center">
            <Listbox.Button className="group btn homepage-btn btn-light px-4 text-xl flex justify-between">
              <span className="group-hover:text-root-primary">
                {size ? size : 'Select Size'}
              </span>
              <ChevronDownIcon className="h-8 group-hover:fill-root-primary" />
            </Listbox.Button>

            <Listbox.Options className="w-5/6">
              {props.topProduct.sizes.map((size: string) => (
                <Listbox.Option
                  key={size}
                  value={size}
                  className="hover:bg-altlierBlue hover:text-root-primary px-2 border-b-2 border-x-2 border-altlierBlue my-0"
                >
                  {size}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
        <CartForm
          route="/cart"
          inputs={{lines}}
          action={CartForm.ACTIONS.LinesAdd}
        >
          <>
            <input name="analytics" type="hidden" />

            <button
              onClick={() => {
                window.location.href = window.location.origin + '#cart-aside';
              }}
              type="submit"
              disabled={
                selectedProduct && selectedProduct.availableForSale
                  ? false
                  : true
              }
              className={
                selectedProduct && selectedProduct.availableForSale
                  ? 'mt-4 btn homepage-btn btn-dark'
                  : 'mt-4 btn homepage-btn'
              }
            >
              {!selectedProduct || selectedProduct.availableForSale
                ? 'Trade'
                : 'Sold out'}
            </button>
          </>
        </CartForm>
        <div className="mt-4 text-neutral-400 italic">
          Pay securely with Apple Pay & Paypal AddToCartButton
        </div>
      </div>
    </div>
  );
}
