<script setup lang="ts">
import { watch, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ProductsList from "../components/ProductsList.vue";
import Toaster from "../components/Toaster.vue";
import Pagination from "../components/Pagination.vue";
import useProductStore from "../piniaStores/useProductsStore";
import useFiltersStore from "../piniaStores/useFiltersStore";

const productsStore = useProductStore();
const filtersStore = useFiltersStore();
const route = useRoute();
const router = useRouter();
const cat = ref("");

watch(
  () => route.params.category,
  async () => {
    const category = route.params.category as string;
    if (!category || category.trim() === "") {
      router.replace("/");
      return;
    }
    productsStore.page = 1;
    filtersStore.reset();
    cat.value = category;
  },
  { immediate: true }
);
</script>

<template>
  <h1 class="mb-4">{{ route.params.category as string }}</h1>
  <ProductsList :category="(route.params.category as string)" />

  <Pagination />

  <Toaster />
</template>
