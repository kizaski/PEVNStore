import { setActivePinia, createPinia } from "pinia";

jest.mock("axios");
jest.mock("vue-router", () => ({
  useRoute: jest.fn(() => ({ query: {} })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

describe("useFiltersStore", () => {
  const getStore = () =>
    require("../../piniaStores/useFiltersStore").default();

  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("has default filter values", () => {
      const store = getStore();
      expect(store.filters.fromDate).toBe("");
      expect(store.filters.toDate).toBe("");
      expect(store.filters.minPrice).toBe(0);
      expect(store.filters.maxPrice).toBeUndefined();
      expect(store.filters.ratingAbove).toBe(0);
    });

    it("has default empty category", () => {
      const store = getStore();
      expect(store.category).toBe("");
    });

    it("has default load amount", () => {
      const store = getStore();
      expect(store.loadAmount).toBe(12);
    });

    it("has load amounts options", () => {
      const store = getStore();
      expect(store.loadAmounts).toEqual([12, 24, 30]);
    });

    it("has empty selected price ranges", () => {
      const store = getStore();
      expect(store.selectedPriceRanges).toEqual([]);
    });

    it("has menu closed by default", () => {
      const store = getStore();
      expect(store.isMenuOpen).toBe(false);
    });

    it("has order by options", () => {
      const store = getStore();
      expect(store.orderByOptions).toContain("product_price");
      expect(store.orderByOptions).toContain("release_date");
      expect(store.orderByOptions).toContain("product_rating");
      expect(store.orderByOptions).toContain("customer_reviews");
    });

    it("has empty order by and undefined order direction", () => {
      const store = getStore();
      expect(store.orderBy).toBe("");
      expect(store.orderDirection).toBeUndefined();
    });

    it("has price ranges defined", () => {
      const store = getStore();
      expect(store.priceRanges).toHaveLength(6);
      expect(store.priceRanges[0]).toEqual({
        label: "$0 - $50",
        min: 0,
        max: 50,
      });
    });
  });

  describe("reset", () => {
    it("resets all filters to defaults", () => {
      const store = getStore();
      store.filters.fromDate = "2024-01-01";
      store.filters.toDate = "2024-12-31";
      store.filters.minPrice = 100;
      store.filters.maxPrice = 500;
      store.filters.ratingAbove = 3;
      store.category = "Electronics";
      store.orderBy = "product_price";
      store.orderDirection = "ASC";
      store.loadAmount = 24;

      store.reset();

      expect(store.filters.fromDate).toBe("");
      expect(store.filters.toDate).toBe("");
      expect(store.filters.minPrice).toBe(0);
      expect(store.filters.maxPrice).toBeUndefined();
      expect(store.filters.ratingAbove).toBe(0);
      expect(store.category).toBe("");
      expect(store.orderBy).toBe("");
      expect(store.orderDirection).toBeUndefined();
      expect(store.loadAmount).toBe(12);
    });
  });

  describe("selectedPriceRanges watcher", () => {
    it("updates filters when price ranges are selected", async () => {
      const store = getStore();
      store.selectedPriceRanges = [
        { label: "$0 - $50", min: 0, max: 50 },
        { label: "$51 - $100", min: 51, max: 100 },
      ];

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(store.filters.maxPrice).toBe(100);
    });
  });
});
