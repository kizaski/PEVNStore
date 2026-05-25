import { mount } from "@vue/test-utils";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia, setActivePinia } from "pinia";
import Product from "../../components/Product.vue";
import { Product as ProductType } from "../../types/product";

describe("Product component", () => {
  const mockProduct: ProductType = {
    id: 1,
    product_name: "Test Product",
    product_image_url: "https://example.com/image.jpg",
    product_price: 49.99,
    product_description: "A great product",
    product_category: "Electronics",
    release_date: new Date("2024-01-01"),
    manufacturer: "TestMfr",
    product_rating: 4.5,
    customer_reviews: 120,
    product_website: "https://example.com",
  };

  let router: ReturnType<typeof createRouter>;

  beforeEach(() => {
    setActivePinia(createPinia());
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: "/", component: { template: "<div>Home</div>" } },
        {
          path: "/product/:productId",
          component: { template: "<div>Product</div>" },
        },
      ],
    });
  });

  it("renders product name", () => {
    const wrapper = mount(Product, {
      props: { product: mockProduct },
      global: { plugins: [router] },
    });
    expect(wrapper.text()).toContain("Test Product");
  });

  it("renders product price", () => {
    const wrapper = mount(Product, {
      props: { product: mockProduct },
      global: { plugins: [router] },
    });
    expect(wrapper.text()).toContain("$49.99");
  });

  it("renders product image with correct src", () => {
    const wrapper = mount(Product, {
      props: { product: mockProduct },
      global: { plugins: [router] },
    });
    const img = wrapper.find("img");
    expect(img.attributes("src")).toBe("https://example.com/image.jpg");
  });

  it("links to the correct product page", () => {
    const wrapper = mount(Product, {
      props: { product: mockProduct },
      global: { plugins: [router] },
    });
    const link = wrapper.findComponent({ name: "RouterLink" });
    expect(link.props("to")).toBe("/product/1");
  });
});
