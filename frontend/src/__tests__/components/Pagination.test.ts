import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";

const mockStoreInstance = {
  page: 1,
  navigateToPage: jest.fn(),
  nextPage: jest.fn(),
  previousPage: jest.fn(),
  pages_to_show: [1, 2, 3, 4, 5],
  total_pages: 10,
};

jest.mock("../../piniaStores/useProductsStore", () => ({
  __esModule: true,
  default: jest.fn(() => mockStoreInstance),
}));

import Pagination from "../../components/Pagination.vue";

describe("Pagination component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  it("renders previous page button", () => {
    const wrapper = mount(Pagination);
    const buttons = wrapper.findAll("button");
    const prevButton = buttons.find((b) => b.text() === "previous page");
    expect(prevButton).toBeTruthy();
  });

  it("renders next page button", () => {
    const wrapper = mount(Pagination);
    const buttons = wrapper.findAll("button");
    const nextButton = buttons.find((b) => b.text() === "next page");
    expect(nextButton).toBeTruthy();
  });

  it("calls nextPage when next button is clicked", async () => {
    const wrapper = mount(Pagination);
    const buttons = wrapper.findAll("button");
    const nextButton = buttons.find((b) => b.text() === "next page");
    await nextButton!.trigger("click");
    expect(mockStoreInstance.nextPage).toHaveBeenCalled();
  });

  it("calls previousPage when prev button is clicked", async () => {
    const wrapper = mount(Pagination);
    const buttons = wrapper.findAll("button");
    const prevButton = buttons.find((b) => b.text() === "previous page");
    await prevButton!.trigger("click");
    expect(mockStoreInstance.previousPage).toHaveBeenCalled();
  });

  it("renders page number buttons matching pages_to_show", () => {
    const wrapper = mount(Pagination);
    const pageButtons = wrapper.findAll("button").filter((b) => {
      const text = b.text().trim();
      return /^\d+$/.test(text);
    });
    expect(pageButtons).toHaveLength(5);
    expect(pageButtons[0].text()).toBe("1");
    expect(pageButtons[4].text()).toBe("5");
  });
});
