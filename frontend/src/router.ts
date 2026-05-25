import { createWebHistory, createRouter } from "vue-router";
import Home from "./pages/Home.vue";
import ProductSearchPage from "./pages/ProductSearchPage.vue";
import ProductPage from "./pages/ProductPage.vue";
import CategoryPage from "./pages/CategoryPage.vue";
import AccountPage from "./pages/AccountPage.vue";
import CartPage from "./pages/CartPage.vue";
import FavouritesPage from "./pages/FavouritesPage.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/search/:search", component: ProductSearchPage },
  { path: "/product/:productId", component: ProductPage },
  { path: "/category/:category", component: CategoryPage },
  { path: "/category", redirect: "/" },
  { path: "/account", component: AccountPage },
  { path: "/cart", component: CartPage },
  { path: "/favourites", component: FavouritesPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => {
    return { top: 0, behavior: "smooth" };
  },
});

export default router;
