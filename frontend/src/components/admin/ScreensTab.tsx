"use client";
import { useState } from "react";
import api from "@/lib/api";
import { Monitor, Plus, Pencil, Trash2, X, Save } from "lucide-react";

export default function ScreensTab({ screens, onRefresh }: { screens: any[]; onRefresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: 50 });
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", capacity: 50 });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/screen/", { name: form.name, capacity: Number(form.capacity) });
      setForm({ name: "", capacity: 50 });
      setShowForm(false);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create screen");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/screen/${editing.id}`, { name: editForm.name, capacity: Number(editForm.capacity) });
      setEditing(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update screen");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this screen and all its seats/showtimes?")) return;
    try {
      await api.delete(`/screen/${id}`);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete screen");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Monitor className="text-primary" /> Screens ({screens.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all">
          <Plus size={16} /> Add Screen
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Screen Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Screen 1" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Capacity</label>
              <input type="number" min={1} value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium">Create Screen</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {screens.map(screen => (
          <div key={screen.id} className="glass-panel border border-zinc-800 rounded-xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-white">{screen.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{screen.capacity} seats capacity</p>
                <p className="text-xs text-zinc-600 mt-2 font-mono">{screen.id.slice(0, 8)}...</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(screen); setEditForm({ name: screen.name, capacity: screen.capacity }); }} className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(screen.id)} className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-zinc-700 rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><Pencil className="text-primary" size={20} /> Edit Screen</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white"><X size={22} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Screen Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Capacity</label>
                <input type="number" min={1} value={editForm.capacity} onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"><X size={16} /> Cancel</button>
                <button type="submit" className="flex-1 bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"><Save size={16} /> Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
