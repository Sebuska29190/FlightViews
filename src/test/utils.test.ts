import { describe, it, expect } from "vitest";
import {
  formatSpeed,
  formatSpeedKnots,
  formatAltitude,
  formatHeading,
  boundingBoxArea,
  creditCostForArea,
  weatherCodeToString,
} from "@/lib/utils";

describe("formatSpeed", () => {
  it("returns N/A for null", () => {
    expect(formatSpeed(null)).toBe("N/A");
  });

  it("converts m/s to km/h", () => {
    expect(formatSpeed(100)).toBe("360 km/h");
  });

  it("handles small values", () => {
    expect(formatSpeed(1)).toBe("4 km/h");
  });
});

describe("formatSpeedKnots", () => {
  it("returns N/A for null", () => {
    expect(formatSpeedKnots(null)).toBe("N/A");
  });

  it("converts m/s to knots", () => {
    expect(formatSpeedKnots(10)).toBe("19 kt");
  });
});

describe("formatAltitude", () => {
  it("returns N/A for null", () => {
    expect(formatAltitude(null)).toBe("N/A");
  });

  it("formats meters and feet", () => {
    expect(formatAltitude(1000)).toBe("1000 m / 3281 ft");
  });
});

describe("formatHeading", () => {
  it("returns N/A for null", () => {
    expect(formatHeading(null)).toBe("N/A");
  });

  it("returns cardinal direction", () => {
    expect(formatHeading(0)).toBe("0° N");
    expect(formatHeading(90)).toBe("90° E");
    expect(formatHeading(180)).toBe("180° S");
    expect(formatHeading(270)).toBe("270° W");
  });
});

describe("boundingBoxArea", () => {
  it("calculates area in sq degrees", () => {
    expect(
      boundingBoxArea({ lamin: 50, lomin: 10, lamax: 55, lomax: 15 })
    ).toBe(25);
  });

  it("handles negative coords", () => {
    expect(
      boundingBoxArea({ lamin: -10, lomin: -10, lamax: 10, lomax: 10 })
    ).toBe(400);
  });
});

describe("creditCostForArea", () => {
  it("returns correct credits for each tier", () => {
    expect(creditCostForArea(10)).toBe(1);
    expect(creditCostForArea(25)).toBe(1);
    expect(creditCostForArea(50)).toBe(2);
    expect(creditCostForArea(200)).toBe(3);
    expect(creditCostForArea(500)).toBe(4);
  });
});

describe("weatherCodeToString", () => {
  it("returns human-readable weather", () => {
    expect(weatherCodeToString(0)).toBe("Clear sky");
    expect(weatherCodeToString(61)).toBe("Slight rain");
    expect(weatherCodeToString(95)).toBe("Thunderstorm");
  });

  it("defaults to Unknown", () => {
    expect(weatherCodeToString(999)).toBe("Unknown");
  });
});
