import { defineStore } from "pinia";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, watch } from "vue";
import axios from "axios";
import { Product as ProductItem } from "../types/product";
import useToasterStore from "../piniaStores/useToasterStore";
import useFiltersStore from "../piniaStores/useFiltersStore";
import { store } from "../store";

export default defineStore("products-store", () => {
  const route = useRoute();
  const router = useRouter();
  const toasterStore = useToasterStore();
  const filtersStore = useFiltersStore();

  const page = ref(1);
  // Ensure page is updated when route query changes
  watch(
    () => route.query.page,
    (newPage) => {
      page.value = newPage ? Number(newPage) : 1;
    }
  );

  const load_amount = ref(filtersStore.loadAmount);

  const total_products_amount = ref(0);
  const pages_to_show = computed(() => {
    let toShow = total_pages.value < 6 ? total_pages.value : 6;
    const midPoint = Math.ceil(toShow / 2);

    let begin;
    let end;
    if (page.value < midPoint) {
      begin = 0;
      end = toShow;
    } else if (page.value > total_pages.value - midPoint) {
      begin = total_pages.value - toShow;
      end = total_pages.value;
    } else {
      begin = page.value - midPoint;
      end = page.value + midPoint;
    }

    return pages_array.value.slice(begin, end);
  });
  const loading = ref(true);
  const products = ref<ProductItem[]>([]);
  const total_pages = computed(() => {
    return Math.ceil(total_products_amount.value / load_amount.value);
  });
  const pages_array = computed(() => {
    return Array.from({ length: total_pages.value }, (_, index) => index + 1);
  });

  const reset = () => {
    page.value = 1;
    filtersStore.reset();
  };

  const nextPage = async () => {
    if (page.value < total_pages.value) {
      navigateToPage(page.value + 1);
    } else {
      toasterStore.error({ text: "No more pages to load." });
    }
  };

  const previousPage = async () => {
    if (page.value > 1) {
      navigateToPage(page.value - 1);
    } else {
      toasterStore.error({ text: "No more pages to navigate back to." });
    }
  };

  const navigateToPage = async (new_page: number) => {
    page.value = new_page;
    await fetchProducts();
  };

  const fetchProducts = async (category = "") => {
    loading.value = true;
    try {
      const cat = category === "" ? filtersStore.category : category;
      const resp = await axios.get("/api/products", {
        params: {
          limit: load_amount.value,
          productName: store.searchQuery,
          offset: (page.value - 1) * load_amount.value,
          category: cat,
          filters: JSON.stringify(filtersStore.filters),
          orderBy: filtersStore.orderBy,
          orderDirection: filtersStore.orderDirection,
        },
      });
      products.value = resp.data.products;
      total_products_amount.value = resp.data.count;

      const stringifiedFilters = Object.values(filtersStore.filters).every(
        (f) => {
          return !f;
        }
      )
        ? null
        : JSON.stringify(filtersStore.filters);
      router.push({
        query: {
          page: page.value,
          filters: stringifiedFilters,
          loadAmount: filtersStore.loadAmount,
          orderBy: filtersStore.orderBy,
          orderDirection: filtersStore.orderDirection,
        },
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => filtersStore.loadAmount,
    async () => {
      load_amount.value = filtersStore.loadAmount;
      await fetchProducts();
    },
    { immediate: true }
  );

  return {
    page,
    load_amount,
    total_pages,
    pages_array,
    total_products_amount,
    products,
    loading,
    pages_to_show,
    reset,
    navigateToPage,
    fetchProducts,
    nextPage,
    previousPage,
  };
});
