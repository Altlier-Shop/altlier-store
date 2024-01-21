// Import the functions you need from the SDKs you need
// import {initializeApp} from 'firebase/app';
// import {getFirestore} from 'firebase/firestore';
import * as admin from 'firebase-admin';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// export function initFireStore() {
//   // Your web app's Firebase configuration
//   const firebaseConfig = {
//     apiKey: 'AIzaSyDz4WEPZK9fpnr7JIWKUtEgpd8R7mpvg_Q',
//     authDomain: 'altlier-co.firebaseapp.com',
//     projectId: 'altlier-co',
//     storageBucket: 'altlier-co.appspot.com',
//     messagingSenderId: '702220887145',
//     appId: '1:702220887145:web:24f0a2f2a2f779364a6ef8',
//   };

//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//   // const db = getFirestore(app);
//   return app;
// }

/**
 * Create a Firestore client.
 */

export function firebaseInit() {
  const params = {
    type: serviceAccount.type,
    projectId: serviceAccount.project_id,
    privateKeyId: serviceAccount.private_key_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
    clientId: serviceAccount.client_id,
    authUri: serviceAccount.auth_uri,
    tokenUri: serviceAccount.token_uri,
    authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
    clientC509CertUrl: serviceAccount.client_x509_cert_url,
  };

  const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'),
    }),
  });
  console.log(firebaseApp);

  return firebaseApp;
}
