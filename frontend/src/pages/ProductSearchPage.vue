<script setup lang="ts">
import ProductsList from "../components/ProductsList.vue";
import { store } from "../store";
import { onMounted, ref, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import Toaster from "../components/Toaster.vue";
import Pagination from "../components/Pagination.vue";
import Filters from "../components/Filters.vue";
import useFiltersStore from "../piniaStores/useFiltersStore";

const filtersStore = useFiltersStore();
const route = useRoute();

const scrollableDiv = ref<HTMLDivElement | null>(null);
const scrollKey = "homeScrollPosition";

const toggleMenu = () => {
  filtersStore.isMenuOpen = !filtersStore.isMenuOpen;
};

onMounted(() => {
  if (route) {
    store.searchQuery = route.params.search as string;
  }
  const savedScrollPosition = localStorage.getItem(scrollKey);
  if (savedScrollPosition !== null && scrollableDiv.value) {
    scrollableDiv.value.scrollTop = parseInt(savedScrollPosition, 10);
  }
});

onBeforeUnmount(() => {
  if (scrollableDiv.value) {
    localStorage.setItem(scrollKey, scrollableDiv.value.scrollTop.toString());
  }
});
</script>

<template>
  <div>
    <!-- Overlay -->
    <div
      v-if="filtersStore.isMenuOpen"
      @click="toggleMenu"
      class="fixed inset-0 z-40"
    ></div>

    <!-- Sliding Menu -->
    <div
      :class="{
        'translate-x-0': filtersStore.isMenuOpen,
        '-translate-x-full': !filtersStore.isMenuOpen,
      }"
      class="fixed left-0 top-44 z-50 transition-transform duration-500 w-4/5 h-3/5 bg-white dark:bg-slate-700 rounded-r-md overflow-scroll overscroll-contain"
      ref="scrollableDiv"
    >
      <div
        @click="toggleMenu"
        class="p-2 flex justify-center sticky top-0 cursor-pointer bg-white dark:bg-slate-700 dark:hover:bg-slate-800 hover:bg-slate-300"
      >
        Close
      </div>

      <Filters />
    </div>
  </div>

  <h2 class="mb-6" v-if="store.searchQuery">Search: {{ store.searchQuery }}</h2>

  <div
    @click="toggleMenu"
    class="flex justify-center items-center mb-6 border sticky top-[8.5rem] bg-slate-200 dark:bg-slate-600 z-10 rounded-sm select-none cursor-pointer md:hidden"
  >
    Filters
  </div>

  <div class="flex">
    <ProductsList v-if="store.searchQuery" :filters="filtersStore.filters" />

    <aside class="hidden md:flex">
      <Filters />
    </aside>
  </div>

  <Pagination />

  <Toaster />
</template>
