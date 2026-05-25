import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";

const mockPush = jest.fn();

jest.mock("vue-router", () => ({
  useRoute: jest.fn(() => ({ query: {} })),
  useRouter: jest.fn(() => ({ push: mockPush })),
}));
jest.mock("../../piniaStores/useProductsStore", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    page: 1,
    products: [],
    loading: false,
    total_products_amount: 0,
    total_pages: 0,
    pages_array: [],
    pages_to_show: [],
    load_amount: 12,
    fetchProducts: jest.fn(),
    navigateToPage: jest.fn(),
    nextPage: jest.fn(),
    previousPage: jest.fn(),
    reset: jest.fn(),
  })),
}));
jest.mock("../../store", () => ({
  store: {
    searchQuery: "",
    typingSearchQuery: "",
    showAutocomplete: false,
  },
}));

import SearchBar from "../../components/SearchBar.vue";
import { store } from "../../store";

describe("SearchBar component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
    store.searchQuery = "";
    store.typingSearchQuery = "";
    store.showAutocomplete = false;
  });

  it("renders search input", () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find("input");
    expect(input.exists()).toBe(true);
    expect(input.attributes("placeholder")).toBe("Search...");
  });

  it("renders search submit button", () => {
    const wrapper = mount(SearchBar);
    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
  });

  it("shows autocomplete on focus", async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find("input");
    await input.trigger("focus");
    expect(store.showAutocomplete).toBe(true);
  });

  it("submits search and navigates on enter", async () => {
    const wrapper = mount(SearchBar);
    const input = wrapper.find("input");
    await input.setValue("laptop");
    await nextTick();
    await input.trigger("keyup");
    await input.trigger("keypress.enter");

    expect(store.searchQuery).toBe("laptop");
    expect(store.showAutocomplete).toBe(false);
    expect(mockPush).toHaveBeenCalledWith("/search/laptop");
  });
});
