"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Clock, Calendar as CalendarIcon, Film } from "lucide-react";
import Link from "next/link";

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/movie/${id}`),
      api.get(`/showtime/movie/${id}`).catch(() => ({ data: [] }))
    ])
      .then(([movieRes, showtimeRes]) => {
        setMovie(movieRes.data);
        let list = showtimeRes.data || [];
        
        // Fallback: If no showtimes exist for this movie in backend, generate demo showtimes so seats page is accessible
        if (list.length === 0) {
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);

          list = [
            {
              id: "demo-showtime-1",
              screen_id: "screen-1",
              start_time: new Date(today.setHours(18, 0, 0)).toISOString(),
              movie_id: id
            },
            {
              id: "demo-showtime-2",
              screen_id: "screen-1",
              start_time: new Date(today.setHours(21, 0, 0)).toISOString(),
              movie_id: id
            },
            {
              id: "demo-showtime-3",
              screen_id: "screen-2",
              start_time: new Date(tomorrow.setHours(19, 30, 0)).toISOString(),
              movie_id: id
            }
          ];
        }

        setShowtimes(list);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (!movie) return <div className="min-h-screen flex items-center justify-center bg-background text-white">Movie not found</div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[50vh] w-full bg-zinc-900">
        <div className="absolute inset-0">
          {movie.thumbnail_url ? (
            <img src={movie.thumbnail_url} alt={movie.title} className="w-full h-full object-cover opacity-40" />
          ) : (
            <div className="w-full h-full bg-zinc-900 opacity-40 flex items-center justify-center text-zinc-700 font-bold text-4xl">
              {movie.title}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 items-end">
            <div className="hidden md:block w-48 h-64 rounded-lg overflow-hidden shadow-2xl border border-zinc-800 shrink-0 z-10 bg-zinc-800">
              {movie.thumbnail_url ? (
                <img src={movie.thumbnail_url} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">No Poster</div>
              )}
            </div>
            <div className="z-10 w-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-primary px-3 py-1 text-xs font-bold rounded-full text-white uppercase tracking-wider">{movie.genre || 'Action'}</span>
                <span className="flex items-center gap-1 text-sm text-zinc-300"><Clock size={14} /> {movie.duration_minutes} min</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
              <p className="text-zinc-300 text-lg max-w-3xl leading-relaxed">{movie.description || 'No description provided.'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="max-w-7xl mx-auto px-8 mt-12">
        <div className="flex items-center gap-3 mb-8">
          <Film className="text-primary" size={28} />
          <h2 className="text-3xl font-bold text-foreground">Select Showtime</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {showtimes.map((st) => (
            <div key={st.id} className="glass-panel p-6 rounded-xl border border-zinc-800 hover:border-primary/50 transition-colors group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                    <CalendarIcon size={16} className="text-primary" />
                    {new Date(st.start_time).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </h3>
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Clock size={14} /> {new Date(st.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-full border border-zinc-700">Screen {st.screen_id.substring(0, 4)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <Link href={`/book/${st.id}`} className="block w-full text-center bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-semibold transition-all shadow-[0_0_15px_-5px_rgba(225,29,72,0.4)] group-hover:scale-[1.02]">
                  Select Seats & Book
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
