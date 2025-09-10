
"use client";

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "./firebase";

export const signUp = async (email: string, password: string, fullName: string): Promise<void> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
        await updateProfile(userCredential.user, {
            displayName: fullName,
        });
    }
};

export const signIn = (email: string, password: string):Promise<void> => {
  return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(auth, email, password)
      .then(() => resolve())
      .catch(error => reject(error));
  });
};

export const signInWithGoogle = (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, provider)
            .then(() => resolve())
            .catch(error => reject(error));
    });
};

export const signInWithGitHub = (): Promise<void> => {
    const provider = new GithubAuthProvider();
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, provider)
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
