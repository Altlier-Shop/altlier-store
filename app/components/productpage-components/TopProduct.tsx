import {useState} from 'react';
import {Listbox} from '@headlessui/react';
import {ChevronDownIcon} from '@heroicons/react/20/solid';
import {CartForm} from '@shopify/hydrogen';
import {openAside} from '~/utils';

interface TopProductProps {
  topProduct: any;
  onOpenSizeGuide: () => void;
  mobile?: boolean;
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

  // Fetch Sizes
  props.topProduct.sizes = props.topProduct.options.find(
    (option: any) => option.name === 'Size',
  )?.values;

  // Fetch Material Information
  const reMaterial = new RegExp('Material:\\s*(.*)\\sProduct');
  const materialMatch = props.topProduct.description.match(reMaterial);
  props.topProduct.material = materialMatch ? materialMatch[1].trim() : '';

  // Fetch Product Code
  const reProduct = new RegExp('Product\\sCode\\s*:(.*)');
  const productCodeMatch = props.topProduct.description.match(reProduct);
  props.topProduct.productCode = productCodeMatch
    ? productCodeMatch[1].trim()
    : '';

  return (
    <>
      <div
        className={
          !props.mobile
            ? 'absolute z-30 w-fit right-12 top-20 grid justify-items-center'
            : ''
        }
      >
        <div className="btn homepage-btn w-fit px-6 bg-altlierBlue text-root-secondary text-center flex items-center">
          <span className="text-root-secondary pixel-font text-2xl">
            {props.topProduct.title}
          </span>
        </div>
        <h1 className="mt-2 text-xl default-font-bold">
          {productFirstNode.price.currencyCode}
          {Math.round(productFirstNode.price.amount)}
        </h1>
        <div
          className={`mt-4 ${
            props.mobile ? 'w-full' : 'w-fit'
          } [&>*]:text-neutral-400`}
        >
          <p>Product Code: {props.topProduct.productCode}</p>
          <p>Material: {props.topProduct.material}</p>
          <div className="flex justify-between mt-3 mb-3 [&>*]:text-neutral-400">
            <span>Size: {props.topProduct.sizes.join(', ')}</span>
            <button
              onClick={props.onOpenSizeGuide}
              className="border-b-2 border-neutral-400 w-32 text-center hover:text-altlierBlue hover:border-altlierBlue cursor-pointer"
            >
              Size Guide
            </button>
          </div>
          <Listbox value={size} onChange={setSize}>
            <div className="grid justify-items-center">
              <Listbox.Button className="group border-[1.5px] py-2 px-3 w-full rounded-full homepage-btn btn-light text-lg border-neutral-500 flex justify-between items-center default-font">
                <span className="group-hover:text-root-primary text-neutral-500">
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
          <div className="flex justify-center w-full">
            <CartForm
              route="/cart"
              inputs={{lines}}
              action={CartForm.ACTIONS.LinesAdd}
            >
              <>
                <input name="analytics" type="hidden" />

                <button
                  onClick={openAside}
                  type="submit"
                  disabled={
                    selectedProduct && selectedProduct.availableForSale
                      ? false
                      : true
                  }
                  className={
                    selectedProduct && selectedProduct.availableForSale
                      ? 'mt-6 btn homepage-btn btn-dark w-full'
                      : 'mt-6 btn homepage-btn pixel-font w-full 2xl:text-4xl lg:text-4xl md:text-xl'
                  }
                >
                  {!selectedProduct || selectedProduct.availableForSale
                    ? 'Trade'
                    : 'Sold out'}
                </button>
              </>
            </CartForm>
          </div>
          <div className="mt-4 text-sm text-root-tertiary italic flex justify-center">
            Pay securely with Apple Pay & Paypal
          </div>
        </div>
      </div>
    </>
  );
}
