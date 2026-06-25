"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ email }));
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "#032147" }}
          >
            Prelegal
          </h1>
          <p className="text-sm" style={{ color: "#888888" }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium mb-1"
              style={{ color: "#032147" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ focusRingColor: "#209dd7" } as React.CSSProperties}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium mb-1"
              style={{ color: "#032147" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="w-full text-white font-medium py-2.5 rounded text-sm transition-opacity hover:opacity-90 mt-2"
            style={{ backgroundColor: "#753991" }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
