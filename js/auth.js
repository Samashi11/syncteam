// js/auth.js
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// LOGIN
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return userCredential.user;
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