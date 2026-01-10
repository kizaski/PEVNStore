<script setup lang="ts">
import axios from "axios";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Product } from "../types/product";
import useCartStore from "../piniaStores/useCartStore";
import Toaster from "../components/Toaster.vue";

const route = useRoute();
const cartStore = useCartStore();
const product = ref<Product>();

const addToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value.id);
  }
};

onMounted(async () => {
  try {
    const resp = await axios.get(
      `${import.meta.env.VITE_API_URL}/products/one/${route.params.productId}`,
      {
        withCredentials: true,
      }
    );
    product.value = resp.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
  } finally {
  }
});
</script>

<template>
  <div class="flex justify-center">
    <div class="mx-2 lg:w-1/2">
      <div>
        <div class="flex justify-center">
          <img
            class="px-2 py-4"
            :src="product?.product_image_url"
            alt=""
            srcset=""
          />
        </div>

        <h1 class="flex justify-center mb-2">
          {{ product?.product_name }}
        </h1>

        <div class="flex justify-center mb-4">
          {{ product?.product_rating }} rating
          {{ product?.customer_reviews }} reviews
        </div>

        <h2 class="flex justify-center mb-2">$ {{ product?.product_price }}</h2>

        <div class="flex justify-center mb-4">
          <button
            class="flex w-2/3 md:w-1/4 justify-center mb-4 outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400"
            @click="addToCart"
          >
            Add to cart
          </button>
        </div>

        <div class="mb-4 mx-2">
          <h2>Description</h2>
          <p>
            {{ product?.product_description }}
          </p>
        </div>

        <table class="mb-4 mx-2">
          <caption>
            <h2>Details</h2>
          </caption>
          <tbody>
            <tr>
              <th>Manufacturer:</th>
              <td>{{ product?.manufacturer }}</td>
            </tr>
            <tr>
              <th>Category:</th>
              <td>{{ product?.product_category }}</td>
            </tr>
            <tr>
              <th>Website:</th>
              <td>{{ product?.product_website }}</td>
            </tr>
            <tr>
              <th>Release date:</th>
              <td>{{ product?.release_date }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <Toaster />
</template>
