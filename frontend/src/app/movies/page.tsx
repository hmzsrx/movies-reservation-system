"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { Clock, Star, Film, DollarSign, Pencil, Trash2, X, Save, Search, User } from "lucide-react";

export default function Movies() {
  const [movies, setMovies] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Edit State
  const [editingMovie, setEditingMovie] = useState<Record<string, unknown> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    duration_minutes: number | string;
    price: number | string;
    genre_name: string;
    thumbnail_url: string;
  }>({
    title: "",
    description: "",
    duration_minutes: 120,
    price: 10.0,
    genre_name: "Action",
    thumbnail_url: ""
  });

  const fetchMovies = () => {
    api.get("/movie/")
      .then(res => {
        setMovies(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        console.error("Error fetching movies:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        const res = await api.get("/user/me");
        setUserRole(res.data.role);
      }
    } catch (err) {
      console.error("Failed to fetch user role", err);
    }
  };

  useEffect(() => {
    fetchMovies();
    fetchUserRole();
  }, []);

  const handleDeleteMovie = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie? This will also delete related showtimes.")) return;
    
    try {
      await api.delete(`/movie/${id}`);
      fetchMovies();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      alert(e.response?.data?.detail || e.message || "Failed to delete movie");
    }
  };

  const openEditModal = (movie: Record<string, unknown>) => {
    setEditingMovie(movie);
    setEditFile(null);
    setEditForm({
      title: (movie.title as string) || "",
      description: (movie.description as string) || "",
      duration_minutes: (movie.duration_minutes as number) || 120,
      price: (movie.price as number) || 10.0,
      genre_name: (movie.genre_name as string) || "Action",
      thumbnail_url: (movie.thumbnail_url as string) || ""
    });
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    setEditLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", editForm.title);
      if (editForm.description) formData.append("description", editForm.description);
      formData.append("duration_minutes", String(editForm.duration_minutes));
      formData.append("price", String(editForm.price));
      if (editForm.genre_name) formData.append("genre_name", editForm.genre_name);
      if (editForm.thumbnail_url) formData.append("thumbnail_url", editForm.thumbnail_url);
      if (editFile) formData.append("thumbnail", editFile);
      await api.post(`/movie/${editingMovie.id}/update`, formData);
      setEditingMovie(null);
      setEditFile(null);
      fetchMovies();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") alert(detail);
      else if (Array.isArray(detail)) alert((detail as { loc?: string[]; msg: string }[]).map((d) => `${d.loc?.[d.loc.length - 1]}: ${d.msg}`).join(", "));
      else alert(e.message || "Failed to update movie");
    } finally {
      setEditLoading(false);
    }
  };

  const genres = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Thriller", "Romance", "Animation"];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold text-foreground">Now Showing</h1>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 bg-zinc-900 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <Link href="/profile" className="p-2.5 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold flex items-center justify-center shrink-0" title="My Profile">
              <User size={18} />
            </Link>
            {userRole === "admin" && (
              <Link href="/admin" className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors text-sm font-semibold shrink-0">
                Go to Admin Portal
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : movies.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center max-w-xl mx-auto border border-zinc-800 my-12">
            <Film size={48} className="mx-auto text-zinc-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-zinc-300">No Movies Currently Available</h2>
            <p className="text-zinc-500 mb-6">There are no showtimes or movies loaded in the database yet.</p>
            <Link href="/" className="inline-block bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2.5 rounded-full transition-colors">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.filter(m => (m.title as string).toLowerCase().includes(searchQuery.toLowerCase()) || (m.genre_name && (m.genre_name as string).toLowerCase().includes(searchQuery.toLowerCase()))).map((movie) => (
              <div key={movie.id} className="glass-panel rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300 border border-zinc-800 flex flex-col">
                <div className="h-64 bg-zinc-800 relative">
                  {movie.thumbnail_url ? (
                    <Image src={movie.thumbnail_url as string} alt={movie.title as string} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-semibold">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1 text-white">
                    <Star size={12} className="text-yellow-400" /> {movie.rating || 'N/A'}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-emerald-600/90 text-white backdrop-blur text-xs font-bold px-2.5 py-1 rounded flex items-center gap-0.5 shadow">
                    <DollarSign size={12} /> {movie.price ? (movie.price as number).toFixed(2) : "10.00"}
                  </div>
                  
                  
                </div>
                
                <div className="p-4 flex flex-col flex-grow relative">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg truncate pr-2">{movie.title}</h3>
                    {userRole === "admin" && (
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.preventDefault(); openEditModal(movie); }}
                          className="p-1.5 bg-zinc-800/80 hover:bg-primary hover:text-white rounded text-zinc-400 transition-colors"
                          title="Edit Movie"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); handleDeleteMovie(movie.id); }}
                          className="p-1.5 bg-zinc-800/80 hover:bg-red-500 hover:text-white rounded text-zinc-400 transition-colors"
                          title="Delete Movie"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400 mb-4">
                    <span className="flex items-center gap-1"><Clock size={12} /> {movie.duration_minutes}m</span>
                    <span className="bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">{movie.genre_name || movie.genre || 'Action'}</span>
                  </div>
                  <div className="mt-auto pt-2">
                    <Link href={`/movies/${movie.id}`} className="block w-full text-center bg-zinc-800 hover:bg-primary text-white py-2 rounded-lg transition-colors text-sm font-semibold">
                      View Showtimes & Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-2xl shadow-2xl my-8 relative">
            <button 
              onClick={() => setEditingMovie(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Movie: {editingMovie.title}</h2>
            
            <form onSubmit={handleUpdateMovie} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Movie Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Genre</label>
                  <select value={editForm.genre_name} onChange={e => setEditForm({...editForm, genre_name: e.target.value})} className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors appearance-none">
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duration (minutes)</label>
                  <input type="number" min="1" value={editForm.duration_minutes} onChange={e => setEditForm({...editForm, duration_minutes: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Ticket Price ($)</label>
                  <input type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} required className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Poster Image URL (Optional)</label>
                <input type="url" value={editForm.thumbnail_url} onChange={e => setEditForm({...editForm, thumbnail_url: e.target.value})} placeholder="https://example.com/image.jpg" className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Upload New Image</label>
                {(editForm.thumbnail_url || editFile) && (
                  <div className="mb-2 rounded-lg overflow-hidden h-20 w-20 bg-zinc-800 border border-zinc-700 relative">
                    <Image src={editFile ? URL.createObjectURL(editFile) : editForm.thumbnail_url} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} rows={4} className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
                <button type="button" onClick={() => setEditingMovie(null)} className="px-6 py-2.5 rounded-lg text-zinc-300 font-medium hover:bg-zinc-800 transition-colors">Cancel</button>
                <button type="submit" disabled={editLoading} className="bg-primary hover:bg-primary-hover text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:bg-primary/50 disabled:cursor-not-allowed">
                  {editLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
