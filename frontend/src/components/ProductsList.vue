<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import axios from "axios";
import LoadingProduct from "./LoadingProduct.vue";
import Product from "./Product.vue";
import { Product as ProductItem } from "../types/product";
import { store } from "../store";
import Toaster from "./Toaster.vue";
import useToasterStore from "../piniaStores/useToasterStore";
import { useRouter, useRoute } from "vue-router";
import Pagination from "./Pagination.vue";

const router = useRouter();
const route = useRoute();
const toasterStore = useToasterStore();

const load_amount = ref(10);
const total_products_amount = ref(10);
// todo move this to store
const page = ref((route.query.page as unknown as number) || 1);
const total_pages = ref(0);
const pages_array = computed(() => {
  return Array.from({ length: total_pages.value }, (_, index) => index + 1);
});

const products = ref<ProductItem[]>([]);
const loading = ref(true);

const fetchProducts = async () => {
  loading.value = true;
  try {
    const resp = await axios.get("/api/products", {
      params: {
        limit: load_amount.value,
        productName: store.searchQuery,
        offset: (page.value - 1) * load_amount.value,
      },
    });
    products.value = resp.data.products;
    total_products_amount.value = resp.data.count;
    router.replace({ query: { page: page.value } });
    // console.log("page.value", page.value);
    // console.log("total_products_amount.value", total_products_amount.value);
    // console.log("load_amount.value", load_amount.value);
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
    loading.value = false;
    total_pages.value = Math.ceil(
      total_products_amount.value / load_amount.value
    );
  }
};

const nextPage = async () => {
  if (page.value < total_pages.value - 1) {
    page.value++;
    await fetchProducts();
  } else {
    toasterStore.error({ text: "No more pages to load." });
  }
};

const prevPage = async () => {
  if (page.value > 1) {
    page.value--;
    await fetchProducts();
  } else {
    toasterStore.error({ text: "No more pages to navigate back to." });
  }
};

const navigateToPage = async (page_num: number) => {
  page.value = page_num;
  router.replace({ query: { page: page.value } });
  await fetchProducts();
};

onMounted(fetchProducts);
watch(
  () => store.searchQuery,
  async () => {
    fetchProducts();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex flex-wrap px-2" role="status">
    <div
      v-for="_ in load_amount"
      class="flex flex-col w-1/2 bg-gray-300 rounded dark:bg-gray-700 animate-pulse -z-10"
      :class="{ hidden: !loading }"
    >
      <div class="mb-4 mx-2">
        <LoadingProduct />
      </div>
    </div>

    <div
      v-for="product in products"
      class="flex flex-col w-1/2 bg-gray-300 rounded dark:bg-gray-700 mb-4"
      :class="{ hidden: loading, flex: !loading }"
    >
      <div class="mb-4 mx-2 cursor-pointer">
        <Product :product="product" />
      </div>
    </div>

    <h2
      v-if="products.every((el) => !el)"
      class="flex justify-center items-center w-full mb-6"
    >
      No results
    </h2>

    <div class="flex flex-row w-full">
      <button
        class="w-1/2 p-2 border rounded-sm hover:bg-slate-700"
        @click="prevPage"
      >
        previous page
      </button>
      <button
        class="w-1/2 p-2 border rounded-sm hover:bg-slate-700"
        @click="nextPage"
      >
        next page
      </button>
    </div>

    <Pagination
      :current_page="page"
      :pages="pages_array"
      @pageChange="navigateToPage"
    />

    <Toaster />
  </div>
</template>