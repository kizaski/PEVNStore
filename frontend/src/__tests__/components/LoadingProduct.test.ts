import { mount } from "@vue/test-utils";
import LoadingProduct from "../../components/LoadingProduct.vue";

describe("LoadingProduct component", () => {
  it("renders without errors", () => {
    const wrapper = mount(LoadingProduct);
    expect(wrapper.exists()).toBe(true);
  });

  it("renders loading text", () => {
    const wrapper = mount(LoadingProduct);
    expect(wrapper.text()).toContain("Loading...");
  });

  it("renders placeholder skeleton bars", () => {
    const wrapper = mount(LoadingProduct);
    const bars = wrapper.findAll('[class*="bg-gray-200"]');
    expect(bars.length).toBeGreaterThanOrEqual(8);
  });

  it("renders an SVG placeholder image", () => {
    const wrapper = mount(LoadingProduct);
    const svg = wrapper.find("svg");
    expect(svg.exists()).toBe(true);
  });
});
