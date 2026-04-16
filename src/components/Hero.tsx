import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Upload, ChevronRight, Camera, Globe, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const QUICK_COUNTRIES = [
  { name: "India", flag: "🇮🇳", players: 15 },
  { name: "Australia", flag: "🇦🇺", players: 14 },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", players: 12 },
  { name: "Pakistan", flag: "🇵🇰", players: 13 },
  { name: "South Africa", flag: "🇿🇦", players: 11 },
  { name: "New Zealand", flag: "🇳🇿", players: 10 },
  { name: "Afghanistan", flag: "🇦🇫", players: 8 },
  { name: "Nepal", flag: "🇳🇵", players: 5 },
  { name: "USA", flag: "🇺🇸", players: 4 },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            <Badge className="bg-neon/10 text-neon border-neon/30 px-4 py-1.5 rounded-full mb-6 font-black tracking-widest uppercase text-xs">
              Next-Gen Cricket Intelligence
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
              Cric<span className="text-neon">Tech</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-12 font-medium leading-relaxed">
              Transform match footage into actionable insights. Advanced AI video analysis synchronized with interactive 3D match reconstruction.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6 mb-20">
              <Button 
                size="lg" 
                className="bg-neon text-black hover:bg-neon/90 font-bold px-12 py-8 text-2xl rounded-full group shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate('/upload')}
              >
                <Upload className="mr-3 h-7 w-7 group-hover:-translate-y-1 transition-transform" />
                Upload Video
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white/20 text-white hover:bg-white hover:text-black font-black px-12 py-8 text-2xl rounded-full group transition-all hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate('/dashboard?mode=live')}
              >
                <Camera className="mr-3 h-7 w-7 group-hover:scale-110 transition-transform" />
                Live Tracking
              </Button>
            </div>

            {/* Hero Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 w-full">
              {/* Player Details Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-3xl overflow-hidden glass border-black/5 group cursor-pointer shadow-2xl"
                onClick={() => navigate('/database?tab=allrounders')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1593766788306-28561086694e?auto=format&fit=crop&q=80&w=800" 
                  alt="Player Details"
                  className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon mb-2">Comprehensive Roster</span>
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-neon transition-colors">Player Details</h3>
                  <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    Explore deep performance metrics for batsmen, bowlers, and all-rounders.
                  </p>
                </div>
              </motion.div>

              {/* Matches & Leagues Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-3xl overflow-hidden glass border-black/5 group cursor-pointer shadow-2xl"
                onClick={() => navigate('/tournaments')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800" 
                  alt="Matches & Leagues"
                  className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-left">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-neon mb-2">Global Tournaments</span>
                  <h3 className="text-2xl font-black text-white mb-1 group-hover:text-neon transition-colors">Matches & Leagues</h3>
                  <p className="text-sm text-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    Track upcoming fixtures, historical results, and league standings.
                  </p>
                </div>
              </motion.div>

              {/* Countries List */}
              <div className="lg:h-[400px]">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 h-full text-left overflow-y-auto custom-scrollbar backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-neon" />
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">Top Nations</h3>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-neon font-bold text-[10px] uppercase tracking-widest"
                      onClick={() => navigate('/database')}
                    >
                      View All
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {QUICK_COUNTRIES.map((country, i) => (
                      <motion.div
                        key={country.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (i * 0.1) }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-neon/50 hover:bg-white/10 transition-all cursor-pointer group"
                        onClick={() => navigate(`/country/${country.name}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl group-hover:scale-110 transition-transform">{country.flag}</span>
                          <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-neon transition-colors">{country.name}</h4>
                            <div className="flex items-center text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                              <Users className="h-2.5 w-2.5 mr-1 text-neon" />
                              {country.players} Players
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mt-4">AI-Powered Performance Intelligence</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
