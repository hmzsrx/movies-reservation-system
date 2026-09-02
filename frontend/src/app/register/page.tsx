"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", formData);
      setShowOtp(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/verify-email", { email: formData.email, otp });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "OTP Verification failed");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel p-8 rounded-2xl text-center border border-zinc-800">
          <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Complete!</h2>
          <p className="text-zinc-400">Your email has been verified. Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
      
      <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-zinc-800">
        <h2 className="text-3xl font-bold mb-6 text-center text-foreground">
          {showOtp ? "Verify Email" : "Create Account"}
        </h2>
        {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm">{error}</div>}
        
        {!showOtp ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
              <input type="text" autoComplete="off" onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
              <input type="email" autoComplete="off" onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
              <input type="password" autoComplete="new-password" onChange={(e) => setFormData({...formData, password: e.target.value})} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] mt-6">
              Register
            </button>
            <p className="mt-6 text-center text-zinc-400 text-sm">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-zinc-400 text-center mb-4">
              We&apos;ve sent a 6-digit OTP to <strong className="text-white">{formData.email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Enter OTP</label>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
                maxLength={6}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-primary transition-colors" 
              />
            </div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] mt-6">
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
