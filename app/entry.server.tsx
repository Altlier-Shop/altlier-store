import type {EntryContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    connectSrc: ['*'],
  });




  const myHeaders = new Headers();
  myHeaders.append("X-Shopify-Access-Token", "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");
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "webhook": {
      "address": "https://ec69-2405-201-5023-4005-4519-73bb-db6e-b779.ngrok-free.app/api/orderCreate",
      "topic": "orders/create",
      "format": "json"
    }
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
  };

  const response = await fetch("https://a29f5a-2.myshopify.com/admin/api/2024-04/webhooks.json", requestOptions);
  const result = await response.text();

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
