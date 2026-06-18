import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFuN4u7lm9JtJtptxMwYx4V_sjnVVAkJM",
  authDomain: "syncteam-8d774.firebaseapp.com",
  projectId: "syncteam-8d774",
  storageBucket: "syncteam-8d774.firebasestorage.app",
  messagingSenderId: "351168736909",
  appId: "1:351168736909:web:a11ed1f1f69baefdf2bcc4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
