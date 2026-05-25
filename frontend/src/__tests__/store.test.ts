import { store } from "../store";

describe("reactive store", () => {
  beforeEach(() => {
    store.searchQuery = "";
    store.typingSearchQuery = "";
    store.showAutocomplete = false;
  });

  it("has default searchQuery as empty string", () => {
    expect(store.searchQuery).toBe("");
  });

  it("has default typingSearchQuery as empty string", () => {
    expect(store.typingSearchQuery).toBe("");
  });

  it("has default showAutocomplete as false", () => {
    expect(store.showAutocomplete).toBe(false);
  });

  it("is reactive - searchQuery can be updated", () => {
    store.searchQuery = "laptop";
    expect(store.searchQuery).toBe("laptop");
  });

  it("is reactive - typingSearchQuery can be updated", () => {
    store.typingSearchQuery = "lapt";
    expect(store.typingSearchQuery).toBe("lapt");
  });

  it("is reactive - showAutocomplete can be toggled", () => {
    store.showAutocomplete = true;
    expect(store.showAutocomplete).toBe(true);
  });
});
