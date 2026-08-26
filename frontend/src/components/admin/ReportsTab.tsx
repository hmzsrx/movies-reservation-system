"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { BarChart3, Film, Ticket } from "lucide-react";

export default function ReportsTab() {
  const [reservationReport, setReservationReport] = useState<any>(null);
  const [movieReports, setMovieReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [resRes, movRes] = await Promise.all([
          api.get("/report/reservations").catch(() => ({ data: null })),
          api.get("/report/movies").catch(() => ({ data: [] }))
        ]);
        setReservationReport(resRes.data);
        setMovieReports(movRes.data || []);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6"><BarChart3 className="text-primary" /> Reports & Analytics</h2>

      {/* Reservation Summary */}
      {reservationReport && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel border border-zinc-800 rounded-xl p-6 text-center">
            <Ticket className="mx-auto text-primary mb-2" size={28} />
            <p className="text-3xl font-bold text-white">{reservationReport.total_reservations}</p>
            <p className="text-sm text-zinc-400 mt-1">Total Reservations</p>
          </div>
          <div className="glass-panel border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div></div>
            <p className="text-3xl font-bold text-emerald-400">{reservationReport.confirmed_reservations}</p>
            <p className="text-sm text-zinc-400 mt-1">Confirmed</p>
          </div>
          <div className="glass-panel border border-zinc-800 rounded-xl p-6 text-center">
            <div className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2"><div className="w-3 h-3 rounded-full bg-red-500"></div></div>
            <p className="text-3xl font-bold text-red-400">{reservationReport.cancelled_reservations}</p>
            <p className="text-sm text-zinc-400 mt-1">Cancelled</p>
          </div>
        </div>
      )}

      {/* Movie Reports */}
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Film size={18} /> Movie-wise Breakdown</h3>
      {movieReports.length === 0 ? (
        <div className="glass-panel border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">No movie reports available yet.</div>
      ) : (
        <div className="glass-panel border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-4 text-sm font-medium text-zinc-400">Movie</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-zinc-400">Total Reservations</th>
                <th className="text-center px-6 py-4 text-sm font-medium text-zinc-400">Seats Reserved</th>
              </tr>
            </thead>
            <tbody>
              {movieReports.map((r, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{r.movie_title}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{r.total_reservations}</td>
                  <td className="px-6 py-4 text-center text-zinc-300">{r.total_seats_reserved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
