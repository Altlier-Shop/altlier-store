import type {Firestore} from 'firebase/firestore';
import {collection, addDoc, getDoc, doc} from 'firebase/firestore';

export const setUserEmail = async (firestoreDB: Firestore, email: string) => {
  try {
    console.log(firestoreDB);

    const exisitngDoc = await getUserEmail(firestoreDB, email);
    if (exisitngDoc) {
      return;
    }
    await addDoc(collection(firestoreDB, 'usersNewsletter'), {
      email,
    });
    // console.log('Document written with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};

export const getUserEmail = async (firestoreDB: Firestore, email: string) => {
  try {
    const docRef = doc(firestoreDB, 'users', email);
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  } catch (e) {
    console.error('Error adding document: ', e);
  }
};
