// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDPJQqHWr4zuGaB7ADK5S7BJDM8CDNNTfQ",
  authDomain: "saarthi-55fe9.firebaseapp.com",
  projectId: "saarthi-55fe9",
  storageBucket: "saarthi-55fe9.firebasestorage.app",
  messagingSenderId: "317227997471",
  appId: "1:317227997471:web:8e38f14b44e00df33e382a",
  measurementId: "G-3C8VFBMT47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
