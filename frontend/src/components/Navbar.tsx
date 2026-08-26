"use client";
import Link from "next/link";
import { Film, LogOut, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setIsLoggedIn(true);
      // Fetch role to determine if admin
      api.get("/user/me")
        .then(res => setIsAdmin(res.data.role === "admin"))
        .catch(() => {
          // Token expired or invalid
          setIsAdmin(false);
        });
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 px-8 py-4 flex justify-between items-center border-b border-zinc-800">
      <Link href="/" className="flex items-center gap-2 text-primary group">
        <Film size={28} className="group-hover:scale-110 transition-transform" />
        <span className="text-xl font-bold text-foreground tracking-tight">CineReserve</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link href="/movies" className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/movies' ? 'text-primary font-semibold' : 'text-zinc-400'}`}>
          Movies
        </Link>

        {isAdmin && (
          <Link href="/admin" className={`text-sm font-medium flex items-center gap-1.5 transition-colors hover:text-primary ${pathname === '/admin' ? 'text-primary font-semibold' : 'text-zinc-400'}`}>
            <Shield size={16} /> Admin Portal
          </Link>
        )}
        
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-all">
              Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full hover:bg-zinc-800 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-full hover:bg-primary-hover transition-colors shadow-[0_0_15px_-3px_rgba(225,29,72,0.4)]">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
