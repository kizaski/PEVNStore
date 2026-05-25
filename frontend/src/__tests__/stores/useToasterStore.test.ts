import { setActivePinia, createPinia } from "pinia";
import useToasterStore from "../../piniaStores/useToasterStore";

describe("useToasterStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("starts with an empty toasts array", () => {
    const store = useToasterStore();
    expect(store.toasts).toEqual([]);
  });

  it("adds a success toast", () => {
    const store = useToasterStore();
    store.success({ text: "Operation succeeded" });
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].text).toBe("Operation succeeded");
    expect(store.toasts[0].status).toBe("success");
  });

  it("adds a warning toast", () => {
    const store = useToasterStore();
    store.warning({ text: "Be careful" });
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].text).toBe("Be careful");
    expect(store.toasts[0].status).toBe("warning");
  });

  it("adds an error toast", () => {
    const store = useToasterStore();
    store.error({ text: "Something went wrong" });
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].text).toBe("Something went wrong");
    expect(store.toasts[0].status).toBe("error");
  });

  it("assigns a unique id to each toast", () => {
    const store = useToasterStore();
    store.success({ text: "First" });
    store.error({ text: "Second" });
    expect(store.toasts).toHaveLength(2);
    expect(store.toasts[0].id).not.toBe(store.toasts[1].id);
  });

  it("removes toast after default timeout", () => {
    const store = useToasterStore();
    store.success({ text: "Will disappear" });
    expect(store.toasts).toHaveLength(1);

    jest.advanceTimersByTime(2000);
    expect(store.toasts).toHaveLength(0);
  });

  it("removes toast after custom timeout", () => {
    const store = useToasterStore();
    store.success({ text: "Custom timeout", timeout: 5000 });

    jest.advanceTimersByTime(2000);
    expect(store.toasts).toHaveLength(1);

    jest.advanceTimersByTime(3000);
    expect(store.toasts).toHaveLength(0);
  });

  it("removes only the correct toast by id", () => {
    const store = useToasterStore();
    store.success({ text: "Short lived", timeout: 1000 });
    store.warning({ text: "Long lived", timeout: 5000 });

    jest.advanceTimersByTime(1000);
    expect(store.toasts).toHaveLength(1);
    expect(store.toasts[0].text).toBe("Long lived");

    jest.advanceTimersByTime(4000);
    expect(store.toasts).toHaveLength(0);
  });
});
