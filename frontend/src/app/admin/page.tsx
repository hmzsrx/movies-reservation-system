"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { Film, Plus, Calendar, Shield, Trash2, CheckCircle, Image as ImageIcon, Tag, DollarSign, Pencil, X, Save, Monitor, Armchair, BarChart3 } from "lucide-react";
import ScreensTab from "@/components/admin/ScreensTab";
import SeatsTab from "@/components/admin/SeatsTab";
import GenresTab from "@/components/admin/GenresTab";
import ReportsTab from "@/components/admin/ReportsTab";

type TabType = "movies" | "add-movie" | "add-showtime" | "screens" | "seats" | "genres" | "reports";

export default function AdminDashboard() {
  const [movies, setMovies] = useState<Record<string, unknown>[]>([]);
  const [screens, setScreens] = useState<Record<string, unknown>[]>([]);
  const [genres, setGenres] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("movies");

  const [movieForm, setMovieForm] = useState<{
    title: string;
    description: string;
    duration_minutes: number | string;
    price: number | string;
    genre_name: string;
    release_date: string;
    thumbnail_url: string;
  }>({
    title: "",
    description: "",
    duration_minutes: 120,
    price: 15.00,
    genre_name: "Action",
    release_date: new Date().toISOString().split("T")[0],
    thumbnail_url: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingMovie, setEditingMovie] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    description: string;
    duration_minutes: number | string;
    price: number | string;
    genre_name: string;
    release_date: string;
    thumbnail_url: string;
  }>({
    title: "",
    description: "",
    duration_minutes: 120,
    price: 15.00,
    genre_name: "Action",
    release_date: "",
    thumbnail_url: ""
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editFile, setEditFile] = useState<File | null>(null);

  const [showtimeForm, setShowtimeForm] = useState({
    movie_id: "",
    screen_id: "",
    start_time: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [moviesRes, screensRes, genresRes] = await Promise.all([
        api.get("/movie/").catch(() => ({ data: [] })),
        api.get("/screen/").catch(() => ({ data: [] })),
        api.get("/generic/").catch(() => ({ data: [] }))
      ]);
      const fetchedMovies = moviesRes.data || [];
      const fetchedScreens = screensRes.data || [];
      const fetchedGenres = genresRes.data || [];
      setMovies(fetchedMovies);
      setScreens(fetchedScreens);
      setGenres(fetchedGenres);
      setShowtimeForm(prev => ({
        ...prev,
        movie_id: fetchedMovies.length > 0 ? (fetchedMovies[0].id as string) : "",
        screen_id: fetchedScreens.length > 0 ? (fetchedScreens[0].id as string) : ""
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    
    api.get("/user/me").then(res => {
      if (res.data.role !== "admin") {
        router.push("/movies");
      } else {
        fetchData();
      }
    }).catch(() => {
      router.push("/login");
    });
  }, [router, fetchData]);

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("title", movieForm.title);
        if (movieForm.description) formData.append("description", movieForm.description);
        formData.append("duration_minutes", String(movieForm.duration_minutes));
        formData.append("price", String(movieForm.price));
        if (movieForm.release_date) formData.append("release_date", movieForm.release_date);
        if (movieForm.genre_name) formData.append("genre_name", movieForm.genre_name);
        if (movieForm.thumbnail_url) formData.append("thumbnail_url", movieForm.thumbnail_url);
        formData.append("thumbnail", selectedFile);
        await api.post("/movie/", formData);
      } else {
        await api.post("/movie/create-json", {
          title: movieForm.title,
          description: movieForm.description || null,
          duration_minutes: Number(movieForm.duration_minutes),
          price: Number(movieForm.price),
          release_date: movieForm.release_date ? new Date(movieForm.release_date).toISOString() : null,
          genre_name: movieForm.genre_name,
          thumbnail_url: movieForm.thumbnail_url || null
        });
      }
      setMessage("Movie & ticket price created successfully!");
      setMovieForm({ title: "", description: "", duration_minutes: 120, price: 15.00, genre_name: "Action", release_date: new Date().toISOString().split("T")[0], thumbnail_url: "" });
      setSelectedFile(null);
      fetchData();
      setActiveTab("movies");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail)) setError(detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.[d.loc.length - 1] || 'Field'}: ${d.msg}`).join(", "));
      else setError(e.message || "Failed to create movie");
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;
    try {
      await api.delete(`/movie/${movieId}`);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      alert(e.response?.data?.detail || "Failed to delete movie");
    }
  };

  const openEditModal = (movie: Record<string, unknown>) => {
    setEditingMovie(movie);
    setEditFile(null);
    setEditForm({
      title: (movie.title as string) || "",
      description: (movie.description as string) || "",
      duration_minutes: (movie.duration_minutes as number) || 120,
      price: (movie.price as number) || 15.00,
      genre_name: (movie.genre_name as string) || "Action",
      release_date: movie.release_date ? (movie.release_date as string).split("T")[0] : "",
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
      if (editForm.release_date) formData.append("release_date", editForm.release_date);
      if (editForm.genre_name) formData.append("genre_name", editForm.genre_name);
      if (editForm.thumbnail_url) formData.append("thumbnail_url", editForm.thumbnail_url);
      if (editFile) formData.append("thumbnail", editFile);
      await api.post(`/movie/${editingMovie.id}/update`, formData);
      setEditingMovie(null);
      setEditFile(null);
      fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") alert(detail);
      else if (Array.isArray(detail)) alert(detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.[d.loc.length - 1]}: ${d.msg}`).join(", "));
      else alert(e.message || "Failed to update movie");
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      const selectedMovie = movies.find(m => m.id === showtimeForm.movie_id);
      const duration = selectedMovie ? (selectedMovie.duration_minutes as number) : 120;
      const startTime = new Date(showtimeForm.start_time);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      await api.post("/showtime/", {
        movie_id: showtimeForm.movie_id,
        screen_id: showtimeForm.screen_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
      });
      setMessage("Showtime scheduled successfully!");
      setActiveTab("movies");
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
      const detail = e.response?.data?.detail;
      if (typeof detail === "string") setError(detail);
      else if (Array.isArray(detail)) setError(detail.map((d: { loc?: string[]; msg: string }) => `${d.loc?.[d.loc.length - 1] || 'Field'}: ${d.msg}`).join(", "));
      else setError(e.message || "Failed to create showtime");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;

  const genresList = ["Action", "Comedy", "Drama", "Sci-Fi", "Horror", "Thriller", "Romance", "Animation"];

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: "movies", label: `Movies (${movies.length})`, icon: <Film size={16} /> },
    { key: "add-movie", label: "Add Movie", icon: <Plus size={16} /> },
    { key: "add-showtime", label: "Showtime", icon: <Calendar size={16} /> },
    { key: "screens", label: `Screens (${screens.length})`, icon: <Monitor size={16} /> },
    { key: "seats", label: "Seats", icon: <Armchair size={16} /> },
    { key: "genres", label: `Genres (${genres.length})`, icon: <Tag size={16} /> },
    { key: "reports", label: "Reports", icon: <BarChart3 size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-3">
            <Shield className="text-primary" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Management Portal</h1>
              <p className="text-sm text-zinc-400">Manage movies, screens, seats, genres, showtimes & reports</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-1.5 ${activeTab === tab.key ? 'bg-primary text-white' : 'glass-panel text-zinc-400 hover:text-white'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {message && <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-xl mb-6 flex items-center gap-2"><CheckCircle size={20} /> {message}</div>}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl mb-6">{error}</div>}

        {activeTab === "movies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <div key={movie.id as string} className="glass-panel rounded-xl overflow-hidden border border-zinc-800 flex flex-col justify-between">
                <div className="relative h-48 bg-zinc-900 overflow-hidden">
                  {movie.thumbnail_url ? (
                    <Image src={movie.thumbnail_url as string} alt={movie.title as string} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-semibold">No Poster Image</div>
                  )}
                  <span className="absolute top-3 right-3 bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase shadow">
                    {(movie.genre_name as string) || 'Action'}
                  </span>
                  <span className="absolute bottom-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow flex items-center gap-1">
                    <DollarSign size={13} /> {movie.price ? (movie.price as number).toFixed(2) : "10.00"} / ticket
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xl text-white mb-2">{movie.title as string}</h3>
                    <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{(movie.description as string) || 'No description'}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-zinc-500 pt-4 border-t border-zinc-800/80">
                    <span>{movie.duration_minutes as number} mins</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(movie)} className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-1" title="Edit Movie">
                        <Pencil size={15} /> Edit
                      </button>
                      <button onClick={() => handleDeleteMovie(movie.id as string)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1" title="Delete Movie">
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "add-movie" && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><Film className="text-primary" /> Add New Movie & Ticket Price</h2>
            <form onSubmit={handleCreateMovie} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Movie Title</label>
                <input type="text" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required placeholder="e.g. Inception" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1.5"><Tag size={16} className="text-primary" /> Genre</label>
                  <select value={movieForm.genre_name} onChange={(e) => setMovieForm({ ...movieForm, genre_name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                    {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1.5"><DollarSign size={16} className="text-emerald-400" /> Ticket Price (USD)</label>
                  <input type="number" step="0.01" min="0" value={movieForm.price} onChange={(e) => setMovieForm({ ...movieForm, price: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} rows={3} placeholder="Movie plot and details..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1.5"><ImageIcon size={16} className="text-primary" /> Poster Image URL (Optional)</label>
                <input type="url" value={movieForm.thumbnail_url} onChange={(e) => setMovieForm({ ...movieForm, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Or Upload Image File</label>
                <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duration (Minutes)</label>
                  <input type="number" value={movieForm.duration_minutes} onChange={(e) => setMovieForm({ ...movieForm, duration_minutes: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Release Date</label>
                  <input type="date" value={movieForm.release_date} onChange={(e) => setMovieForm({ ...movieForm, release_date: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all mt-6 shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]">
                Create Movie & Set Price
              </button>
            </form>
          </div>
        )}

        {activeTab === "add-showtime" && (
          <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto border border-zinc-800">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2"><Calendar className="text-primary" /> Schedule New Showtime</h2>
            <form onSubmit={handleCreateShowtime} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Select Movie</label>
                <select value={showtimeForm.movie_id} onChange={(e) => setShowtimeForm({ ...showtimeForm, movie_id: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                  {movies.map(m => (
                    <option key={m.id as string} value={m.id as string}>
                      {m.title as string} (${m.price ? (m.price as number).toFixed(2) : "10.00"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Select Screen</label>
                <select value={showtimeForm.screen_id} onChange={(e) => setShowtimeForm({ ...showtimeForm, screen_id: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                  {screens.map(s => (
                    <option key={s.id as string} value={s.id as string}>
                      {s.name as string} ({s.capacity as number} seats)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Start Time</label>
                <input type="datetime-local" value={showtimeForm.start_time} onChange={(e) => setShowtimeForm({ ...showtimeForm, start_time: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all mt-6 shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]">
                Schedule Showtime
              </button>
            </form>
          </div>
        )}

        {activeTab === "screens" && <ScreensTab screens={screens} onRefresh={fetchData} />}
        {activeTab === "seats" && <SeatsTab screens={screens} onRefresh={fetchData} />}
        {activeTab === "genres" && <GenresTab genres={genres} onRefresh={fetchData} />}
        {activeTab === "reports" && <ReportsTab />}
      </div>

      {editingMovie && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-zinc-700 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Pencil className="text-primary" size={20} /> Edit Movie</h2>
              <button onClick={() => setEditingMovie(null)} className="text-zinc-400 hover:text-white transition-colors"><X size={22} /></button>
            </div>
            <form onSubmit={handleUpdateMovie} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Movie Title</label>
                <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Genre</label>
                  <select value={editForm.genre_name} onChange={(e) => setEditForm({ ...editForm, genre_name: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                    {genresList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1"><DollarSign size={14} className="text-emerald-400" /> Price (USD)</label>
                  <input type="number" step="0.01" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Description</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Poster URL</label>
                <input type="url" value={editForm.thumbnail_url} onChange={(e) => setEditForm({ ...editForm, thumbnail_url: e.target.value })} placeholder="https://..." className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Upload New Image</label>
                {(editForm.thumbnail_url || editFile) && (
                  <div className="mb-2 rounded-lg overflow-hidden h-24 w-24 bg-zinc-900 border border-zinc-700 relative">
                    <Image src={editFile ? URL.createObjectURL(editFile) : editForm.thumbnail_url} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files ? e.target.files[0] : null)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Duration (mins)</label>
                  <input type="number" value={editForm.duration_minutes} onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Release Date</label>
                  <input type="date" value={editForm.release_date} onChange={(e) => setEditForm({ ...editForm, release_date: e.target.value })} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingMovie(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                  <X size={16} /> Cancel
                </button>
                <button type="submit" disabled={editLoading} className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-zinc-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                  <Save size={16} /> {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
