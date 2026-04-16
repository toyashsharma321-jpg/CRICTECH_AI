import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Trophy, Calendar, Users, 
  Activity, Star, ChevronRight, MapPin 
} from "lucide-react";
import type { Tournament, Team, Match } from "../types";

export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, teamsRes, matchesRes] = await Promise.all([
          fetch(`/api/tournaments/${id}`),
          fetch('/api/teams'),
          fetch('/api/matches')
        ]);
        
        const tData = await tRes.json();
        const teamsData = await teamsRes.json();
        const matchesData = await matchesRes.json();

        setTournament(tData);
        setTeams(teamsData.filter((team: Team) => tData.teams.includes(team.id)));
        setMatches(matchesData.filter((match: Match) => match.tournamentId === id));
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Activity className="h-12 w-12 text-neon animate-pulse" />
      </div>
    );
  }

  if (!tournament) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="text-gray-400 hover:text-neon mb-8 group"
        onClick={() => navigate('/tournaments')}
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Tournaments
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tournament Header & Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-64 rounded-3xl overflow-hidden border border-white/10">
            <img 
              src={tournament.logo} 
              alt={tournament.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
              <Badge className="bg-neon text-black font-black mb-2 w-fit">{tournament.status}</Badge>
              <h1 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{tournament.name}</h1>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center text-sm font-bold text-gray-300 uppercase tracking-widest">
                  <Calendar className="h-4 w-4 mr-2 text-neon" />
                  {tournament.year}
                </div>
                <div className="flex items-center text-sm font-bold text-gray-300 uppercase tracking-widest">
                  <Trophy className="h-4 w-4 mr-2 text-neon" />
                  {tournament.format}
                </div>
              </div>
            </div>
          </div>

          {/* Points Table */}
          {tournament.pointsTable && (
            <Card className="glass border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Points Table</h2>
                <Badge variant="outline" className="border-neon/30 text-neon">Season {tournament.year}</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                      <th className="p-4">Team</th>
                      <th className="p-4 text-center">P</th>
                      <th className="p-4 text-center">W</th>
                      <th className="p-4 text-center">L</th>
                      <th className="p-4 text-center">NRR</th>
                      <th className="p-4 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tournament.pointsTable.map((row) => {
                      const team = teams.find(t => t.id === row.teamId);
                      return (
                        <tr key={row.teamId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img src={team?.logo} className="h-6 w-6 rounded-full" alt="" referrerPolicy="no-referrer" />
                              <span className="font-bold text-white">{team?.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono text-gray-300">{row.played}</td>
                          <td className="p-4 text-center font-mono text-green-400">{row.won}</td>
                          <td className="p-4 text-center font-mono text-red-400">{row.lost}</td>
                          <td className="p-4 text-center font-mono text-gray-300">{row.nrr > 0 ? '+' : ''}{row.nrr}</td>
                          <td className="p-4 text-center font-black text-neon">{row.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Recent Matches */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-neon" />
              Tournament Matches
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {matches.map((match) => {
                const teamA = teams.find(t => t.id === match.teamA);
                const teamB = teams.find(t => t.id === match.teamB);
                return (
                  <Card key={match.id} className="glass border-white/10 hover:border-neon/30 transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-8 flex-1 justify-center md:justify-start">
                          <div className="text-center">
                            <img src={teamA?.logo} className="h-12 w-12 mx-auto mb-2 rounded-full border border-white/10" alt="" referrerPolicy="no-referrer" />
                            <div className="text-xs font-black text-white uppercase">{teamA?.shortName}</div>
                          </div>
                          <div className="text-2xl font-black text-gray-700 italic">VS</div>
                          <div className="text-center">
                            <img src={teamB?.logo} className="h-12 w-12 mx-auto mb-2 rounded-full border border-white/10" alt="" referrerPolicy="no-referrer" />
                            <div className="text-xs font-black text-white uppercase">{teamB?.shortName}</div>
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center">
                          {match.status === 'Completed' ? (
                            <div className="space-y-1">
                              <div className="text-lg font-black text-white">
                                {match.scoreA?.runs}/{match.scoreA?.wickets} - {match.scoreB?.runs}/{match.scoreB?.wickets}
                              </div>
                              <div className="text-[10px] text-neon font-bold uppercase tracking-widest">{match.result}</div>
                            </div>
                          ) : match.status === 'Live' ? (
                            <div className="space-y-1">
                              <Badge className="bg-red-500 animate-pulse mb-2">LIVE</Badge>
                              <div className="text-lg font-black text-white">
                                {match.scoreA?.runs}/{match.scoreA?.wickets} ({match.scoreA?.overs})
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                              {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-center md:items-end gap-2">
                          <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                            <MapPin className="h-3 w-3 mr-1" />
                            {match.venue.split(',')[0]}
                          </div>
                          <Button size="sm" variant="outline" className="border-white/10 text-white group-hover:bg-neon group-hover:text-black transition-all">
                            Analysis
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Participating Teams */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass border-white/10 p-6 rounded-3xl">
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-neon" />
              Participating Teams
            </h2>
            <div className="space-y-3">
              {teams.map((team) => (
                <div 
                  key={team.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-neon/30 transition-all cursor-pointer group"
                  onClick={() => navigate(`/team/${team.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <img src={team.logo} className="h-8 w-8 rounded-full" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-black text-white group-hover:text-neon transition-colors">{team.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{team.shortName}</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-all" />
                </div>
              ))}
            </div>
          </div>

          <Card className="glass border-white/10 p-6">
            <h2 className="text-lg font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Tournament Stats
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 font-bold uppercase">Highest Score</span>
                <span className="text-sm font-black text-white">263/5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 font-bold uppercase">Most Runs</span>
                <span className="text-sm font-black text-neon">741</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-gray-400 font-bold uppercase">Most Wickets</span>
                <span className="text-sm font-black text-neon">24</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
