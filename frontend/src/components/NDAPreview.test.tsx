import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import NDAPreview from "./NDAPreview";
import { defaultNDAData, NDAData } from "@/types/nda";

jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <div data-testid="markdown">{children}</div>,
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));

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
  mndaTermType: "years",
  mndaTermYears: "2",
  confidentialityType: "years",
  confidentialityYears: "3",
};

describe("NDAPreview", () => {
  it("renders document title", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Mutual Non-Disclosure Agreement")).toBeInTheDocument();
  });

  it("renders Cover Page section", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Cover Page")).toBeInTheDocument();
  });

  it("renders party 1 company name", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Bananas Inc")).toBeInTheDocument();
  });

  it("renders party 2 company name", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Mangoes Inc")).toBeInTheDocument();
  });

  it("renders party 1 name", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Ed Donner")).toBeInTheDocument();
  });

  it("renders party 2 name", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders party 1 title", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("CEO")).toBeInTheDocument();
  });

  it("renders MNDA term for years", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Expires 2 year(s) from Effective Date.")).toBeInTheDocument();
  });

  it("renders MNDA term for terminated", () => {
    render(<NDAPreview data={{ ...baseData, mndaTermType: "terminated" }} />);
    expect(screen.getByText(/Continues until terminated/)).toBeInTheDocument();
  });

  it("renders confidentiality term for years", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText(/3 year\(s\) from Effective Date/)).toBeInTheDocument();
  });

  it("renders confidentiality term for perpetuity", () => {
    render(<NDAPreview data={{ ...baseData, confidentialityType: "perpetuity" }} />);
    expect(screen.getByText("In perpetuity.")).toBeInTheDocument();
  });

  it("renders governing law", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText(/Governing Law: Delaware/)).toBeInTheDocument();
  });

  it("renders jurisdiction", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText(/Jurisdiction: New Castle, DE/)).toBeInTheDocument();
  });

  it("renders effective date", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("2026-01-01")).toBeInTheDocument();
  });

  it("renders PARTY 1 and PARTY 2 labels", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("PARTY 1")).toBeInTheDocument();
    expect(screen.getByText("PARTY 2")).toBeInTheDocument();
  });

  it("renders Standard Terms section", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText("Standard Terms")).toBeInTheDocument();
  });

  it("renders signing statement", () => {
    render(<NDAPreview data={baseData} />);
    expect(screen.getByText(/By signing this Cover Page/)).toBeInTheDocument();
  });

  it("shows placeholder when governing law is empty", () => {
    render(<NDAPreview data={{ ...baseData, governingLaw: "", jurisdiction: "" }} />);
    expect(screen.getByText(/Governing Law: \[Not specified\]/)).toBeInTheDocument();
  });

  it("renders modifications when provided", () => {
    render(<NDAPreview data={{ ...baseData, modifications: "No limitation on damages." }} />);
    expect(screen.getByText("No limitation on damages.")).toBeInTheDocument();
  });

  it("does not render modifications section when empty", () => {
    render(<NDAPreview data={{ ...baseData, modifications: "" }} />);
    expect(screen.queryByText("No limitation on damages.")).not.toBeInTheDocument();
  });
});
