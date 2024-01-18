import {db} from './firebase-setup';
import {collection, addDoc, getDoc, doc} from 'firebase/firestore';

export const setUserEmail = async (email: string) => {
  try {
    const exisitngDoc = await getUserEmail(email);
    if (exisitngDoc) {
      return;
    }
    await addDoc(collection(db, 'usersNewsletter'), {
      email,
    });
    // console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getUserEmail = async (email: string) => {
  try {
    const docRef = doc(db, 'users', email);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};
