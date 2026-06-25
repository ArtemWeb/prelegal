"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ChatInterface, { ChatState } from "@/components/ChatInterface";
import { clearAuth, getUser } from "@/lib/auth";

const PLACEHOLDER_TEXT = `# Your document will appear here

Start chatting with the AI assistant on the left. The preview will update as you provide information.`;

export default function Home() {
  const router = useRouter();
  const [chatState, setChatState] = useState<ChatState>({
    documentType: null,
    fields: {},
    renderedContent: null,
    complete: false,
  });
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
    } else {
      setUserEmail(user.email);
    }
  }, [router]);

  const content = chatState.renderedContent ?? PLACEHOLDER_TEXT;
  const filledFields = Object.entries(chatState.fields).filter(([, v]) => v);

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-6">
          <span className="text-xl font-bold tracking-tight" style={{ color: "#032147" }}>
            prelegal
          </span>
          {chatState.documentType && (
            <span className="text-sm font-medium" style={{ color: "#209dd7" }}>
              {chatState.documentType}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={!chatState.renderedContent}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded text-xs transition-colors disabled:opacity-40"
          >
            Download .md
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!chatState.renderedContent}
            className="text-white font-medium py-1.5 px-3 rounded text-xs transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: "#209dd7" }}
          >
            Download PDF
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <Link
            href="/documents"
            className="text-xs font-medium hover:underline"
            style={{ color: "#032147" }}
          >
            My Documents
          </Link>
          <span className="text-xs hidden sm:block" style={{ color: "#888888" }}>
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium hover:underline"
            style={{ color: "#888888" }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex-shrink-0">
        <p className="text-xs text-center" style={{ color: "#888888" }}>
          Documents generated here are AI-assisted drafts and should be reviewed by a qualified legal professional before use.
        </p>
      </div>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <ChatInterface onStateUpdate={setChatState} />

        {/* Preview panel */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">
          {/* Field summary */}
          {filledFields.length > 0 && (
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#032147" }}>
                  Collected Fields
                </h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(236,173,10,0.15)", color: "#9a7200" }}>
                  {filledFields.length} filled
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {filledFields.map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <p className="text-xs truncate" style={{ color: "#888888" }}>{key}</p>
                    <p className="text-sm font-medium truncate" style={{ color: "#032147" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document */}
          <div className="flex-1 overflow-y-auto p-6">
            {filledFields.length === 0 && (
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-500">Preview</h2>
                <span className="text-xs text-gray-400">Updates as you chat</span>
              </div>
            )}
            <div
              id="doc-print-area"
              className="bg-white border border-gray-200 rounded p-8 prose prose-sm max-w-none"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
