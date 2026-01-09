<script setup lang="ts">
import useCartStore from "../piniaStores/useCartStore";
import Toaster from "../components/Toaster.vue";
import useUserStore from "../piniaStores/useUserStore";
import Product from "../components/Product.vue";
import AsideNav from "../components/AsideNav.vue";
import { computed } from "vue";

const userStore = useUserStore();
const cartStore = useCartStore();

const clearCart = () => {
  cartStore.clearCart();
};

const removeFromCart = (id: number) => {
  cartStore.removeFromCart(id);
};

const increaseQty = (id: number | undefined) => {
  cartStore.increaseQty(id);
};

const decreaseQty = (id: number | undefined) => {
  cartStore.decreaseQty(id);
};

const checkoutUrl = computed(() => {
  const base = import.meta.env.VITE_API_URL;
  return `${base}/payment/create-checkout-session`;
});
</script>

<template>
  <h1 class="mb-4 flex justify-center">Cart</h1>

  <div class="flex justify-center h-full w-full mb-4">
    <div class="flex md:hidden justify-start flex-col h-full w-1/2">
      <AsideNav />
    </div>
  </div>

  <div class="flex justify-center">
    <div class="hidden md:flex justify-start w-1/6 flex-col h-52">
      <AsideNav />
    </div>
    <div class="flex flex-col justify-center lg:w-1/2 w-full p-2">
      <div class="flex flex-wrap justify-center">
        <div v-show="cartStore.cartProducts?.length === 0">Cart is empty</div>
        <div
          class="flex flex-col w-1/2 md:w-1/4"
          v-for="cartProduct in cartStore.cartProducts"
        >
          <div
            class="flex flex-col justify-between mb-4 mx-2 cursor-pointer hover:shadow-lg bg-gray-300 rounded dark:bg-gray-700 h-full p-2"
          >
            <Product :product="cartProduct" />

            <div class="flex justify-center mb-3">
              <button
                @click="removeFromCart(cartProduct.id)"
                class="flex justify-center outline-dashed rounded-sm dark:hover:bg-slate-500 hover:bg-slate-400 w-full"
              >
                remove
              </button>
            </div>

            <div class="flex justify-center h-8">
              <button
                @click="
                  decreaseQty(
                    cartStore.cart.find((p) => p.product_id === cartProduct.id)
                      ?.product_id
                  )
                "
                class="flex justify-center items-center border-2 rounded-md dark:hover:bg-slate-500 hover:bg-slate-400 w-full mr-3"
              >
                -
              </button>
              <div class="flex justify-center items-center rounded-sm w-full">
                {{
                  cartStore.cart.find((p) => p.product_id === cartProduct.id)
                    ?.quantity
                }}
              </div>
              <button
                @click="
                  increaseQty(
                    cartStore.cart.find((p) => p.product_id === cartProduct.id)
                      ?.product_id
                  )
                "
                class="flex justify-center items-center border-2 rounded-md dark:hover:bg-slate-500 hover:bg-slate-400 w-full ml-3"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-wrap justify-center">
        <div class="flex flex-col justify-center w-1/2 md:w-3/5 p-2">
          <div class="flex justify-center w-full mt-4">
            <button
              @click="clearCart"
              class="outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400 w-4/5"
            >
              Clear cart
            </button>
          </div>

          <form
            class="flex justify-center w-full mt-4"
            :action="checkoutUrl"
            method="POST"
            v-if="userStore.user"
          >
            <button
              class="outline-dashed rounded-sm dark:hover:bg-slate-700 hover:bg-slate-400 w-4/5"
              type="submit"
              id="checkout-button"
            >
              Checkout
            </button>
          </form>
          <div v-else class="flex justify-center w-full mt-4">
            You must be logged in to checkout.
          </div>

          <div
            v-show="cartStore.isEmptyResponse"
            class="flex justify-center w-full mt-4"
          >
            Your cart is empty. Cannot create transaction.
          </div>
        </div>
      </div>
    </div>
  </div>

  <Toaster />
</template>
