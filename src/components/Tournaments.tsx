import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, ChevronRight, Activity } from "lucide-react";
import type { Tournament } from "../types";

export default function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'All' | 'ICC' | 'League'>('All');

  useEffect(() => {
    fetch('/api/tournaments')
      .then(res => res.json())
      .then(data => {
        setTournaments(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredTournaments = tournaments.filter(t => 
    activeTab === 'All' ? true : t.type === activeTab
  );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Activity className="h-12 w-12 text-neon animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <Badge className="bg-neon/10 text-neon border-neon/20 mb-4 px-3 py-1">
              Global Ecosystem
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">
              Cricket <span className="text-neon">Tournaments</span>
            </h1>
            <p className="text-gray-400 font-medium mt-4 max-w-xl">
              Explore major international tournaments and franchise leagues from around the world.
            </p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
            {(['All', 'ICC', 'League'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-neon text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'ICC' ? 'World Cups' : tab === 'League' ? 'Leagues' : 'All Events'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/tournament/${tournament.id}`)}
            >
              <Card className="glass border-white/10 overflow-hidden group cursor-pointer hover:border-neon/50 transition-all duration-500">
                <div className="h-48 relative">
                  <img 
                    src={tournament.logo} 
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <Badge className={`
                      ${tournament.status === 'Ongoing' ? 'bg-red-500' : 
                        tournament.status === 'Upcoming' ? 'bg-blue-500' : 'bg-gray-500'} 
                      text-white text-[10px] font-black uppercase tracking-widest
                    `}>
                      {tournament.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-neon transition-colors">{tournament.name}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <Calendar className="h-3 w-3 mr-1 text-neon" />
                          {tournament.year}
                        </div>
                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <Trophy className="h-3 w-3 mr-1 text-neon" />
                          {tournament.format}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-xs font-bold text-gray-300">{tournament.teams.length} Teams</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-neon group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
