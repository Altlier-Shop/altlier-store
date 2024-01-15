import {json, type ActionFunctionArgs} from '@remix-run/server-runtime';

export async function action({request, context}: ActionFunctionArgs) {
  //   const {storefront} = context;

  //   try {
  //     const data = await request.json();
  //     const points = 100;

  //     const data = await storefront.mutate(UPDATE_CUSTOMER_POINTS_MUTATION, {
  //       variables: {
  //         points,
  //       },
  //     });
  //   } catch (error) {}

  const data = await request.json();
  const dataString = JSON.stringify(data, null, 2);

  console.log(dataString);

  return json({});
}
