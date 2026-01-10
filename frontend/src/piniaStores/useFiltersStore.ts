import { defineStore } from "pinia";
import { watch, ref, toRaw, reactive, onMounted } from "vue";
import useProductStore from "../piniaStores/useProductsStore";
import { useRoute } from "vue-router";
import axios from "axios";

interface IFilters {
  fromDate: string;
  toDate: string;
  minPrice: number;
  maxPrice?: number;
  ratingAbove: number;
}

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

export default defineStore("filters-store", () => {
  const productsStore = useProductStore();
  const route = useRoute();
  const category = ref("");
  const categories = ref([]);
  const loadAmounts = ref([12, 24, 30]);
  const loadAmount = ref(loadAmounts.value[0]);
  watch(
    () => route.query.loadAmount,
    (newLoadAmount) => {
      loadAmount.value = newLoadAmount
        ? Number(newLoadAmount)
        : loadAmounts.value[0];
    }
  );

  const orderBy = ref("");
  const orderByOptions = ref([
    "product_price",
    "release_date",
    "product_rating",
    "customer_reviews",
  ]);
  const orderDirection = ref<"ASC" | "DESC" | undefined>(undefined);

  const filters = reactive<IFilters>({
    fromDate: "",
    toDate: "",
    minPrice: 0,
    maxPrice: undefined,
    ratingAbove: 0,
  });

  watch(
    () => route.query.filters,
    (newFilters) => {
      if (typeof newFilters === "string") {
        try {
          const f = JSON.parse(newFilters) as IFilters;
          Object.assign(filters, f);
        } catch (error) {
          console.error("error setting filters", error);
        }
      }
    }
  );

  const priceRanges = ref<PriceRange[]>([
    { label: "$0 - $50", min: 0, max: 50 },
    { label: "$51 - $100", min: 51, max: 100 },
    { label: "$101 - $200", min: 101, max: 200 },
    { label: "$201 - $500", min: 201, max: 500 },
    { label: "$501 - $1000", min: 501, max: 1000 },
    { label: "above $1000", min: 1001, max: 999999 },
  ]);
  const selectedPriceRanges = ref<PriceRange[]>([]);

  const isMenuOpen = ref(false);

  const reset = () => {
    filters.fromDate = "";
    filters.toDate = "";
    filters.minPrice = 0;
    filters.maxPrice = undefined;
    filters.ratingAbove = 0;
    category.value = "";
    orderBy.value = "";
    orderDirection.value = undefined;
    loadAmount.value = loadAmounts.value[0];
  };

  // fetch products on changes
  watch(
    [filters, category, orderBy, orderDirection],
    async () => {
      productsStore.page = 1;
      if (productsStore && productsStore.fetchProducts) {
        productsStore.fetchProducts();
      } else {
        productsStore.products = [];
      }
    },
    { immediate: true, deep: true }
  );

  watch(selectedPriceRanges, async () => {
    const rawRanges = toRaw(selectedPriceRanges.value) as PriceRange[];

    const largestMaxValue = rawRanges.reduce<number>((max, currentRange) => {
      return currentRange.max > max ? currentRange.max : max;
    }, 0);

    const smallestMinValue = rawRanges.reduce<number>((min, currentRange) => {
      return currentRange.min < min ? currentRange.min : min;
    }, Infinity);

    filters.minPrice = smallestMinValue;
    filters.maxPrice = largestMaxValue || undefined;
  });

  const fetchCategories = async () => {
    try {
      const resp = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/categories`,
        { withCredentials: true }
      );
      categories.value = resp.data;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  onMounted(() => {
    fetchCategories();
  });

  return {
    filters,
    priceRanges,
    selectedPriceRanges,
    isMenuOpen,
    categories,
    category,
    loadAmount,
    loadAmounts,
    orderBy,
    orderDirection,
    orderByOptions,
    reset,
  };
});
