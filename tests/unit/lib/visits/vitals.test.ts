import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { doubleCheck, HARD, nextCheckupInDays, type VitalKey } from "@/lib/visits/vitals";

const normal = { bpSystolic: 110, bpDiastolic: 70, weightKg: 60, temperatureC: 36.5, pulseRate: 80, fundalHeightCm: 24, fetalHeartRate: 140 };
const noContext = { weeks: null, lastWeightKg: null };

describe("hard limits", () => {
  it("match the database (migration 0014)", () => {
    const sql = readFileSync("supabase/migrations/0014_phase5.sql", "utf8");
    const columns: Record<VitalKey, string> = {
      bpSystolic: "bp_systolic",
      bpDiastolic: "bp_diastolic",
      weightKg: "weight_kg",
      temperatureC: "temperature_c",
      pulseRate: "pulse_rate",
      fundalHeightCm: "fundal_height_cm",
      fetalHeartRate: "fetal_heart_rate",
    };
    for (const [key, column] of Object.entries(columns) as [VitalKey, string][]) {
      const match = sql.match(new RegExp(`${column} between (\\d+(?:\\.\\d+)?) and (\\d+(?:\\.\\d+)?)`));
      expect(match, column).not.toBeNull();
      expect({ min: Number(match![1]), max: Number(match![2]) }, column).toEqual(HARD[key]);
    }
  });
});

describe("doubleCheck", () => {
  it("flags nothing for usual values", () => {
    expect(doubleCheck(normal, { weeks: 24, lastWeightKg: 59 })).toEqual([]);
  });

  it("flags values outside the usual range", () => {
    expect(doubleCheck({ ...normal, bpSystolic: 140 }, noContext)).toEqual(["bpSystolic"]);
    expect(doubleCheck({ ...normal, bpDiastolic: 90, temperatureC: 37.8 }, noContext).sort()).toEqual(["bpDiastolic", "temperatureC"]);
    expect(doubleCheck({ ...normal, fetalHeartRate: 105 }, noContext)).toEqual(["fetalHeartRate"]);
  });

  it("keeps the edges of the usual range unflagged", () => {
    expect(doubleCheck({ ...normal, bpSystolic: 139, bpDiastolic: 89, temperatureC: 37.7, pulseRate: 110 }, noContext)).toEqual([]);
  });

  it("flags a weight change of more than 5 kg since the last visit", () => {
    expect(doubleCheck({ ...normal, weightKg: 66 }, { weeks: null, lastWeightKg: 60 })).toEqual(["weightKg"]);
    expect(doubleCheck({ ...normal, weightKg: 65 }, { weeks: null, lastWeightKg: 60 })).toEqual([]);
  });

  it("from week 20, flags a fundal height more than 4 cm from the weeks", () => {
    expect(doubleCheck({ ...normal, fundalHeightCm: 34 }, { weeks: 30, lastWeightKg: null })).toEqual([]);
    expect(doubleCheck({ ...normal, fundalHeightCm: 35 }, { weeks: 30, lastWeightKg: null })).toEqual(["fundalHeightCm"]);
    expect(doubleCheck({ ...normal, fundalHeightCm: 35 }, { weeks: 24, lastWeightKg: null })).toEqual(["fundalHeightCm"]);
    expect(doubleCheck({ ...normal, fundalHeightCm: 25 }, { weeks: 18, lastWeightKg: null })).toEqual([]);
  });

  it("skips fields that are empty", () => {
    expect(doubleCheck({ bpSystolic: null, weightKg: Number.NaN }, { weeks: 30, lastWeightKg: 60 })).toEqual([]);
  });
});

describe("nextCheckupInDays", () => {
  it("is 4 weeks, 2 from week 28, 1 from week 36", () => {
    expect([null, 0, 27, 28, 35, 36, 41].map(nextCheckupInDays)).toEqual([28, 28, 28, 14, 14, 7, 7]);
  });
});
