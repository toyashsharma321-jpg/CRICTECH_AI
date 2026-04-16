import { motion } from "motion/react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar, ArrowRight, Star } from "lucide-react";

const FEATURED_MATCHES = [
  { 
    name: "ICC Men's World Cup", 
    type: "ODI", 
    status: "Recurring", 
    teams: 10, 
    img: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800",
    description: "The pinnacle of one-day cricket, where nations battle for the ultimate glory.",
    teamsList: ["India", "Australia", "England", "New Zealand", "Pakistan", "South Africa", "Afghanistan", "Bangladesh", "Sri Lanka", "Netherlands"]
  },
  { 
    name: "Indian Premier League", 
    type: "T20", 
    status: "Ongoing", 
    teams: 10, 
    img: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800",
    description: "The world's premier T20 league featuring global superstars and high-octane action.",
    teamsList: ["MI", "CSK", "RCB", "KKR", "GT", "LSG", "RR", "DC", "PBKS", "SRH"]
  },
  { 
    name: "The Ashes", 
    type: "Test", 
    status: "Historical", 
    teams: 2, 
    img: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?auto=format&fit=crop&q=80&w=800",
    description: "Cricket's oldest and most celebrated rivalry between England and Australia.",
    teamsList: ["England", "Australia"]
  }
];

export default function MatchesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-4 text-gray-900">
              Elite <span className="bg-neon px-2">Leagues</span> & Tournaments
            </h2>
            <p className="text-gray-500 max-w-2xl font-medium">
              From the historic Test battles to the high-energy T20 leagues, 
              track the schedules, results, and historical data of cricket's biggest stages.
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="text-black hover:bg-neon font-bold uppercase tracking-widest"
            onClick={() => navigate('/matches')}
          >
            Explore All Events <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURED_MATCHES.map((match, i) => (
            <motion.div
              key={match.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="glass border-black/5 overflow-hidden group cursor-pointer card-hover flex flex-col h-full"
                onClick={() => navigate('/matches')}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={match.img} 
                    alt={match.name} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-neon text-black font-bold uppercase text-[10px] tracking-widest">
                      {match.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-gray-500 font-bold uppercase flex items-center tracking-widest">
                      <Calendar className="mr-1.5 h-3.5 w-3.5 text-black" /> {match.status}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-black fill-neon" />
                      <span className="text-[10px] text-gray-900 font-bold">{match.teams} Teams</span>
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-black mb-3 group-hover:text-black transition-colors text-gray-900 uppercase tracking-tight">
                    {match.name}
                  </CardTitle>
                  
                  <p className="text-sm text-gray-600 font-medium leading-relaxed mb-6">
                    {match.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {match.teamsList.map((team) => (
                      <Badge key={team} variant="outline" className="text-[9px] border-black/5 text-gray-500 font-bold uppercase tracking-tighter px-2 py-0">
                        {team}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-black/5 flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Analytics Available</span>
                    <Trophy className="h-5 w-5 text-black/20 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
