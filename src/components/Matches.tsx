import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, Trophy, Calendar, Zap, 
  ArrowLeft, Star, Swords, MapPin, 
  Filter, Activity, ChevronRight 
} from "lucide-react";
import { Match, Tournament, Team } from "@/src/types";
import { useNavigate } from "react-router-dom";

export default function Matches() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tournamentFilter, setTournamentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, tRes, teamsRes] = await Promise.all([
          fetch('/api/matches'),
          fetch('/api/tournaments'),
          fetch('/api/teams')
        ]);
        
        const mData = await mRes.json();
        const tData = await tRes.json();
        const teamsData = await teamsRes.json();

        setMatches(mData);
        setTournaments(tData);
        setTeams(teamsData);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const teamA = teams.find(t => t.id === m.teamA);
      const teamB = teams.find(t => t.id === m.teamB);
      const tournament = tournaments.find(t => t.id === m.tournamentId);
      
      const searchStr = `${teamA?.name} ${teamB?.name} ${tournament?.name} ${m.venue}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
      const matchesTournament = tournamentFilter === "All" || m.tournamentId === tournamentFilter;
      const matchesStatus = statusFilter === "All" || m.status === statusFilter;
      
      return matchesSearch && matchesTournament && matchesStatus;
    });
  }, [matches, teams, tournaments, searchQuery, tournamentFilter, statusFilter]);

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
              Live Fixtures
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">
              Match <span className="text-neon">Center</span>
            </h1>
            <p className="text-gray-400 font-medium mt-4 max-w-xl">
              Track live scores, upcoming fixtures, and historical results across all major cricket leagues.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
            <div className="px-4 py-2 text-center border-r border-white/10">
              <div className="text-2xl font-black text-neon">
                {matches.filter(m => m.status === 'Live').length}
              </div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Live</div>
            </div>
            <div className="px-4 py-2 text-center">
              <div className="text-2xl font-black text-white">
                {matches.filter(m => m.status === 'Upcoming').length}
              </div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass p-6 rounded-3xl border-white/10 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by team, tournament or venue..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-neon/50 transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Filter className="h-4 w-4 text-gray-500" />
                <select 
                  value={tournamentFilter}
                  onChange={(e) => setTournamentFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer max-w-[150px]"
                >
                  <option value="All" className="bg-black">All Tournaments</option>
                  {tournaments.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Activity className="h-4 w-4 text-gray-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-black">All Status</option>
                  <option value="Live" className="bg-black">Live</option>
                  <option value="Upcoming" className="bg-black">Upcoming</option>
                  <option value="Completed" className="bg-black">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredMatches.map((match) => {
              const teamA = teams.find(t => t.id === match.teamA);
              const teamB = teams.find(t => t.id === match.teamB);
              const tournament = tournaments.find(t => t.id === match.tournamentId);
              
              return (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="glass border-white/10 hover:border-neon/30 transition-all group overflow-hidden">
                    <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-3 w-3 text-neon" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{tournament?.name}</span>
                      </div>
                      <Badge className={`
                        ${match.status === 'Live' ? 'bg-red-500 animate-pulse' : 
                          match.status === 'Upcoming' ? 'bg-blue-500' : 'bg-gray-500'} 
                        text-white text-[8px] font-black uppercase tracking-widest
                      `}>
                        {match.status}
                      </Badge>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                          <img src={teamA?.logo} className="h-16 w-16 mx-auto mb-3 rounded-full border-2 border-white/10 group-hover:border-neon/50 transition-colors" alt="" referrerPolicy="no-referrer" />
                          <h3 className="text-lg font-black text-white uppercase tracking-tighter">{teamA?.name}</h3>
                          <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{teamA?.shortName}</div>
                        </div>
                        
                        <div className="flex flex-col items-center gap-2">
                          {match.status === 'Completed' ? (
                            <div className="text-center">
                              <div className="text-2xl font-black text-white mb-1">
                                {match.scoreA?.runs}/{match.scoreA?.wickets}
                              </div>
                              <div className="text-xs font-bold text-gray-500 italic">vs</div>
                              <div className="text-2xl font-black text-white mt-1">
                                {match.scoreB?.runs}/{match.scoreB?.wickets}
                              </div>
                            </div>
                          ) : match.status === 'Live' ? (
                            <div className="text-center">
                              <div className="text-3xl font-black text-neon mb-1">
                                {match.scoreA?.runs}/{match.scoreA?.wickets}
                              </div>
                              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {match.scoreA?.overs} Overs
                              </div>
                              <div className="text-xs font-black text-gray-700 my-2">VS</div>
                              <div className="text-sm font-bold text-gray-500">Yet to Bat</div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-4xl font-black text-gray-800 italic mb-2">VS</div>
                              <div className="text-[10px] font-black text-neon uppercase tracking-[0.2em]">
                                {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 text-center">
                          <img src={teamB?.logo} className="h-16 w-16 mx-auto mb-3 rounded-full border-2 border-white/10 group-hover:border-neon/50 transition-colors" alt="" referrerPolicy="no-referrer" />
                          <h3 className="text-lg font-black text-white uppercase tracking-tighter">{teamB?.name}</h3>
                          <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{teamB?.shortName}</div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                          <MapPin className="h-3.5 w-3.5 mr-2 text-neon" />
                          {match.venue}
                        </div>
                        {match.status === 'Completed' && (
                          <div className="text-[10px] font-black text-neon uppercase tracking-widest bg-neon/10 px-3 py-1 rounded-full border border-neon/20">
                            {match.result}
                          </div>
                        )}
                        <Button 
                          onClick={() => navigate('/dashboard')}
                          className="bg-white/5 hover:bg-neon hover:text-black text-white border border-white/10 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                        >
                          View Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl border-white/10">
            <Activity className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">No matches found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
}
