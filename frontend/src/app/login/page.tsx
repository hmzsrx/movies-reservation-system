"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        email: email,
        password: password
      };
      
      const res = await api.post("/auth/login", payload);
      if (res.data.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
        window.location.href = "/movies";
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]" />
      
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-zinc-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Welcome Back</h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] mt-2">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-zinc-400 text-sm">
          Don&apos;t have an account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
