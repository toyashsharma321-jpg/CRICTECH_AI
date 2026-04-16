import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowLeft, Activity, Trophy, Zap, Star, 
  TrendingUp, Shield, Target, Award, Calendar, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Player } from "@/src/types";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/players/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlayer(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [id]);

  // Mock performance data for the chart
  const performanceData = [
    { match: 'M1', score: 45, strikeRate: 120 },
    { match: 'M2', score: 12, strikeRate: 80 },
    { match: 'M3', score: 88, strikeRate: 145 },
    { match: 'M4', score: 34, strikeRate: 110 },
    { match: 'M5', score: 56, strikeRate: 130 },
    { match: 'M6', score: 102, strikeRate: 160 },
    { match: 'M7', score: 23, strikeRate: 95 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Activity className="h-12 w-12 text-neon animate-pulse" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black text-white uppercase">Player not found</h2>
        <Button onClick={() => navigate('/database')} className="mt-4 bg-neon text-black font-black">
          Back to Database
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="text-gray-400 hover:text-neon mb-8 group"
        onClick={() => navigate('/database')}
      >
        <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Database
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="glass border-white/10 overflow-hidden">
            <div className="aspect-square relative">
              <img 
                src={player.img} 
                alt={player.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <Badge className="bg-neon text-black font-black mb-2">{player.role}</Badge>
                <h1 className="text-4xl font-black text-white leading-none uppercase tracking-tighter">{player.name}</h1>
                <p className="text-neon font-bold mt-2 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  {player.team}
                </p>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Batting</div>
                  <div className="text-sm font-black text-white">{player.battingStyle}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Bowling</div>
                  <div className="text-sm font-black text-white">{player.bowlingStyle || 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Career Highlights
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-400">Total Matches</span>
                    <span className="text-sm font-black text-white">{player.stats.matches}</span>
                  </div>
                  {player.stats.runs !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-sm text-gray-400">Total Runs</span>
                      <span className="text-sm font-black text-neon">{player.stats.runs}</span>
                    </div>
                  )}
                  {player.stats.wickets !== undefined && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-sm text-gray-400">Total Wickets</span>
                      <span className="text-sm font-black text-neon">{player.stats.wickets}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-sm text-gray-400">Average</span>
                    <span className="text-sm font-black text-white">{player.stats.avg}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 p-6">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Technical Analysis
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span className="text-gray-400">Consistency</span>
                  <span className="text-neon">85%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span className="text-gray-400">Power Rating</span>
                  <span className="text-neon">92%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                  <span className="text-gray-400">Fielding Impact</span>
                  <span className="text-neon">78%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-neon w-[78%]" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Analytics & Charts */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass border-white/10 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Performance Trend</h2>
                <p className="text-gray-500 text-sm font-medium">Recent match scoring and strike rate analysis</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="border-neon/30 text-neon">Last 7 Matches</Badge>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ccff00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="match" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                    itemStyle={{ color: '#ccff00' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ccff00" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass border-white/10 p-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Scoring Zones
              </h3>
              <div className="aspect-square relative flex items-center justify-center">
                {/* Simple visual representation of a cricket field scoring zones */}
                <div className="w-full h-full rounded-full border-2 border-white/10 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-12 bg-neon/20 rounded-sm" />
                  </div>
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-neon">STRAIGHT (15%)</div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-neon">BEHIND (10%)</div>
                  <div className="absolute top-1/2 left-4 -translate-y-1/2 text-[10px] font-black text-neon">OFF-SIDE (45%)</div>
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[10px] font-black text-neon">ON-SIDE (30%)</div>
                </div>
              </div>
            </Card>

            <Card className="glass border-white/10 p-6">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Key Insights
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-neon font-black">Powerplay Dominance:</span> Shows exceptional strike rate of 155.4 in the first 6 overs.
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-neon font-black">Spin Specialist:</span> Averages 54.2 against leg-spinners with minimal dot ball percentage.
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-neon font-black">Clutch Performer:</span> 40% of career runs scored in high-pressure run chases.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
