// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { createAppStore } from "./store";

describe("Application store slices", () => {
  it("Should initialize with default empty values", () => {
    const store = createAppStore();
    expect(store.getState().username).toBe("");
    expect(store.getState().items).toStrictEqual([]);
  });

  it("Should update username in successful login", () => {
    const store = createAppStore();
    store.getState().login("Mojahed");
    expect(store.getState().username).toBe("Mojahed");
  });

  it("Should throw an error on Zod validation failure for short username", () => {
    const store = createAppStore();
    // Verify that login throws an error when the username is too short (< 3 chars)
    expect(() => {
      store.getState().login("m");
    }).toThrow();
  });

  it("Should clear username and cart on logout", () => {
    const store = createAppStore();
    // Simulate user state
    store.getState().login("Mojahed");
    store.getState().addItem("⌨️ Mechanical Keyboard");

    // Trigger cross-slice logout action
    store.getState().logout();

    expect(store.getState().username).toBe("");
    expect(store.getState().items).toStrictEqual([]);
  });
});
