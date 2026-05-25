import { setActivePinia, createPinia } from "pinia";

jest.mock("axios");

import axios from "axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("useUserStore", () => {
  const getStore = () => require("../../piniaStores/useUserStore").default();

  beforeEach(() => {
    jest.clearAllMocks();
    setActivePinia(createPinia());
  });

  describe("initial state", () => {
    it("has empty initial values", () => {
      const store = getStore();
      expect(store.username).toBe("");
      expect(store.email).toBe("");
      expect(store.password).toBe("");
      expect(store.message).toBe("");
      expect(store.user).toBeNull();
    });
  });

  describe("signUp", () => {
    it("signs up successfully", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { user: { username: "newuser" } },
      });
      const store = getStore();
      store.username = "newuser";
      store.email = "new@example.com";
      store.password = "password123";

      await store.signUp();

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        {
          username: "newuser",
          email: "new@example.com",
          password: "password123",
        },
        expect.any(Object)
      );
      expect(store.user).toBe("newuser");
      expect(store.message).toBe("Sign up successful.");
    });

    it("handles signup failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = { response: { data: { message: "Email taken" } } };
      mockedAxios.post.mockRejectedValue(error);
      const store = getStore();

      await store.signUp();

      expect(store.message).toContain("Failed to sign up");
      consoleSpy.mockRestore();
    });
  });

  describe("logIn", () => {
    it("logs in successfully", async () => {
      mockedAxios.post.mockResolvedValue({
        data: { user: { username: "existinguser" } },
      });
      const store = getStore();

      await store.logIn("existinguser", "pass123");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        { username: "existinguser", password: "pass123" },
        expect.any(Object)
      );
      expect(store.user).toBe("existinguser");
      expect(store.message).toBe("Log in successful.");
    });

    it("handles login failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = { response: { data: { message: "Invalid credentials" } } };
      mockedAxios.post.mockRejectedValue(error);
      const store = getStore();

      await store.logIn("baduser", "badpass");

      expect(store.message).toContain("Failed to log in");
      consoleSpy.mockRestore();
    });
  });

  describe("logOut", () => {
    it("logs out successfully", async () => {
      mockedAxios.post.mockResolvedValue({});
      const store = getStore();
      store.user = "someuser";

      await store.logOut();

      expect(mockedAxios.post).toHaveBeenCalled();
      expect(store.user).toBeNull();
      expect(store.message).toBe("Log out successful.");
    });

    it("handles logout failure", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const error = { response: { data: { message: "Not logged in" } } };
      mockedAxios.post.mockRejectedValue(error);
      const store = getStore();

      await store.logOut();

      expect(store.message).toContain("Failed to log out");
      consoleSpy.mockRestore();
    });
  });
});
