"use client";

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./firebase";

export const signIn = (email: string, password: string):Promise<void> => {
  return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const signOut = (): Promise<void> => {
    return firebaseSignOut(auth);
}

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
    return firebaseOnAuthStateChanged(auth, callback);
};
