"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { authHeader, clearAuth, getUser } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface DocSummary {
  id: number;
  document_type: string;
  created_at: string;
}

interface DocDetail {
  id: number;
  document_type: string;
  fields: Record<string, string>;
  rendered_content: string;
  created_at: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<DocSummary[]>([]);
  const [selected, setSelected] = useState<DocDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    setUserEmail(user.email);
    fetchDocs();
  }, [router]);

  async function fetchDocs() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        headers: authHeader(),
      });
      if (res.status === 401) {
        clearAuth();
        router.replace("/login");
        return;
      }
      setDocs(await res.json());
    } finally {
      setLoading(false);
    }
  }

  async function loadDoc(id: number) {
    const res = await fetch(`${API_BASE}/api/documents/${id}`, {
      headers: authHeader(),
    });
    setSelected(await res.json());
  }

  async function deleteDoc(id: number) {
    await fetch(`${API_BASE}/api/documents/${id}`, {
      method: "DELETE",
      headers: authHeader(),
    });
    if (selected?.id === id) setSelected(null);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold tracking-tight" style={{ color: "#032147" }}>
            prelegal
          </Link>
          <span className="text-sm font-medium" style={{ color: "#888888" }}>
            My Documents
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-white font-medium py-1.5 px-3 rounded text-xs transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#753991" }}
          >
            + New Document
          </Link>
          <span className="text-xs hidden sm:block" style={{ color: "#888888" }}>{userEmail}</span>
          <button onClick={handleSignOut} className="text-xs font-medium hover:underline" style={{ color: "#888888" }}>
            Sign out
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar list */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-400">Loading…</div>
          ) : docs.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400 mb-3">No documents yet</p>
              <Link
                href="/"
                className="text-xs font-medium hover:underline"
                style={{ color: "#209dd7" }}
              >
                Create your first document
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <li key={doc.id}>
                  <button
                    onClick={() => loadDoc(doc.id)}
                    className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors ${
                      selected?.id === doc.id ? "bg-blue-50 border-l-2" : ""
                    }`}
                    style={selected?.id === doc.id ? { borderLeftColor: "#209dd7" } : {}}
                  >
                    <p className="text-sm font-medium truncate" style={{ color: "#032147" }}>
                      {doc.document_type}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#888888" }}>
                      {formatDate(doc.created_at)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Document viewer */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {!selected ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-gray-400">Select a document to view</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Doc header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-xl font-semibold" style={{ color: "#032147" }}>
                    {selected.document_type}
                  </h1>
                  <p className="text-xs mt-1" style={{ color: "#888888" }}>
                    Created {formatDate(selected.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([selected.rendered_content], { type: "text/markdown;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${selected.document_type}.md`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded text-xs"
                  >
                    Download .md
                  </button>
                  <button
                    onClick={() => deleteDoc(selected.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1.5 px-3 rounded text-xs"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Fields */}
              {Object.entries(selected.fields).filter(([, v]) => v).length > 0 && (
                <div className="bg-white border border-gray-200 rounded p-5 mb-6">
                  <h2 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#032147" }}>
                    Fields
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {Object.entries(selected.fields)
                      .filter(([, v]) => v)
                      .map(([key, value]) => (
                        <div key={key} className="min-w-0">
                          <p className="text-xs" style={{ color: "#888888" }}>{key}</p>
                          <p className="text-sm font-medium" style={{ color: "#032147" }}>{value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Document */}
              <div className="bg-white border border-gray-200 rounded p-8 prose prose-sm max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {selected.rendered_content}
                </ReactMarkdown>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-center mt-4" style={{ color: "#888888" }}>
                This document is an AI-assisted draft. Please review with a qualified legal professional before use.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
