"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Save, ArrowLeft, LogOut } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: ""
  });
  
  const router = useRouter();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/user/me");
      setProfile(res.data);
      setFormData({
        name: res.data.name,
        email: res.data.email
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/login");
      } else {
        setError("Failed to load profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setError("");
    setSuccess("");
    setSaving(true);
    
    try {
      const res = await api.put(`/user/${profile.id}`, formData);
      setProfile(res.data);
      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="max-w-xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/movies" className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft size={20} /> Back to Movies
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors font-medium text-sm">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-800">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-zinc-400 text-sm capitalize">Role: {profile?.role}</p>
            </div>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-lg mb-6 text-sm">{error}</div>}
          {success && <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-100 p-3 rounded-lg mb-6 text-sm">{success}</div>}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <User size={16} className="text-primary" /> Full Name
              </label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2 flex items-center gap-2">
                <Mail size={16} className="text-primary" /> Email Address
              </label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving || (formData.name === profile?.name && formData.email === profile?.email)}
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-zinc-700 disabled:text-zinc-400 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(225,29,72,0.4)] disabled:shadow-none"
              >
                <Save size={18} /> {saving ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
