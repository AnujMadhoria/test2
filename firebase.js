// frontend/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

    const firebaseConfig = {
        apiKey: "AIzaSyDJWENRzW6jXPd3hWHszHhGRcBsmGFITi8",
        authDomain: "foodlens-3859a.firebaseapp.com",
        projectId: "foodlens-3859a",
        storageBucket: "foodlens-3859a.firebasestorage.app",
        messagingSenderId: "198034206138",
        appId: "1:198034206138:web:dce44325b8a5ee484a8183"
      };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
