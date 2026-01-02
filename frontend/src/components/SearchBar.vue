<script setup lang="ts">
import { ref } from "vue";
import { store } from "../store";
import { useRouter } from "vue-router";
import useProductStore from "../piniaStores/useProductsStore";

const productsStore = useProductStore();
const router = useRouter();
const search = ref("");

const typingSearch = () => {
  store.typingSearchQuery = search.value;
};

const submitSearch = () => {
  store.searchQuery = search.value as string;
  productsStore.reset();
  router.push(`/search/${store.searchQuery}`);
  store.showAutocomplete = false;
};

const onBlurInput = () => {
  setTimeout(() => {
    store.showAutocomplete = false;
  }, 150);
};

const onFocusInput = () => {
  store.showAutocomplete = true;
};
</script>

<template>
  <div class="flex w-full p-4">
    <input
      @keyup="typingSearch"
      @blur="onBlurInput"
      @focus="onFocusInput"
      @keypress.enter="submitSearch"
      v-model="search"
      class="flex-grow w-1 p-2 border border-r-0 rounded-l-lg text-black z-30"
      type="text"
      placeholder="Search..."
    />
    <button
      @click="submitSearch"
      class="flex-none bg-lime-600 text-white p-2 border rounded-r-lg z-30"
      type="submit"
    >
      <img
        class=""
        src="../assets/icons8-search-24.png"
        alt="search"
        srcset=""
      />
    </button>
  </div>
</template>

<style scoped></style>
