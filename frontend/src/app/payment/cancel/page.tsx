"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

function CancelContent() {
  const searchParams = useSearchParams();
  const reservationId = searchParams.get("reservation_id");
  const [canceling, setCanceling] = useState(true);

  useEffect(() => {
    if (reservationId) {
      api.patch(`/reservation/${reservationId}/cancel`)
        .then(() => setCanceling(false))
        .catch(() => setCanceling(false));
    } else {
      setCanceling(false);
    }
  }, [reservationId]);

  return (
    <div className="glass-panel p-12 rounded-2xl max-w-md w-full border border-zinc-800">
      <XCircle className="text-red-500 w-20 h-20 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
      <p className="text-zinc-400 mb-8">
        {canceling ? "Canceling your reservation..." : "Your payment was cancelled and your reservation has been released."}
      </p>
      <Link href="/movies" className="inline-block w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all">
        Browse Other Movies
      </Link>
    </div>
  );
}

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8 text-center">
      <Suspense fallback={<div>Loading...</div>}>
        <CancelContent />
      </Suspense>
    </div>
  );
}
