// Import the functions you need from the SDKs you need
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCRWjDg0WXB0mIjzltiam-R2azUKx7bQvk',
  authDomain: 'altlier.firebaseapp.com',
  projectId: 'altlier',
  storageBucket: 'altlier.appspot.com',
  messagingSenderId: '790479728783',
  appId: '1:790479728783:web:cc59c7368a9a15709180fa',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
