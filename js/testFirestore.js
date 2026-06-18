import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

async function testWrite() {
  try {
    await addDoc(collection(db, "test"), {
      name: "Shidqi",
      time: new Date(),
    });
    console.log("SUCCESS");
  } catch (e) {
    console.error("ERROR:", e);
  }
}

testWrite();
