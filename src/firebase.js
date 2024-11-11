import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDv87i5H1AOnEpbL9bsvZToLsf8FRxuD8I",
    authDomain: "notes-app-e03ed.firebaseapp.com",
    projectId: "notes-app-e03ed",
    storageBucket: "notes-app-e03ed.firebasestorage.app",
    messagingSenderId: "667831906713",
    appId: "1:667831906713:web:5f63bfe1aed37cd7556308"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const notesCollection = collection(db, "notes");
