import { describe, it, expect, beforeEach } from "vitest";
import { useSimStore } from "../store";

describe("useSimStore", () => {
  beforeEach(() => {
    // Reset store to defaults
    useSimStore.setState({
      params: {
        stringLength: 57.5,
        strandCount: 24,
        material: "BCY-X",
        tension: 350,
        braceHeight: 7.0,
      },
      weights: [
        { position: 25, mass: 15, type: "brass" },
        { position: 75, mass: 15, type: "brass" },
      ],
      animating: true,
    });
  });

  it("has correct default params", () => {
    const { params } = useSimStore.getState();
    expect(params.stringLength).toBe(57.5);
    expect(params.material).toBe("BCY-X");
    expect(params.tension).toBe(350);
  });

  it("setParam updates a single param", () => {
    useSimStore.getState().setParam("tension", 500);
    expect(useSimStore.getState().params.tension).toBe(500);
    // Other params unchanged
    expect(useSimStore.getState().params.stringLength).toBe(57.5);
  });

  it("addWeight appends a weight", () => {
    useSimStore.getState().addWeight({ position: 50, mass: 20, type: "tungsten" });
    expect(useSimStore.getState().weights).toHaveLength(3);
    expect(useSimStore.getState().weights[2].type).toBe("tungsten");
  });

  it("addWeight caps at 8 weights", () => {
    for (let i = 0; i < 10; i++) {
      useSimStore.getState().addWeight({ position: 50, mass: 10, type: "brass" });
    }
    expect(useSimStore.getState().weights).toHaveLength(8);
  });

  it("removeWeight removes by index", () => {
    useSimStore.getState().removeWeight(0);
    const weights = useSimStore.getState().weights;
    expect(weights).toHaveLength(1);
    expect(weights[0].position).toBe(75);
  });

  it("updateWeight replaces at index", () => {
    useSimStore.getState().updateWeight(0, { position: 30, mass: 25, type: "tungsten" });
    const w = useSimStore.getState().weights[0];
    expect(w.position).toBe(30);
    expect(w.mass).toBe(25);
    expect(w.type).toBe("tungsten");
  });

  it("setAnimating toggles animation state", () => {
    useSimStore.getState().setAnimating(false);
    expect(useSimStore.getState().animating).toBe(false);
  });
});
