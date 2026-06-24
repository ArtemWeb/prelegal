"use client";

import { useState } from "react";
import { NDAData, defaultNDAData } from "@/types/nda";
import { generateNDAMarkdown } from "@/lib/generateNDA";
import NDAPreview from "@/components/NDAPreview";

const Field = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  name: keyof NDAData;
  value: string;
  onChange: (name: keyof NDAData, value: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default function Home() {
  const [data, setData] = useState<NDAData>(defaultNDAData);

  const update = (name: keyof NDAData, value: string) =>
    setData((prev) => ({ ...prev, [name]: value }));

  const handleDownload = () => {
    const markdown = generateNDAMarkdown(data);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mutual-NDA-${data.party1Company || "Party1"}-${data.party2Company || "Party2"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("nda-print-area");
    if (!element) return;
    html2pdf(element, {
      margin: [15, 20],
      filename: `Mutual-NDA-${data.party1Company || "Party1"}-${data.party2Company || "Party2"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Mutual NDA Creator</h1>
        <p className="text-sm text-gray-500">Fill in the details below to generate your Mutual Non-Disclosure Agreement</p>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Form */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <div className="space-y-6">

            {/* Parties */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Party 1</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company" name="party1Company" value={data.party1Company} onChange={update} placeholder="Acme Inc." />
                <Field label="Name" name="party1Name" value={data.party1Name} onChange={update} placeholder="Jane Smith" />
                <Field label="Title" name="party1Title" value={data.party1Title} onChange={update} placeholder="CEO" />
                <Field label="Notice Address" name="party1Address" value={data.party1Address} onChange={update} placeholder="jane@acme.com" />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Party 2</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company" name="party2Company" value={data.party2Company} onChange={update} placeholder="Beta Corp." />
                <Field label="Name" name="party2Name" value={data.party2Name} onChange={update} placeholder="John Doe" />
                <Field label="Title" name="party2Title" value={data.party2Title} onChange={update} placeholder="CTO" />
                <Field label="Notice Address" name="party2Address" value={data.party2Address} onChange={update} placeholder="john@betacorp.com" />
              </div>
            </section>

            {/* Agreement Details */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Agreement Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Purpose</label>
                  <textarea
                    value={data.purpose}
                    onChange={(e) => update("purpose", e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Field label="Effective Date" name="effectiveDate" value={data.effectiveDate} onChange={update} type="date" />
              </div>
            </section>

            {/* MNDA Term */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">MNDA Term</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={data.mndaTermType === "years"}
                    onChange={() => update("mndaTermType", "years")}
                  />
                  Expires after
                  <input
                    type="number"
                    min="1"
                    value={data.mndaTermYears}
                    onChange={(e) => update("mndaTermYears", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm"
                    disabled={data.mndaTermType !== "years"}
                  />
                  year(s)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={data.mndaTermType === "terminated"}
                    onChange={() => update("mndaTermType", "terminated")}
                  />
                  Continues until terminated
                </label>
              </div>
            </section>

            {/* Term of Confidentiality */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Term of Confidentiality</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={data.confidentialityType === "years"}
                    onChange={() => update("confidentialityType", "years")}
                  />
                  <input
                    type="number"
                    min="1"
                    value={data.confidentialityYears}
                    onChange={(e) => update("confidentialityYears", e.target.value)}
                    className="w-16 border border-gray-300 rounded px-2 py-0.5 text-sm"
                    disabled={data.confidentialityType !== "years"}
                  />
                  year(s) from Effective Date
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    checked={data.confidentialityType === "perpetuity"}
                    onChange={() => update("confidentialityType", "perpetuity")}
                  />
                  In perpetuity
                </label>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Governing Law & Jurisdiction</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Governing Law (State)" name="governingLaw" value={data.governingLaw} onChange={update} placeholder="Delaware" />
                <Field label="Jurisdiction" name="jurisdiction" value={data.jurisdiction} onChange={update} placeholder="New Castle, DE" />
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Modifications</h2>
              <textarea
                value={data.modifications}
                onChange={(e) => update("modifications", e.target.value)}
                placeholder="List any modifications to the standard terms, or leave blank for none."
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </section>

            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded text-sm transition-colors"
              >
                Download .md
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded text-sm transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
            <span className="text-xs text-gray-400">Updates as you type</span>
          </div>
          <div id="nda-print-area" className="bg-white border border-gray-200 rounded p-8">
            <NDAPreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
