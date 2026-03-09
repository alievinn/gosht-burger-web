import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCul1YZODlCWmHDrELouCoye5o1Iuq3SlQ",
  authDomain: "gosht-burger-web.firebaseapp.com",
  projectId: "gosht-burger-web",
  storageBucket: "gosht-burger-web.firebasestorage.app",
  messagingSenderId: "743576429134",
  appId: "1:743576429134:web:0bd96e92553648733d191f",
  measurementId: "G-FJEHVLFZK7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);