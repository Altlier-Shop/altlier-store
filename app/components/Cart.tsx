import {CartForm, Image, Money} from '@shopify/hydrogen';
import type {CartLineUpdateInput} from '@shopify/hydrogen/storefront-api-types';
import {Link} from '@remix-run/react';
import type {CartApiQueryFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/utils';

type CartLine = CartApiQueryFragment['lines']['nodes'][0];

type CartMainProps = {
  cart: CartApiQueryFragment | null;
  layout: 'page' | 'aside';
};

export function CartMain({layout, cart}: CartMainProps) {
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart.discountCodes.filter((code) => code.applicable).length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      <CartDetails cart={cart} layout={layout} />
    </div>
  );
}

function CartDetails({layout, cart}: CartMainProps) {
  const cartHasItems = !!cart && cart.totalQuantity > 0;

  return (
    <div className="cart-details">
      <CartLines lines={cart?.lines} layout={layout} />
      {cartHasItems && (
        <CartSummary
          cost={cart.cost}
          layout={layout}
          discountCodes={cart.discountCodes}
        >
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} />
        </CartSummary>
      )}
    </div>
  );
}

function CartLines({
  lines,
  layout,
}: {
  layout: CartMainProps['layout'];
  lines: CartApiQueryFragment['lines'] | undefined;
}) {
  if (!lines) return null;

  return (
    <div>
      <ul>
        {lines.nodes.map((line) => (
          <CartLineItem key={line.id} line={line} layout={layout} />
        ))}
      </ul>
    </div>
  );
}

function CartLineItem({
  layout,
  line,
}: {
  layout: CartMainProps['layout'];
  line: CartLine;
}) {
  const {id, merchandise} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {id: lineId} = line;

  return (
    <li key={id} className="cart-line border-t-2 border-root-tertiary">
      <div className="flex w-full justify-between relative">
        <CartLineRemoveButton lineIds={[lineId]} />
        <div className="flex">
          {image && (
            <Image
              alt={title}
              aspectRatio="1/1"
              data={image}
              height={100}
              loading="lazy"
              width={100}
              className="border-2 p-2 border-altlierBlue bg-root-tertiary"
            />
          )}

          <div>
            <Link
              prefetch="intent"
              to={lineItemUrl}
              onClick={() => {
                if (layout === 'aside') {
                  // close the drawer
                  window.location.href = lineItemUrl;
                }
              }}
            >
              <p>
                <strong>{product.title}</strong>
              </p>
            </Link>
            <CartLineQuantity line={line} />
            <ul>
              {selectedOptions.map((option) => (
                <li key={option.name} className="text-root-tertiary text-sm">
                  {option.name}: {option.value}
                </li>
              ))}
            </ul>
            <CartLinePrice line={line} as="span" />
          </div>
        </div>
        <div className="flex items-end">
          <CartLineChangeQuantity line={line} />
        </div>
      </div>
    </li>
  );
}

function CartCheckoutActions({checkoutUrl}: {checkoutUrl: string}) {
  if (!checkoutUrl) return null;

  const handleCheckOut = () => {
    window.location.href = checkoutUrl;
  };

  return (
    <div className="grid justify-center">
      <button
        className="mt-6 px-6 btn homepage-btn btn-dark pixel-font"
        onClick={handleCheckOut}
      >
        Check Out
      </button>
      <br />
    </div>
  );
}

export function CartSummary({
  cost,
  layout,
  children = null,
  discountCodes,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment['cost'];
  layout: CartMainProps['layout'];
  discountCodes: CartApiQueryFragment['discountCodes'];
}) {
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside pl-2 pr-6';

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <div className="flex justify-between mb-4">
        <span className="text-root-tertiary">Subtotal</span>
        <span>
          {cost?.subtotalAmount?.amount ? (
            <Money className="text-root-tertiary" data={cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-root-tertiary">Shipping Worldwide</span>
        <span className="text-root-tertiary">-</span>
      </div>
      <div className="my-2 border-2 border-t-root-tertiary"></div>
      <div className="flex justify-between gap-4">
        <CartDiscounts discountCodes={discountCodes} />
        <div className="w-full">
          <span className="text-sm text-root-tertiary">
            Digital Wallet Address:
          </span>
          <input
            className="bg-root-secondary w-full rounded-full px-2 py-0.5 text-root-tertiary text-sm"
            type="text"
            name="discountCode"
          />
        </div>
      </div>
      <div className="my-2 border-2 border-t-root-tertiary"></div>
      <div className="flex justify-between">
        <span className="text-root-tertiary text-xl">Total</span>
        <span className="text-xl">
          {cost?.subtotalAmount?.amount ? (
            <Money className="text-root-tertiary" data={cost?.subtotalAmount} />
          ) : (
            '-'
          )}
        </span>
      </div>
      <div className="mt-2 border-2 border-t-root-tertiary"></div>
      {children}
      <div className="mb-6 text-root-tertiary text-sm italic flex justify-center">
        Pay securely with Apple Pay & Paypal
      </div>
    </div>
  );
}

function CartLineRemoveButton({lineIds}: {lineIds: string[]}) {
  return (
    <div className="absolute right-0">
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.LinesRemove}
        inputs={{lineIds}}
      >
        <button
          type="submit"
          className="w-6 h-6 flex items-center justify-center bg-root-tertiary active:bg-neutral-400 border-2 retro-border"
        >
          &#x2715;
        </button>
      </CartForm>
    </div>
  );
}

function CartLineQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {quantity} = line;

  return (
    <div className="cart-line-quantiy">
      <span className="text-sm text-root-tertiary">
        Quantity: {quantity} &nbsp;&nbsp;
      </span>
    </div>
  );
}

function CartLineChangeQuantity({line}: {line: CartLine}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));
  return (
    <div className="flex items-center gap-3">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1}
          name="decrease-quantity"
          value={prevQuantity}
          className="rounded-full px-2.5 border border-altlierBlue"
        >
          <span className="text-lg">&#8722;</span>
        </button>
      </CartLineUpdateButton>
      <span className="text-lg ">{quantity}</span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          className="rounded-full px-2.5 border border-altlierBlue"
        >
          <span className="text-lg">&#43;</span>
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

function CartLinePrice({
  line,
  priceType = 'regular',
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: 'regular' | 'compareAt';
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  const moneyV2 =
    priceType === 'regular'
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return (
    <div>
      <Money withoutTrailingZeros {...passthroughProps} data={moneyV2} />
    </div>
  );
}

export function CartEmpty({
  hidden = false,
  layout = 'aside',
}: {
  hidden: boolean;
  layout?: CartMainProps['layout'];
}) {
  return (
    <div
      hidden={hidden}
      className="[&>p]:text-root-tertiary border-t-2 border-root-tertiary [&>p]:text-sm"
    >
      <br />
      <p>
        Your cart is currently empty. Explore our curated selection to find
        products that match your preferences. Shop confidently with our 7-day
        refund policy.
      </p>
      <br />
      <p>
        Plus, with every purchase, receive a complimentary NFT! NFTs will be
        sent to your digital wallet address after 7 days from item delivery.
      </p>
      <br />
      <p>
        Shop confidently with our{' '}
        <a
          href="/policies/refund-policy"
          className="underline underline-offset-[6px]"
        >
          7-day refund policy.
        </a>
      </p>
      <br />
      {/* <Link
        to="/collections"
        onClick={() => {
          if (layout === 'aside') {
            window.location.href = '/collections';
          }
        }}
      >
        Continue shopping →
      </Link> */}
    </div>
  );
}

function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartApiQueryFragment['discountCodes'];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({code}) => code) || [];

  return (
    <div className="w-full">
      {/* Have existing discount, display it with a remove option */}
      <dl hidden={!codes.length}>
        <div>
          <dt>Discount(s)</dt>
          <UpdateDiscountForm>
            <div className="cart-discount">
              <code>{codes?.join(', ')}</code>
              &nbsp;
              <button>Remove</button>
            </div>
          </UpdateDiscountForm>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="w-full">
          <span className="text-sm text-root-tertiary">Referral Code:</span>
          <input
            className="bg-root-secondary w-full rounded-full px-2 py-0.5 text-root-tertiary text-sm"
            type="text"
            name="discountCode"
          />
        </div>
      </UpdateDiscountForm>
    </div>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLineUpdateButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}
