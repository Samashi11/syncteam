import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

export function getCurrentUserData(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        callback({
          uid: user.uid,
          ...snap.data(),
        });
      } else {
        console.error("User belum ada di Firestore");
      }
    }
  });
}
