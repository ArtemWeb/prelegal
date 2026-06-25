"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ChatInterface, { ChatState } from "@/components/ChatInterface";

const PLACEHOLDER_TEXT = `# Your document will appear here

Start chatting with the AI assistant to create your legal document. The preview will update as you provide information.`;

export default function Home() {
  const router = useRouter();
  const [chatState, setChatState] = useState<ChatState>({
    documentType: null,
    renderedContent: null,
    complete: false,
  });

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      router.replace("/login");
    }
  }, [router]);

  const content = chatState.renderedContent ?? PLACEHOLDER_TEXT;

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${chatState.documentType ?? "document"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const element = document.getElementById("doc-print-area");
    if (!element) return;
    html2pdf(element, {
      margin: [15, 20],
      filename: `${chatState.documentType ?? "document"}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "#032147" }}>
            {chatState.documentType ?? "Legal Document Creator"}
          </h1>
          <p className="text-sm" style={{ color: "#888888" }}>
            Chat with AI to generate your legal document
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            disabled={!chatState.renderedContent}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded text-sm transition-colors disabled:opacity-40"
          >
            Download .md
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!chatState.renderedContent}
            className="text-white font-medium py-2 px-4 rounded text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#209dd7" }}
          >
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <ChatInterface onStateUpdate={setChatState} />

        <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Preview</h2>
            <span className="text-xs text-gray-400">Updates as you chat</span>
          </div>
          <div
            id="doc-print-area"
            className="bg-white border border-gray-200 rounded p-8 prose prose-sm max-w-none"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
