import { defineStore } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, reactive, watch } from "vue";
import axios from "axios";
import { Product as ProductItem } from "../types/product";
import useToasterStore from "../piniaStores/useToasterStore";
import { store } from "../store";

export default defineStore("products-store", () => {
  const route = useRoute();
  const router = useRouter();
  const toasterStore = useToasterStore();

  const page = ref(1);
  // Ensure page is updated when route query changes
  watch(
    () => route.query.page,
    (newPage) => {
      page.value = newPage ? Number(newPage) : 1;
    }
  );

  const filters = reactive({ fromDate: "", toDate: "" });

  const load_amount = ref(12);

  const total_products_amount = ref(0);
  const page_begin = ref(0);
  const page_end = ref(5);
  const loading = ref(true);
  const products = ref<ProductItem[]>([]);
  const total_pages = computed(() => {
    return Math.ceil(total_products_amount.value / load_amount.value);
  });
  const pages_array = computed(() => {
    return Array.from({ length: total_pages.value }, (_, index) => index + 1);
  });

  // TODO move this logic to navigateToPage
  const nextPage = async () => {
    if (page.value < total_pages.value) {
      page.value++;
      // navigateToPage(page.value++);
      await fetchProducts();
    } else {
      toasterStore.error({ text: "No more pages to load." });
    }
  };

  const previousPage = async () => {
    if (page.value > 1) {
      page.value--;
      // navigateToPage(page.value--);
      await fetchProducts();
    } else {
      toasterStore.error({ text: "No more pages to navigate back to." });
    }
  };

  const navigateToPage = async (page_num: number) => {
    // console.log(page_num - page.value);

    const direction = Math.sign(page_num - page.value);
    const canShiftForward =
      direction > 0 && page_end.value < pages_array.value.length - 1;
    const canShiftBackward = direction < 0 && page_begin.value > 0;

    if (canShiftForward || canShiftBackward) {
      page_begin.value += direction;
      page_end.value += direction;
    }

    page.value = page_num;
    await fetchProducts();
  };

  // todo add backend functionality to get with filter
  const fetchProducts = async (category = "") => {
    loading.value = true;
    try {
      // console.log(filters.fromDate);

      const resp = await axios.get("/api/products", {
        params: {
          limit: load_amount.value,
          productName: store.searchQuery,
          offset: (page.value - 1) * load_amount.value,
          category: category,
        },
      });
      products.value = resp.data.products;
      total_products_amount.value = resp.data.count;
      router.push({ query: { page: page.value } });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      loading.value = false;
    }
  };

  return {
    page,
    load_amount,
    total_pages,
    pages_array,
    total_products_amount,
    products,
    loading,
    page_begin,
    page_end,
    filters,
    navigateToPage,
    fetchProducts,
    nextPage,
    previousPage,
  };
});