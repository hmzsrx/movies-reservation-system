"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Armchair, CreditCard, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function BookSeats() {
  const { showtime_id } = useParams();
  const router = useRouter();
  const [showtime, setShowtime] = useState<any>(null);
  const [movie, setMovie] = useState<any>(null);
  const [seats, setSeats] = useState<any[]>([]);
  const [reservedSeatIds, setReservedSeatIds] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  const ticketPrice = movie?.price ?? 15.0;

  useEffect(() => {
    if (!showtime_id) return;

    const loadData = async () => {
      try {
        // 1. Fetch showtime
        const showtimeRes = await api.get(`/showtime/${showtime_id}`);
        const showtimeData = showtimeRes.data;
        setShowtime(showtimeData);

        // 2. Fetch movie details (for price)
        try {
          const movieRes = await api.get(`/movie/${showtimeData.movie_id}`);
          setMovie(movieRes.data);
        } catch {
          // Movie fetch failed, use default price
        }

        // 3. Fetch seats for the screen
        let seatData: any[] = [];
        try {
          const seatsRes = await api.get(`/seat/screen/${showtimeData.screen_id}`);
          seatData = seatsRes.data || [];
        } catch {
          seatData = [];
        }

        setSeats(seatData);

        // 5. Fetch reserved seats
        try {
          const reservedRes = await api.get(`/reservation/showtime/${showtime_id}/reserved-seats`);
          setReservedSeatIds(reservedRes.data || []);
        } catch {
          setReservedSeatIds([]);
        }

      } catch {
        // Showtime fetch failed
        setShowtime(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [showtime_id]);

  const toggleSeat = (seatId: string) => {
    if (reservedSeatIds.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) return;
    setBookingError("");
    setProcessing(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // 1. Create reservation
      const res = await api.post("/reservation/", {
        showtime_id: showtime_id,
        seat_ids: selectedSeats
      });

      const reservationId = res.data.id;
      const amount = selectedSeats.length * ticketPrice;

      // 2. Create Stripe checkout session
      const paymentRes = await api.post("/payments/checkout", {
        reservation_id: reservationId,
        amount: amount,
        currency: "usd"
      });

      // 3. Redirect to Stripe Checkout
      window.location.href = paymentRes.data.checkout_url;

    } catch (err: any) {
      setProcessing(false);
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setBookingError(detail);
      } else if (Array.isArray(detail)) {
        setBookingError(detail.map((d: any) => `${d.loc?.[d.loc.length - 1] || "Field"}: ${d.msg}`).join(", "));
      } else {
        setBookingError(err.message || "Booking or Payment failed");
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-primary border-t-2"></div></div>;
  if (!showtime) return <div className="min-h-screen text-white bg-background flex justify-center items-center">Showtime not found</div>;

  // Group seats by row_number
  const rows = Array.from(new Set(seats.map(s => s.row_number))).sort();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/movies" className="inline-flex items-center gap-2 text-zinc-400 hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Movies
        </Link>

        <h1 className="text-3xl font-bold mb-2">Select Your Seats</h1>
        <p className="text-zinc-400 mb-8">
          {movie?.title && <span className="text-white font-medium">{movie.title} — </span>}
          {new Date(showtime.start_time).toLocaleString()}
        </p>

        {bookingSuccess ? (
          <div className="glass-panel p-8 rounded-xl text-center border-green-500/50">
            <h2 className="text-2xl font-bold text-green-400 mb-2">Booking Confirmed!</h2>
            <p className="text-zinc-300">Your seats have been successfully reserved.</p>
          </div>
        ) : seats.length === 0 ? (
          <div className="glass-panel p-8 rounded-xl text-center border border-zinc-700">
            <h2 className="text-xl font-bold text-zinc-300 mb-2">No Seats Available</h2>
            <p className="text-zinc-400">This screen has no seats configured. Please contact the administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Seat Map */}
            <div className="lg:col-span-2 glass-panel p-8 rounded-xl overflow-x-auto border border-zinc-800">
              <div className="w-full h-2 bg-zinc-700 rounded-full mb-12 relative shadow-[0_10px_20px_rgba(255,255,255,0.1)]">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-zinc-400 tracking-[0.3em] uppercase">Screen</span>
              </div>

              <div className="flex flex-col gap-4 items-center">
                {rows.map(row => (
                  <div key={row} className="flex items-center gap-4">
                    <span className="w-6 text-center text-zinc-500 font-bold">{row}</span>
                    <div className="flex gap-2">
                      {seats.filter(s => s.row_number === row).sort((a, b) => a.seat_number - b.seat_number).map(seat => {
                        const isSelected = selectedSeats.includes(seat.id);
                        const isReserved = reservedSeatIds.includes(seat.id);

                        return (
                          <button
                            key={seat.id}
                            disabled={isReserved}
                            onClick={() => toggleSeat(seat.id)}
                            className={`w-10 h-10 rounded-t-lg flex items-center justify-center transition-all ${isReserved
                                ? 'bg-zinc-900 text-zinc-600 border border-zinc-800/80 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(225,29,72,0.6)] scale-110'
                                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700/50'
                              }`}
                            title={isReserved ? "Seat Reserved" : `Row ${seat.row_number} Seat ${seat.seat_number}`}
                          >
                            <span className="text-xs">{seat.seat_number}</span>
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-center text-zinc-500 font-bold">{row}</span>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-8 mt-12 pt-8 border-t border-zinc-800">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700"></div><span className="text-sm text-zinc-400">Available</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-primary shadow-[0_0_5px_rgba(225,29,72,0.6)]"></div><span className="text-sm text-zinc-400">Selected</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800"></div><span className="text-sm text-zinc-400">Reserved</span></div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-panel p-6 rounded-xl h-fit sticky top-24 border border-zinc-800">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-primary" /> Booking Summary
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Tickets Selected</span>
                  <span className="font-bold text-white">{selectedSeats.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Price per Ticket</span>
                  <span className="font-bold text-white">${ticketPrice.toFixed(2)}</span>
                </div>
                <div className="h-px bg-zinc-800 w-full my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="text-zinc-300">Total Amount</span>
                  <span className="font-bold text-primary">${(selectedSeats.length * ticketPrice).toFixed(2)}</span>
                </div>
              </div>

              {bookingError && <div className="bg-red-500/20 text-red-200 text-sm p-3 rounded mb-4">{bookingError}</div>}

              <button
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || processing}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold py-4 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] disabled:shadow-none flex items-center justify-center gap-2"
              >
                {processing ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div> Processing...</>
                ) : (
                  <><Armchair size={18} /> Confirm & Pay</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
