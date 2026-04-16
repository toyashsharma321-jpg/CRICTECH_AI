import { motion } from "motion/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";

const COUNTRIES = [
  { name: "India", flag: "🇮🇳", players: 15, color: "from-orange-500/20 to-green-500/20" },
  { name: "Australia", flag: "🇦🇺", players: 14, color: "from-yellow-500/20 to-green-600/20" },
  { name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", players: 12, color: "from-red-500/20 to-blue-500/20" },
  { name: "Pakistan", flag: "🇵🇰", players: 13, color: "from-green-700/20 to-white/10" },
  { name: "South Africa", flag: "🇿🇦", players: 11, color: "from-green-500/20 to-yellow-500/20" },
  { name: "New Zealand", flag: "🇳🇿", players: 10, color: "from-black/40 to-white/10" },
  { name: "West Indies", flag: "🌴", players: 12, color: "from-maroon-700/20 to-yellow-500/20" },
  { name: "Sri Lanka", flag: "🇱🇰", players: 11, color: "from-blue-800/20 to-yellow-600/20" },
];

export default function CountriesSection() {
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-4 text-gray-900">
              Global <span className="bg-neon px-2">Cricket</span> Nations
            </h2>
            <p className="text-gray-500 max-w-2xl font-medium">
              Explore the elite cricketing nations and their star-studded rosters. 
              Dive deep into player stats, historical performance, and national team insights.
            </p>
          </div>
          <Button 
            variant="ghost" 
            className="text-black hover:bg-neon font-bold uppercase tracking-widest"
            onClick={() => navigate('/database')}
          >
            View All Countries <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COUNTRIES.map((country, i) => (
            <motion.div
              key={country.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card 
                className="glass border-black/5 overflow-hidden group cursor-pointer card-hover relative h-64 flex flex-col justify-end p-8"
                onClick={() => navigate(`/country/${country.name}`)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${country.color} opacity-40 group-hover:opacity-60 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-500 origin-left">
                    {country.flag}
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 group-hover:text-black transition-colors mb-1">
                    {country.name}
                  </h3>
                  <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-black transition-colors">
                    <Users className="mr-2 h-3 w-3 text-black" />
                    {country.players} Active Players
                  </div>
                </div>

                {/* Decorative Element */}
                <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Users className="h-24 w-24 -rotate-12 text-black" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
