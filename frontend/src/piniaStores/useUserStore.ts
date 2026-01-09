import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import axios from "axios";

export default defineStore("user-store", () => {
  const username = ref("");
  const email = ref("");
  const password = ref("");
  const message = ref("");

  const user = ref(null);

  const signUp = async () => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/signup`,
        {
          username: username.value,
          email: email.value,
          password: password.value,
        }
      );
      user.value = resp.data.user.username;
      message.value = "Sign up successful.";
    } catch (error: any) {
      console.error("Failed to sign up:", error);
      message.value = `Failed to sign up. Please try again. Error: ${error.response.data.message}`;
    }
  };

  const logOut = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
      user.value = null;
      message.value = "Log out successful.";
    } catch (error: any) {
      console.error("Failed to log out:", error);
      message.value = `Failed to log out. Please try again. Error: ${error.response.data.message}`;
    }
  };

  const logIn = async (uname: string, pass: string) => {
    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login/password`,
        {
          username: uname,
          password: pass,
        }
      );
      user.value = resp.data.user.username;
      message.value = "Log in successful.";
    } catch (error: any) {
      console.error("Failed to log in:", error);
      message.value = `Failed to log in. Please try again. Error: ${error.response.data.message}`;
    }
  };

  onMounted(async () => {
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/sessionStatus`
      );
      user.value = resp.data.session.passport.user;
    } catch (error: any) {
      console.error("Failed call to /auth/sessionStatus:", error);
    }
  });

  return {
    username,
    password,
    email,
    message,
    user,
    signUp,
    logOut,
    logIn,
  };
});
