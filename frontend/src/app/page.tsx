"use client";
import { motion } from "framer-motion";
import { Film, Calendar, Ticket, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />



      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-32 pb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm text-zinc-300 mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Now Showing in Premium IMAX
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500"
        >
          Experience Cinema <br /> Like Never Before
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10"
        >
          Reserve your favorite seats for the biggest blockbusters in just a few taps. Enjoy a seamless, premium booking experience.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/movies" className="px-8 py-4 rounded-full bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary-hover transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)]">
            <Ticket size={20} />
            Book Tickets Now
          </Link>
          <Link href="/showtimes" className="px-8 py-4 rounded-full glass-panel text-white font-semibold flex items-center justify-center gap-2 hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            <Calendar size={20} />
            View Showtimes
          </Link>
        </motion.div>
      </section>

      {/* Feature section */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: "Seamless Booking", desc: "Select your screen, pick your seats and complete payment instantly." },
          { title: "Premium Experience", desc: "Enjoy our high-end 4K screens and Dolby Atmos immersive sound." },
          { title: "Exclusive Access", desc: "Members get early access to premier shows and exclusive discounts." }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-panel p-8 rounded-2xl border border-zinc-800/50 hover:border-primary/30 transition-colors group cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
              {feature.title} <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
