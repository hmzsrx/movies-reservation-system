"use client";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="glass-panel p-12 rounded-2xl max-w-md w-full border border-zinc-800">
      <CheckCircle className="text-green-500 w-20 h-20 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
      <p className="text-zinc-400 mb-8">
        Your booking has been confirmed and payment was received. Thank you!
      </p>
      <Link href="/movies" className="inline-block w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]">
        Back to Movies
      </Link>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
