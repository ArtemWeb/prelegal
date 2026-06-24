import { generateNDAMarkdown } from "./generateNDA";
import { defaultNDAData, NDAData } from "@/types/nda";

const baseData: NDAData = {
  ...defaultNDAData,
  party1Company: "Bananas Inc",
  party1Name: "Ed Donner",
  party1Title: "CEO",
  party1Address: "legal@bananas.com",
  party2Company: "Mangoes Inc",
  party2Name: "Jane Doe",
  party2Title: "CTO",
  party2Address: "legal@mangoes.com",
  governingLaw: "Delaware",
  jurisdiction: "New Castle, DE",
  effectiveDate: "2026-01-01",
};

describe("generateNDAMarkdown", () => {
  it("substitutes Governing Law in standard terms", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("laws of the State of Delaware");
    expect(result).not.toContain("{Governing Law}");
  });

  it("substitutes Jurisdiction in standard terms", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("courts located in New Castle, DE");
    expect(result).not.toContain("{Jurisdiction}");
  });

  it("includes party names and companies in cover page", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("Bananas Inc");
    expect(result).toContain("Ed Donner");
    expect(result).toContain("Mangoes Inc");
    expect(result).toContain("Jane Doe");
  });

  it("generates correct MNDA term for years", () => {
    const result = generateNDAMarkdown({ ...baseData, mndaTermType: "years", mndaTermYears: "3" });
    expect(result).toContain("Expires 3 year(s) from Effective Date");
  });

  it("generates correct MNDA term for terminated", () => {
    const result = generateNDAMarkdown({ ...baseData, mndaTermType: "terminated" });
    expect(result).toContain("Continues until terminated");
  });

  it("generates correct confidentiality term for years", () => {
    const result = generateNDAMarkdown({ ...baseData, confidentialityType: "years", confidentialityYears: "2" });
    expect(result).toContain("2 year(s) from Effective Date");
  });

  it("generates correct confidentiality term for perpetuity", () => {
    const result = generateNDAMarkdown({ ...baseData, confidentialityType: "perpetuity" });
    expect(result).toContain("In perpetuity");
  });

  it("shows placeholder when Governing Law is empty", () => {
    const result = generateNDAMarkdown({ ...baseData, governingLaw: "", jurisdiction: "" });
    expect(result).toContain("[Governing Law]");
    expect(result).toContain("[Jurisdiction]");
  });

  it("includes effective date in cover page", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("2026-01-01");
  });

  it("shows None when no modifications", () => {
    const result = generateNDAMarkdown({ ...baseData, modifications: "" });
    expect(result).toContain("None");
  });

  it("includes custom modifications when provided", () => {
    const result = generateNDAMarkdown({ ...baseData, modifications: "No limitation on damages." });
    expect(result).toContain("No limitation on damages.");
  });

  it("includes party addresses in cover page", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("legal@bananas.com");
    expect(result).toContain("legal@mangoes.com");
  });

  it("includes party titles in cover page", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("CEO");
    expect(result).toContain("CTO");
  });

  it("substitutes Governing Law multiple times in standard terms", () => {
    const result = generateNDAMarkdown(baseData);
    const matches = result.match(/Delaware/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("substitutes Jurisdiction multiple times in standard terms", () => {
    const result = generateNDAMarkdown(baseData);
    const matches = result.match(/New Castle, DE/g) || [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it("returns a non-empty string", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result.length).toBeGreaterThan(100);
  });

  it("includes standard terms text", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("Standard Terms");
    expect(result).toContain("Confidential Information");
  });

  it("includes Common Paper attribution", () => {
    const result = generateNDAMarkdown(baseData);
    expect(result).toContain("Common Paper");
  });
});
