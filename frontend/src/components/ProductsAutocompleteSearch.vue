<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import { Product as ProductItem } from "../types/product";

const props = defineProps<{
  searchQ?: string;
}>();

const products = ref<ProductItem[]>([]);
const loading = ref(true);
const errorFetching = ref(false);

const fetchProducts = async () => {
  loading.value = true;
  errorFetching.value = false;

  if (!props.searchQ) {
    products.value = [];
    loading.value = false;
    return;
  }

  try {
    const resp = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
      params: {
        productName: props.searchQ,
        limit: 3,
        offset: 0,
      },
      withCredentials: true,
    });
    products.value = resp.data.products;
  } catch (error) {
    errorFetching.value = true;
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.searchQ,
  () => {
    fetchProducts();
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="m-2 flex justify-center flex-col"
    :class="{ 'animate-pulse': loading }"
  >
    <div v-for="product in products" :key="product.id" v-show="!errorFetching">
      <RouterLink
        :to="`/product/${product.id}`"
        class="flex justify-between cursor-pointer mb-2"
      >
        <img
          :src="product.product_image_url"
          alt=""
          class="w-24 md:w-52 object-contain"
        />
        <h2 class="text-slate-700">{{ product.product_name }}</h2>
        <p>Price: ${{ product.product_price }}</p>
      </RouterLink>
    </div>
    <div v-if="errorFetching" class="flex justify-center">Error fetching</div>
  </div>
</template>

<style scoped></style>
