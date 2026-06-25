"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NDAData, defaultNDAData } from "@/types/nda";
import NDAPreview from "@/components/NDAPreview";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<NDAData>(defaultNDAData);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      router.replace("/login");
    }
  }, [router]);

  const handleDownload = () => {
    import("@/lib/generateNDA").then(({ generateNDAMarkdown }) => {
      const markdown = generateNDAMarkdown(data);
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Mutual-NDA-${data.party1Company || "Party1"}-${data.party2Company || "Party2"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    });
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
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#032147" }}>
            Mutual NDA Creator
          </h1>
          <p className="text-sm" style={{ color: "#888888" }}>
            Chat with AI to generate your Mutual Non-Disclosure Agreement
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded text-sm transition-colors"
          >
            Download .md
          </button>
          <button
            onClick={handleDownloadPDF}
            className="text-white font-medium py-2 px-4 rounded text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#209dd7" }}
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <ChatInterface onFieldsUpdate={setData} />

        <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
            <span className="text-xs text-gray-400">Updates as you chat</span>
          </div>
          <div id="nda-print-area" className="bg-white border border-gray-200 rounded p-8">
            <NDAPreview data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
