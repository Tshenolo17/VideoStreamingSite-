import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  writeBatch,
  query,
  getDocs,
  arrayUnion,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDEXjoCzyYb3lFgqJaLXqa91lBP_oXnKu8',
  authDomain: 'fun-olympics-713d0.firebaseapp.com',
  projectId: 'fun-olympics-713d0',
  storageBucket: 'fun-olympics-713d0.appspot.com',
  messagingSenderId: '978348802168',
  appId: '1:978348802168:web:59c2ab98cee92057a7ad8d',
  measurementId: 'G-TY02NNJ13K',
};

const firebaseApp = initializeApp(firebaseConfig);

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export const auth = getAuth();

export const signInWithGooglePopup = () =>
  signInWithPopup(auth, googleProvider);

export const signInWithGoogleRedirect = () =>
  signInWithRedirect(auth, googleProvider);

export const db = getFirestore();

export const addCollectionAndDocuments = async (
  collectionKey,
  objectsToAdd
) => {
  const collectionRef = collection(db, collectionKey);
  const batch = writeBatch(db);

  objectsToAdd.forEach(object => {
    const docRef = doc(collectionRef, object.sportingCode.toLowerCase());
    batch.set(docRef, object);
  });

  await batch.commit();
  console.log('done');
};

export const getUsers = async () => {
  const collectionRef = collection(db, 'users');
  const q = query(collectionRef);
  const querySnapshot = await getDocs(q);
  const data = ([] = querySnapshot.docs.map(docSnapshot => {
    return { id: docSnapshot.id, ...docSnapshot.data() };
  }));

  return data;
};

export const getCategoriesAndDocuments = async () => {
  const collectionRef = collection(db, 'categories');
  const q = query(collectionRef);
  const querySnapshot = await getDocs(q);
  const data = ([] = querySnapshot.docs.map(docSnapshot => {
    return docSnapshot.data();
  }));

  return data;
};

export const getUserAccount = async userId => {
  let data = {};
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    querySnapshot.forEach(doc => {
      if (userId === doc.id) {
        data = doc.data();
      }
    });
  } catch (e) {
    console.error('Error getting documents: ', e);
  }
  return data;
};

export const createUserDocumentFromAuth = async (
  userAuth,
  additionalInformation = {}
) => {
  if (!userAuth) return;

  const userDocRef = doc(db, 'users', userAuth.uid);

  const userSnapshot = await getDoc(userDocRef);

  if (!userSnapshot.exists()) {
    const { email } = userAuth;
    const createdAt = new Date();

    try {
      if (additionalInformation.userType === 'Broadcaster') {
        await setDoc(userDocRef, {
          email,
          createdAt,
          blocked: false,
          verified: false,
          userType: 'Broadcaster',
          ...additionalInformation,
        });
      } else {
        await setDoc(userDocRef, {
          email,
          createdAt,
          blocked: false,
          userType: 'Spectator',
          ...additionalInformation,
        });
      }
    } catch (error) {
      console.log('error creating the user', error.message);
    }
  }

  return userDocRef;
};

export const createAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

  return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInAuthUserWithEmailAndPassword = async (email, password) => {
  if (!email || !password) return;

  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = async () => await signOut(auth);

export const onAuthStateChangedListener = callback =>
  onAuthStateChanged(auth, callback);

export const blockUser = async id => {
  const userRef = doc(db, 'users', `${id}`);

  // Set the "capital" field of the city 'DC'
  await updateDoc(userRef, {
    blocked: true,
  });
};
export const unBlockUser = async id => {
  const userRef = doc(db, 'users', `${id}`);

  // Set the "capital" field of the city 'DC'
  await updateDoc(userRef, {
    blocked: false,
  });
};

export const verifyUser = async id => {
  const userRef = doc(db, 'users', `${id}`);

  // Set the "capital" field of the city 'DC'
  await updateDoc(userRef, {
    verified: true,
  });
};

// export const deleteUser = async id => {
//   const userRef = doc(db, 'users', `${id}`);

//   // Set the "capital" field of the city 'DC'
//   await deleteDoc(userRef, {
//     verified: true,
//   });
// };

export const addVideo = async (sportingCode, videoDetails) => {
  const videosRef = doc(db, 'categories', `${sportingCode}`);
  await updateDoc(videosRef, {
    videos: arrayUnion(videoDetails),
  });
};
