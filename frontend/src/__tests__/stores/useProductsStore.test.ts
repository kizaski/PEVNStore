import { setActivePinia, createPinia } from "pinia";

jest.mock("axios");
jest.mock("vue-router", () => ({
  useRoute: jest.fn(() => ({ query: {} })),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));
jest.mock("../../store", () => ({
  store: {
    searchQuery: "",
    typingSearchQuery: "",
    showAutocomplete: false,
  },
}));

import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useProductsStore", () => {
  const getStore = () =>
    require("../../piniaStores/useProductsStore").default();

  const mockProducts = [
    {
      id: 1,
      product_name: "Product A",
      product_image_url: "",
      product_price: 25.0,
      product_description: "",
      product_category: "Cat1",
      release_date: new Date(),
      manufacturer: "",
      product_rating: 4,
      customer_reviews: 100,
      product_website: "",
    },
    {
      id: 2,
      product_name: "Product B",
      product_image_url: "",
      product_price: 50.0,
      product_description: "",
      product_category: "Cat2",
      release_date: new Date(),
      manufacturer: "",
      product_rating: 3,
      customer_reviews: 50,
      product_website: "",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("has empty products array", () => {
      const store = getStore();
      expect(store.products).toEqual([]);
    });

    it("starts at page 1", () => {
      const store = getStore();
      expect(store.page).toBe(1);
    });

    it("has zero total products", () => {
      const store = getStore();
      expect(store.total_products_amount).toBe(0);
    });
  });

  describe("fetchProducts", () => {
    it("fetches products and updates state", async () => {
      const mockResponse = { data: { products: mockProducts, count: 2 } };
      mockedAxios.get.mockResolvedValue(mockResponse);
      const store = getStore();

      await store.fetchProducts();

      expect(store.products).toEqual(mockProducts);
      expect(store.total_products_amount).toBe(2);
      expect(store.loading).toBe(false);
    });

    it("handles empty response gracefully", async () => {
      const mockResponse = { data: { count: 0 } };
      mockedAxios.get.mockResolvedValue(mockResponse);
      const store = getStore();

      await store.fetchProducts();

      expect(store.products).toEqual([]);
      expect(store.total_products_amount).toBe(0);
      expect(store.loading).toBe(false);
    });

    it("sets loading to false even when fetch fails", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockedAxios.get.mockRejectedValue(new Error("Network error"));
      const store = getStore();

      await store.fetchProducts();

      expect(store.loading).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe("computed properties", () => {
    it("total_pages is 0 when no products", () => {
      const store = getStore();
      expect(store.total_pages).toBe(0);
    });

    it("total_pages reflects total_products_amount / load_amount", () => {
      const store = getStore();
      store.total_products_amount = 24;
      store.load_amount = 12;
      expect(store.total_pages).toBe(2);
    });

    it("pages_array reflects total_pages", () => {
      const store = getStore();
      store.total_products_amount = 24;
      store.load_amount = 12;
      expect(store.pages_array).toEqual([1, 2]);
    });
  });

  describe("reset", () => {
    it("resets page to 1", () => {
      const store = getStore();
      store.page = 5;
      store.reset();
      expect(store.page).toBe(1);
    });
  });
});
