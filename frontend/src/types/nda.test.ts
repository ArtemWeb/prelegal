import { defaultNDAData, NDAData } from "./nda";

describe("defaultNDAData", () => {
  it("has all required fields", () => {
    const keys: (keyof NDAData)[] = [
      "party1Company", "party1Name", "party1Title", "party1Address",
      "party2Company", "party2Name", "party2Title", "party2Address",
      "purpose", "effectiveDate", "mndaTermType", "mndaTermYears",
      "confidentialityType", "confidentialityYears",
      "governingLaw", "jurisdiction", "modifications",
    ];
    keys.forEach((key) => expect(defaultNDAData).toHaveProperty(key));
  });

  it("has empty strings for party fields", () => {
    expect(defaultNDAData.party1Company).toBe("");
    expect(defaultNDAData.party1Name).toBe("");
    expect(defaultNDAData.party2Company).toBe("");
    expect(defaultNDAData.party2Name).toBe("");
  });

  it("has default purpose text", () => {
    expect(defaultNDAData.purpose).toContain("business relationship");
  });

  it("defaults mndaTermType to years", () => {
    expect(defaultNDAData.mndaTermType).toBe("years");
  });

  it("defaults mndaTermYears to 1", () => {
    expect(defaultNDAData.mndaTermYears).toBe("1");
  });

  it("defaults confidentialityType to years", () => {
    expect(defaultNDAData.confidentialityType).toBe("years");
  });

  it("defaults confidentialityYears to 1", () => {
    expect(defaultNDAData.confidentialityYears).toBe("1");
  });

  it("sets effectiveDate to today", () => {
    const today = new Date().toISOString().split("T")[0];
    expect(defaultNDAData.effectiveDate).toBe(today);
  });

  it("has empty governingLaw and jurisdiction", () => {
    expect(defaultNDAData.governingLaw).toBe("");
    expect(defaultNDAData.jurisdiction).toBe("");
  });

  it("has empty modifications", () => {
    expect(defaultNDAData.modifications).toBe("");
  });
});
