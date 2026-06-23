// js/auth.js
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// LOGIN
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
}

// REGISTER
export async function register(nama, email, password) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  const user = userCredential.user;

  // Set display name di Firebase Auth profile
  await updateProfile(user, {
    displayName: nama,
  });

  // Simpan data tambahan user ke Firestore (collection "users")
  await setDoc(doc(db, "users", user.uid), {
    nama: nama,
    email: email,
    role: "member",
    createdAt: serverTimestamp(),
  });

  return user;
}

// LISTENER (JANGAN FETCH DB DI SINI)
export function listenAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    callback(user); // cuma user, no DB
  });
}

// LOGOUT
export function logout() {
  auth.signOut();
}
