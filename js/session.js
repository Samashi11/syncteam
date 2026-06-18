import { listenAuth } from "./auth.js";
import { getUserData } from "./userService.js";

export function protectPage() {
  listenAuth(async (user) => {
    if (!user) {
      window.location.href = "/pages/auth/login.html";
      return;
    }

    const userData = await getUserData(user.uid);

    console.log("USER:", user);
    console.log("DATA:", userData);

    window.currentUser = user;
    window.currentUserData = userData;
  });
}
