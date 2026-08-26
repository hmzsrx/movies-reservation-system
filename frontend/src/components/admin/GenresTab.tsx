"use client";
import { useState } from "react";
import api from "@/lib/api";
import { Tag, Plus, Pencil, Trash2, X, Save } from "lucide-react";

export default function GenresTab({ genres, onRefresh }: { genres: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/generic/", { name: form.name });
      setForm({ name: "" });
      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create genre");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/generic/${editing.id}`, { name: editForm.name });
      setEditing(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update genre");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this genre? Movies using it may be affected.")) return;
    try {
      await api.delete(`/generic/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete genre");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Tag className="text-primary" /> Genres ({genres.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Genre</button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-zinc-400 mb-1">Genre Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} required placeholder="e.g. Sci-Fi" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-3 bg-zinc-800 text-white rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium">Create</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {genres.map(genre => (
          <div key={genre.id} className="glass-panel border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <h3 className="text-white font-semibold">{genre.name}</h3>
              <p className="text-xs text-zinc-600 font-mono mt-1">{genre.id.slice(0, 8)}...</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(genre); setEditForm({ name: genre.name }); }} className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors"><Pencil size={15} /></button>
              <button onClick={() => handleDelete(genre.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-zinc-700 rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Genre</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white"><X size={22} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Genre Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ name: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-zinc-800 text-white py-3 rounded-lg flex items-center justify-center gap-2"><X size={16} /> Cancel</button>
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white py-3 rounded-lg flex items-center justify-center gap-2"><Save size={16} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
