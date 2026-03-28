import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCf9sm4Nr9xWUKJ3mnJ-tDTlAblDumV-Ho",
  authDomain: "soundcircle-ca8cc.firebaseapp.com",
  projectId: "soundcircle-ca8cc",
  storageBucket: "soundcircle-ca8cc.firebasestorage.app",
  messagingSenderId: "648495875202",
  appId: "1:648495875202:web:6a03cce9a4414cca6fe09b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
