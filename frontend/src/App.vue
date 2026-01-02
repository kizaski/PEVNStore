<script setup lang="ts">
import SearchBar from "./components/SearchBar.vue";
import ProductsAutocompleteSearch from "./components/ProductsAutocompleteSearch.vue";
import { useRoute } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { store } from "./store";
import axios from "axios";

// todo
// filters
// reviews asc / desc
// category dropdown
// load amount radio buttons
// fix navigation to category, it should be without filters
// logged in as should say username not id

const route = useRoute();
const isMenuOpen = ref(false);
const categories = ref<string[]>([]);
const isDayMode = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// use filtersStore (?)
const fetchCategories = async () => {
  try {
    const resp = await axios.get("/api/products/categories");
    categories.value = resp.data;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
};

const showAutocompleteComponent = computed(
  () => store.typingSearchQuery !== "" && store.showAutocomplete
);

const switchTheme = () => {
  isDayMode.value = !isDayMode.value;
  if (isDayMode.value) {
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  } else {
    document.documentElement.classList.add("dark");
    localStorage.theme = "dark";
  }
};

onMounted(() => {
  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.documentElement.classList.add("dark");
    isDayMode.value = false;
  } else {
    document.documentElement.classList.remove("dark");
    isDayMode.value = true;
  }

  fetchCategories();
});
</script>

<template>
  <div
    :class="{ 'translate-x-0': isMenuOpen, '-translate-x-full': !isMenuOpen }"
    class="fixed left-0 top-20 z-50 transition-transform duration-500 h-5/6 w-3/5 md:w-1/5 overflow-y-scroll"
  >
    <div
      class="p-4 bg-slate-400 dark:bg-slate-700"
      v-for="category in categories"
      :key="category"
    >
      <RouterLink
        :to="`/category/${category}`"
        class="flex justify-between cursor-pointer hover:underline"
      >
        <span>{{ category }}</span
        ><span>🔗</span>
      </RouterLink>
    </div>
  </div>
  <div class="sticky top-0 bg-gray-300 dark:bg-gray-700 mb-4">
    <nav class="flex justify-between items-center">
      <div class="flex flex-[1] items-center p-4">
        <svg
          @click="toggleMenu"
          class="w-14 p-2 cursor-pointer"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 10 10"
          stroke="currentColor"
          stroke-width=".6"
          fill="rgba(0,0,0,0)"
          stroke-linecap="round"
        >
          <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7">
            <animate
              dur="0.2s"
              attributeName="d"
              values="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7;M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7"
              fill="freeze"
              begin="start.begin"
            />
            <animate
              dur="0.2s"
              attributeName="d"
              values="M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7;M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7"
              fill="freeze"
              begin="reverse.begin"
            />
          </path>
          <rect width="10" height="10" stroke="none">
            <animate
              dur="2s"
              id="reverse"
              attributeName="width"
              begin="click"
            />
          </rect>
          <rect width="10" height="10" stroke="none">
            <animate
              dur="0.001s"
              id="start"
              attributeName="width"
              values="10;0"
              fill="freeze"
              begin="click"
            />
            <animate
              dur="0.001s"
              attributeName="width"
              values="0;10"
              fill="freeze"
              begin="reverse.begin"
            />
          </rect>
        </svg>
        <RouterLink class="w-10 p-2" to="/">Home</RouterLink>
      </div>
      <div
        class="md:flex absolute left-1/2 right-2 -translate-x-1/2 w-auto flex-grow justify-center hidden"
      >
        <SearchBar />
      </div>
      <div class="flex flex-[3] p-4 items-center justify-end">
        <button class="p-2 justify-end" @click="switchTheme">
          <img
            class="object-contain h-9 dark:invert"
            src="./assets/night-mode.png"
            alt="Switch theme"
          />
        </button>
        <RouterLink class="p-2 justify-end" :to="{ path: '/cart', query: {} }"
          ><img
            class="object-contain h-9 dark:invert"
            src="./assets/shopping_cart.png"
            alt="Cart"
        /></RouterLink>
        <RouterLink
          class="p-2 justify-end"
          :to="{ path: '/favourites', query: {} }"
          ><img
            class="object-contain h-9 dark:invert"
            src="./assets/favourite.png"
            alt="Favourites"
        /></RouterLink>
        <RouterLink
          class="p-2 justify-end"
          :to="{ path: '/account', query: {} }"
          ><img
            class="object-contain h-9 dark:invert"
            src="./assets/account.png"
            alt="Account"
        /></RouterLink>
      </div>
    </nav>
    <div class="flex justify-center md:hidden lg:hidden ml-auto">
      <SearchBar />
    </div>
  </div>
  <main>
    <RouterView :key="route.fullPath" />
  </main>
  <div
    v-if="showAutocompleteComponent"
    class="fixed top-32 left-4 right-4 lg:left-80 lg:right-80 z-50 bg-slate-200 rounded-lg text-black overflow-y-auto overscroll-x-contain h-auto"
  >
    <ProductsAutocompleteSearch :search-q="store.typingSearchQuery" />
  </div>
</template>

<style scoped></style>
