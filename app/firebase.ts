import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// import  admin  from 'firebase-admin';
// import serviceAccount from "../serviceAccountFirebase.json";

const firebaseConfig = {
  apiKey: "AIzaSyBkRRAqodhmrGOGqVEyKxrfx_OX7fISJ6s",
  authDomain: "task-sessions.firebaseapp.com",
  projectId: "task-sessions",
  storageBucket: "task-sessions.firebasestorage.app",
  messagingSenderId: "826314029889",
  appId: "1:826314029889:web:b22285f5c955c2b490bfc0",
  measurementId: "G-3DR27P7S66"
};
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
// });
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;