"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Armchair, Plus, Pencil, Trash2, X, Save } from "lucide-react";

export default function SeatsTab({ screens, onRefresh }: { screens: any[]; onRefresh: () => void }) {
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedScreen, setSelectedScreen] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ screen_id: "", row_number: "A", seat_number: 1 });
  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ row_number: "", seat_number: 1 });

  const fetchSeats = async (screenId?: string) => {
    try {
      if (screenId) {
        const res = await api.get(`/seat/screen/${screenId}`);
        setSeats(res.data || []);
      } else {
        const res = await api.get("/seat/");
        setSeats(res.data || []);
      }
    } catch { setSeats([]); }
  };

  useEffect(() => {
    if (selectedScreen) fetchSeats(selectedScreen);
    else fetchSeats();
  }, [selectedScreen]);

  useEffect(() => {
    if (screens.length > 0 && !form.screen_id) {
      setForm(f => ({ ...f, screen_id: screens[0].id }));
    }
  }, [screens]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/seat/", { screen_id: form.screen_id, row_number: form.row_number, seat_number: Number(form.seat_number) });
      setForm(f => ({ ...f, row_number: "A", seat_number: 1 }));
      setShowForm(false);
      fetchSeats(selectedScreen || undefined);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to create seat");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/seat/${editing.id}`, { row_number: editForm.row_number, seat_number: Number(editForm.seat_number) });
      setEditing(null);
      fetchSeats(selectedScreen || undefined);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update seat");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this seat?")) return;
    try {
      await api.delete(`/seat/${id}`);
      fetchSeats(selectedScreen || undefined);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete seat");
    }
  };

  const screenName = (id: string) => screens.find(s => s.id === id)?.name || id.slice(0, 8);

  // Group seats by row
  const groupedByRow: Record<string, any[]> = {};
  seats.forEach(s => {
    if (!groupedByRow[s.row_number]) groupedByRow[s.row_number] = [];
    groupedByRow[s.row_number].push(s);
  });
  Object.values(groupedByRow).forEach(arr => arr.sort((a: any, b: any) => a.seat_number - b.seat_number));

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Armchair className="text-primary" /> Seats ({seats.length})</h2>
        <div className="flex gap-3 items-center">
          <select value={selectedScreen} onChange={e => setSelectedScreen(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
            <option value="">All Screens</option>
            {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16} /> Add Seat</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="glass-panel border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Screen</label>
              <select value={form.screen_id} onChange={e => setForm({ ...form, screen_id: e.target.value })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary">
                {screens.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Row</label>
              <input type="text" value={form.row_number} onChange={e => setForm({ ...form, row_number: e.target.value.toUpperCase() })} required maxLength={5} placeholder="A" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Seat #</label>
              <input type="number" min={1} value={form.seat_number} onChange={e => setForm({ ...form, seat_number: Number(e.target.value) })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium">Create Seat</button>
          </div>
        </form>
      )}

      {Object.keys(groupedByRow).length === 0 ? (
        <div className="glass-panel border border-zinc-800 rounded-xl p-8 text-center text-zinc-500">No seats found. {screens.length === 0 && "Create a screen first."}</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByRow).sort(([a], [b]) => a.localeCompare(b)).map(([row, rowSeats]) => (
            <div key={row} className="glass-panel border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary/20 text-primary font-bold px-3 py-1 rounded-lg text-sm">Row {row}</span>
                <span className="text-xs text-zinc-500">{rowSeats.length} seats · {screenName(rowSeats[0]?.screen_id)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {rowSeats.map((seat: any) => (
                  <div key={seat.id} className="group relative bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white hover:border-primary transition-colors">
                    <span className="font-medium">{seat.row_number}{seat.seat_number}</span>
                    <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-0.5">
                      <button onClick={() => { setEditing(seat); setEditForm({ row_number: seat.row_number, seat_number: seat.seat_number }); }} className="bg-blue-600 rounded-full p-0.5"><Pencil size={10} className="text-white" /></button>
                      <button onClick={() => handleDelete(seat.id)} className="bg-red-600 rounded-full p-0.5"><Trash2 size={10} className="text-white" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-zinc-700 rounded-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Edit Seat</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white"><X size={22} /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Row</label>
                <input type="text" value={editForm.row_number} onChange={e => setEditForm({ ...editForm, row_number: e.target.value.toUpperCase() })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Seat #</label>
                <input type="number" min={1} value={editForm.seat_number} onChange={e => setEditForm({ ...editForm, seat_number: Number(e.target.value) })} required className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary" />
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
