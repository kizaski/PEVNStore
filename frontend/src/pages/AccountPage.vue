<script setup lang="ts">
import { reactive } from "vue";
import useUserStore from "../piniaStores/useUserStore";
import AsideNav from "../components/AsideNav.vue";

const userStore = useUserStore();

const login_credentials = reactive({ username: "", password: "" });

const signUp = async () => {
  await userStore.signUp();
};

const logIn = async () => {
  await userStore.logIn(login_credentials.username, login_credentials.password);
};
</script>

<template>
  <div class="h-lvh md:h-full">
    <h1 class="mb-4 flex justify-center">Account</h1>

    <div class="flex justify-center w-full mb-4">
      <div class="flex md:hidden justify-start flex-col h-full w-1/2">
        <AsideNav />
      </div>
    </div>

    <div class="flex justify-center">
      <div class="hidden md:flex justify-start w-1/6 flex-col h-52">
        <AsideNav />
      </div>
      <div
        class="flex flex-col px-2 md:w-1/2 justify-center items-center mb-12"
      >
        <!-- user info -->
        <p v-if="userStore.message">{{ userStore.message }}</p>

        <!-- log out button -->
        <div class="mb-4" v-if="userStore.user">
          <div class="flex flex-col justify-center w-full items-center">
            <p class="mb-2">Logged in as {{ userStore.user }}</p>

            <button
              @click="userStore.logOut"
              class="outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400 w-2/3"
            >
              Log out
            </button>
          </div>
        </div>

        <!-- forms -->
        <!-- sign up form -->
        <h3>Sign up</h3>
        <form @submit.prevent="signUp" class="mb-4">
          <div class="m-2 flex justify-between">
            <label class="mx-2" for="username">Username</label>
            <input
              class="text-black rounded-md border-2 border-slate-500"
              type="text"
              id="username"
              v-model="userStore.username"
              required
            />
          </div>
          <div class="m-2 flex justify-between">
            <label class="mx-2" for="email">Email</label>
            <input
              class="text-black rounded-md border-2 border-slate-500"
              type="email"
              id="email"
              v-model="userStore.email"
              required
            />
          </div>
          <div class="m-2 flex justify-between">
            <label class="mx-2" for="password">Password</label>
            <input
              class="text-black rounded-md border-2 border-slate-500"
              type="password"
              id="password"
              v-model="userStore.password"
              required
            />
          </div>
          <div class="mt-4 flex justify-center w-full">
            <button
              class="outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400 w-2/3"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>

        <!-- log in form -->
        <h3>Log in</h3>
        <form @submit.prevent="logIn">
          <div class="m-2 flex justify-between">
            <label class="mx-2" for="username">Username</label>
            <input
              class="text-black rounded-md border-2 border-slate-500"
              type="text"
              id="username"
              v-model="login_credentials.username"
              required
            />
          </div>
          <div class="m-2 flex justify-between">
            <label class="mx-2" for="password">Password</label>
            <input
              class="text-black rounded-md border-2 border-slate-500"
              type="password"
              id="password"
              v-model="login_credentials.password"
              required
            />
          </div>
          <div class="mt-4 flex justify-center w-full">
            <button
              class="outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400 w-2/3"
              type="submit"
            >
              Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
