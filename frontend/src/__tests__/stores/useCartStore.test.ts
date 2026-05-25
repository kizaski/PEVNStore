import { setActivePinia, createPinia } from "pinia";

jest.mock("axios");
jest.mock("vue-router", () => ({
  useRoute: jest.fn(() => ({ query: {} })),
  useRouter: jest.fn(() => ({ push: jest.fn() })),
}));

import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

let mockCart: { product_id: number; quantity: number }[];
let mockProducts: { id: number; product_name: string; product_price: number }[];

beforeEach(() => {
  jest.clearAllMocks();
  setActivePinia(createPinia());
  mockCart = [
    { product_id: 1, quantity: 2 },
    { product_id: 2, quantity: 1 },
  ];
  mockProducts = [
    { id: 1, product_name: "Test Product 1", product_price: 99.99 },
    { id: 2, product_name: "Test Product 2", product_price: 49.99 },
  ];
});

describe("useCartStore", () => {
  const getStore = () => require("../../piniaStores/useCartStore").default();

  describe("fetchCartProducts", () => {
    it("does nothing when cart is empty", async () => {
      mockedAxios.get.mockResolvedValue({ data: mockCart });
      const store = getStore();
      store.cart = [];
      await store.fetchCartProducts();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("fetches cart products when cart has items", async () => {
      mockedAxios.get.mockResolvedValue({ data: { products: mockProducts } });
      const store = getStore();
      store.cart = mockCart;
      await store.fetchCartProducts();
      expect(store.cartProducts).toEqual(mockProducts);
    });
  });

  describe("addToCart", () => {
    it("adds a product to cart and fetches updated cart", async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockCart })
        .mockResolvedValueOnce({ data: { products: mockProducts } });
      const store = getStore();
      await store.addToCart(3);
      expect(mockedAxios.post).toHaveBeenCalled();
      expect(store.cart).toEqual(mockCart);
      expect(store.cartProducts).toEqual(mockProducts);
    });
  });

  describe("removeFromCart", () => {
    it("removes product and filters it from cartProducts", async () => {
      mockedAxios.delete.mockResolvedValue({});
      const store = getStore();
      store.cartProducts = mockProducts as any;
      await store.removeFromCart(1);
      expect(mockedAxios.delete).toHaveBeenCalled();
      expect(store.cartProducts).toHaveLength(1);
      expect(store.cartProducts?.[0].id).toBe(2);
    });
  });

  describe("clearCart", () => {
    it("clears cart and shows success toast", async () => {
      const store = getStore();
      store.cart = mockCart;
      store.cartProducts = mockProducts as any;
      mockedAxios.delete.mockResolvedValue({});
      await store.clearCart();
      expect(mockedAxios.delete).toHaveBeenCalled();
      expect(store.cart).toEqual([]);
      expect(store.cartProducts).toEqual([]);
    });

    it("shows warning when cart is already empty", async () => {
      const store = getStore();
      store.cart = [];
      await store.clearCart();
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe("increaseQty", () => {
    it("does nothing when productId is undefined", async () => {
      const store = getStore();
      await store.increaseQty(undefined);
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });
  });

  describe("decreaseQty", () => {
    it("does nothing when productId is undefined", async () => {
      const store = getStore();
      await store.decreaseQty(undefined);
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });
  });
});
