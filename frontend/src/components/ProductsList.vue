<script setup lang="ts">
import { onMounted, watch } from "vue";
import LoadingProduct from "./LoadingProduct.vue";
import Product from "./Product.vue";
import { store } from "../store";
import useProductStore from "../piniaStores/useProductsStore";
import useUserStore from "../piniaStores/useUserStore";
import useCartStore from "../piniaStores/useCartStore";
import useFavouritesStore from "../piniaStores/useFavouritesStore";

const userStore = useUserStore();
const productsStore = useProductStore();
const cartStore = useCartStore();
const favouritesStore = useFavouritesStore();

const props = defineProps({
  category: String,
  filters: Object,
});

const fetchProducts = async () => {
  await productsStore.fetchProducts(props.category ?? "");
};

const addToFavourites = async (id: number) => {
  favouritesStore.addToFavourites(id);
};

const addToCart = async (id: number) => {
  cartStore.addToCart(id);
};

onMounted(fetchProducts);

watch(
  [() => store.searchQuery, () => props.category],
  async () => {
    await fetchProducts();
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex flex-wrap px-2 md:w-10/12 justify-center" role="status">
    <div
      v-for="_ in productsStore.load_amount"
      class="p-2 m-2 flex flex-col md:w-1/4 w-1/2 bg-gray-300 rounded dark:bg-gray-700 animate-pulse -z-10"
      :class="{ hidden: !productsStore.loading }"
    >
      <div
        class="flex flex-col justify-between mb-4 mx-2 cursor-pointer hover:shadow-lg bg-gray-300 rounded dark:bg-gray-700 h-full max-h-96 p-2"
      >
        <LoadingProduct />
      </div>
    </div>

    <div
      v-for="product in productsStore.products"
      class="flex flex-col w-1/2 md:w-1/4"
      :class="{ hidden: productsStore.loading, flex: !productsStore.loading }"
    >
      <div
        class="flex flex-col justify-between mb-4 mx-2 cursor-pointer hover:shadow-lg bg-gray-300 rounded dark:bg-gray-700 h-full max-h-96 p-2"
      >
        <Product :product="product" />

        <div class="flex justify-center">
          <button
            @click="addToCart(product.id)"
            class="flex justify-center outline-dashed rounded-sm dark:hover:bg-slate-500 hover:bg-slate-400 w-full"
          >
            add to cart
          </button>
          <button
            @click="addToFavourites(product.id)"
            v-show="userStore.user"
            class="flex justify-center outline-dashed rounded-sm dark:hover:bg-slate-500 hover:bg-slate-400 ml-3 w-2/12"
          >
            ⭐
          </button>
        </div>
      </div>
    </div>

    <h2
      v-if="productsStore.products.every((el) => !el)"
      class="flex justify-center items-center w-full mb-6"
    >
      No results
    </h2>
  </div>
</template>
