import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, User, Zap, Activity, ArrowLeft, Globe, 
  Filter, Trophy, Star, ChevronRight, Users
} from "lucide-react";
import { Player } from "@/src/types";

export default function Database() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [teamFilter, setTeamFilter] = useState<string>("All");
  const [styleFilter, setStyleFilter] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "All" || p.role === roleFilter;
      const matchesTeam = teamFilter === "All" || p.team === teamFilter;
      const matchesStyle = styleFilter === "All" || p.battingStyle === styleFilter;
      return matchesSearch && matchesRole && matchesTeam && matchesStyle;
    });
  }, [players, searchQuery, roleFilter, teamFilter, styleFilter]);

  const teams = useMemo(() => ["All", ...new Set(players.map(p => p.team))].sort(), [players]);
  const roles = ["All", "Batsman", "Bowler", "All-rounder", "Wicketkeeper"];
  const styles = ["All", "Right-handed", "Left-handed"];

  const featuredPlayers = useMemo(() => players.filter(p => p.isFeatured), [players]);

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <Badge className="bg-neon/10 text-neon border-neon/20 mb-4 px-3 py-1">
              Global Talent Hub
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">
              Performance <span className="text-neon">Database</span>
            </h1>
            <p className="text-gray-400 font-medium mt-4 max-w-xl">
              Explore detailed analytics and performance metrics for over {players.length} professional players across international and domestic leagues.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className="px-4 py-2 text-center border-r border-white/10">
              <div className="text-2xl font-black text-white">{players.length}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Players</div>
            </div>
            <div className="px-4 py-2 text-center">
              <div className="text-2xl font-black text-neon">{teams.length - 1}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Teams</div>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        {featuredPlayers.length > 0 && !searchQuery && roleFilter === "All" && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Featured Players</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPlayers.slice(0, 3).map(player => (
                <Card 
                  key={player.id}
                  className="glass border-white/10 overflow-hidden group cursor-pointer hover:border-neon/50 transition-all duration-500"
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  <CardContent className="p-0 flex h-48">
                    <div className="w-1/3 h-full overflow-hidden">
                      <img 
                        src={player.img} 
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="w-2/3 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <Badge className="bg-neon text-black text-[10px] font-black">{player.role}</Badge>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{player.team}</span>
                        </div>
                        <h3 className="text-xl font-black text-white mt-2 group-hover:text-neon transition-colors">{player.name}</h3>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-center">
                          <div className="text-lg font-black text-white">{player.stats.matches}</div>
                          <div className="text-[8px] text-gray-500 uppercase font-bold">Matches</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-neon">{player.stats.runs || player.stats.wickets}</div>
                          <div className="text-[8px] text-gray-500 uppercase font-bold">{player.stats.runs ? 'Runs' : 'Wickets'}</div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-neon group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Search & Filters */}
        <div className="glass p-6 rounded-3xl border-white/10 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by name or team..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-neon/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {roles.map(r => <option key={r} value={r} className="bg-black">{r} (Role)</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Globe className="h-4 w-4 text-gray-500" />
                <select 
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer max-w-[150px]"
                >
                  {teams.map(t => <option key={t} value={t} className="bg-black">{t}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Activity className="h-4 w-4 text-gray-500" />
                <select 
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  {styles.map(s => <option key={s} value={s} className="bg-black">{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPlayers.map((player) => (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="glass border-white/10 overflow-hidden group cursor-pointer hover:border-neon/30 transition-all duration-300"
                  onClick={() => navigate(`/player/${player.id}`)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img 
                      src={player.img} 
                      alt={player.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-neon text-black text-[8px] font-black mb-1 uppercase tracking-widest">{player.role}</Badge>
                      <h3 className="text-lg font-black text-white leading-tight group-hover:text-neon transition-colors">{player.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{player.team}</p>
                    </div>
                  </div>
                  <CardContent className="p-4 bg-white/5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 rounded-xl bg-black/20 border border-white/5">
                        <div className="text-sm font-black text-white">{player.stats.matches}</div>
                        <div className="text-[8px] text-gray-500 uppercase font-bold">Matches</div>
                      </div>
                      <div className="text-center p-2 rounded-xl bg-black/20 border border-white/5">
                        <div className="text-sm font-black text-neon">{player.stats.runs || player.stats.wickets}</div>
                        <div className="text-[8px] text-gray-500 uppercase font-bold">{player.stats.runs ? 'Runs' : 'Wickets'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl border-white/10">
            <Users className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">No players found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
            <Button 
              variant="link" 
              className="text-neon mt-4"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("All");
                setTeamFilter("All");
                setStyleFilter("All");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
