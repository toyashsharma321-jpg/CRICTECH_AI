import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Trophy, Users, Activity, 
  Star, ChevronRight, Shield, Target, Award
} from "lucide-react";
import type { Team, Player } from "../types"; 

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [squad, setSquad] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamRes, playersRes] = await Promise.all([
          fetch(`/api/teams/${id}`),
          fetch('/api/players')
        ]);
        
        const teamData = await teamRes.json();
        const playersData = await playersRes.json();

        setTeam(teamData);
        // In a real app, we'd filter by team.squad IDs, 
        // but for this demo we'll filter by player.team name matching team.name or shortName
        setSquad(playersData.filter((p: Player) => 
          p.team.toLowerCase().includes(teamData.name.toLowerCase()) || 
          p.team.toLowerCase().includes(teamData.shortName.toLowerCase())
        ));
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

  if (!team) return null;

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
        {/* Team Header */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass border-white/10 overflow-hidden">
            <div className="p-8 text-center bg-gradient-to-b from-white/5 to-transparent">
              <img 
                src={team.logo} 
                alt={team.name}
                className="w-32 h-32 mx-auto rounded-full border-4 border-white/10 shadow-2xl mb-6"
                referrerPolicy="no-referrer"
              />
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">{team.name}</h1>
              <Badge className="bg-neon text-black font-black uppercase tracking-widest">{team.shortName}</Badge>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xl font-black text-white">{team.stats.played}</div>
                  <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Played</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xl font-black text-neon">{team.stats.won}</div>
                  <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Won</div>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-xl font-black text-red-500">{team.stats.lost}</div>
                  <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Lost</div>
                </div>
              </div>

              {team.stats.titles !== undefined && (
                <div className="flex items-center justify-between p-4 bg-neon/10 rounded-2xl border border-neon/20">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-neon" />
                    <span className="text-sm font-black text-white uppercase tracking-tight">Championships</span>
                  </div>
                  <span className="text-2xl font-black text-neon">{team.stats.titles}</span>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Team Identity
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Home Ground</span>
                    <span className="text-white font-bold">Wankhede Stadium</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Captain</span>
                    <span className="text-white font-bold">Hardik Pandya</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Head Coach</span>
                    <span className="text-white font-bold">Mark Boucher</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Squad List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Users className="h-6 w-6 text-neon" />
              Team Squad <span className="text-gray-600">({squad.length})</span>
            </h2>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-white/10 text-gray-400">All</Badge>
              <Badge variant="outline" className="border-white/10 text-gray-400">Batsmen</Badge>
              <Badge variant="outline" className="border-white/10 text-gray-400">Bowlers</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {squad.map((player) => (
              <motion.div
                key={player.id}
                whileHover={{ x: 5 }}
                onClick={() => navigate(`/player/${player.id}`)}
              >
                <Card className="glass border-white/10 hover:border-neon/30 transition-all cursor-pointer group overflow-hidden">
                  <CardContent className="p-0 flex items-center h-24">
                    <div className="w-24 h-full overflow-hidden">
                      <img 
                        src={player.img} 
                        alt={player.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-white group-hover:text-neon transition-colors">{player.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-white/5 text-[8px] text-gray-400 font-black uppercase tracking-widest border-white/5">{player.role}</Badge>
                          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{player.battingStyle.split('-')[0]}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-700 group-hover:text-neon transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {squad.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl border-white/10">
              <Users className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest">Squad data being updated...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
