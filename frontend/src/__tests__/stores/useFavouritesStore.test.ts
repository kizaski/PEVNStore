import { setActivePinia, createPinia } from "pinia";

jest.mock("axios");
jest.mock("vue-router", () => ({
  useRoute: jest.fn(() => ({ query: {} })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useFavouritesStore", () => {
  const getStore = () =>
    require("../../piniaStores/useFavouritesStore").default();

  const mockFavourites = [
    {
      id: 1,
      product: {
        id: 10,
        product_name: "Fav Product 1",
        product_price: 29.99,
        product_image_url: "",
        product_description: "",
        product_category: "",
        release_date: new Date(),
        manufacturer: "",
        product_rating: 4,
        customer_reviews: 10,
        product_website: "",
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("addToFavourites", () => {
    it("adds a product to favourites and refetches", async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });
      mockedAxios.get.mockResolvedValue({ data: mockFavourites });
      const store = getStore();

      await store.addToFavourites(30);

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(store.favourites).toEqual(mockFavourites);
    });

    it("shows error toast on failure", async () => {
      const error = { response: { data: { message: "Already favourited" } } };
      mockedAxios.post.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const store = getStore();

      await store.addToFavourites(1);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("removeFavourite", () => {
    it("removes a favourite and refetches", async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} });
      mockedAxios.get.mockResolvedValue({ data: mockFavourites });
      const store = getStore();

      await store.removeFavourite(1);

      expect(mockedAxios.delete).toHaveBeenCalled();
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it("shows error toast on remove failure", async () => {
      const error = { response: { data: { message: "Not found" } } };
      mockedAxios.delete.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const store = getStore();

      await store.removeFavourite(99);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
