import { createRouter, createWebHistory } from "vue-router";
import router from "../router";

describe("Router", () => {
  it("has correct routes defined", () => {
    const routes = router.getRoutes();
    expect(routes).toHaveLength(8);
  });

  it("resolves the home route", () => {
    const route = router.resolve("/");
    expect(route.matched).toHaveLength(1);
  });

  it("resolves the search route with dynamic param", () => {
    const route = router.resolve("/search/test-query");
    expect(route.params.search).toBe("test-query");
    expect(route.matched).toHaveLength(1);
  });

  it("resolves the product route with dynamic param", () => {
    const route = router.resolve("/product/42");
    expect(route.params.productId).toBe("42");
    expect(route.matched).toHaveLength(1);
  });

  it("resolves the category route with dynamic param", () => {
    const route = router.resolve("/category/electronics");
    expect(route.params.category).toBe("electronics");
    expect(route.matched).toHaveLength(1);
  });

  it("redirects /category to /", () => {
    const categoryRoute = router.getRoutes().find((r) => r.path === "/category");
    expect(categoryRoute).toBeDefined();
    expect(categoryRoute!.redirect).toBe("/");
  });

  it("resolves the account route", () => {
    const route = router.resolve("/account");
    expect(route.matched).toHaveLength(1);
  });

  it("resolves the cart route", () => {
    const route = router.resolve("/cart");
    expect(route.matched).toHaveLength(1);
  });

  it("resolves the favourites route", () => {
    const route = router.resolve("/favourites");
    expect(route.matched).toHaveLength(1);
  });

  it("uses web history mode", () => {
    const Constructor =
      createWebHistory().constructor;
    expect(router.options.history).toBeInstanceOf(Constructor);
  });

  it("scrolls to top on navigation", () => {
    const result = router.options.scrollBehavior?.(
      {
        fullPath: "/",
        hash: "",
        name: undefined,
        params: {},
        query: {},
        path: "/",
        matched: [],
      },
      {
        fullPath: "/other",
        hash: "",
        name: undefined,
        params: {},
        query: {},
        path: "/other",
        matched: [],
      },
      null
    );
    expect(result).toEqual({ top: 0, behavior: "smooth" });
  });
});
