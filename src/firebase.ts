import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getStorage } from 'firebase/storage';

// Firebase config from your Firebase console
const firebaseConfig = {
  apiKey: 'AIzaSyAzfb3FfXB9t8eIG301RYbHz8kZwdcPTN0',
  authDomain: 'intrenship-e715a.firebaseapp.com',
  projectId: 'intrenship-e715a',
  storageBucket: 'intrenship-e715a.firebasestorage.app',
  messagingSenderId: '20386322668',
  appId: '1:20386322668:web:4a81f949268207d46f6dc9',
  measurementId: 'G-CC624QVX2X',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { app, db, auth, analytics, storage };
