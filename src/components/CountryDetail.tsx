import { useParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { BATSMEN, BOWLERS, ALL_ROUNDERS, COUNTRY_FLAGS, HEAD_TO_HEAD } from "../data/cricketData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Zap, Activity, Globe, Swords } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CountryDetail() {
  const { countryName } = useParams();
  const navigate = useNavigate();

  const countryPlayers = [
    ...BATSMEN.filter(p => p.country === countryName).map(p => ({ ...p, type: 'batsman' })),
    ...BOWLERS.filter(p => p.country === countryName).map(p => ({ ...p, type: 'bowler' })),
    ...ALL_ROUNDERS.filter(p => p.country === countryName).map(p => ({ ...p, type: 'allrounder' })),
  ];

  if (!countryName) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 text-gray-500 hover:text-black hover:bg-neon"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="flex items-center gap-6 mb-8">
          <span className="text-7xl">{COUNTRY_FLAGS[countryName] || "🏳️"}</span>
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tight text-white">
              {countryName} <span className="bg-neon px-2 text-black">National Team</span>
            </h1>
            <p className="text-gray-400 font-medium mt-2 flex items-center gap-2">
              <Globe className="h-4 w-4 text-neon" />
              International Cricket Council Member
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <User className="text-neon h-5 w-5" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Batsmen</span>
            </div>
            <div className="text-3xl font-black text-white">
              {countryPlayers.filter(p => p.type === 'batsman').length}
            </div>
          </Card>
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="text-neon h-5 w-5" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Bowlers</span>
            </div>
            <div className="text-3xl font-black text-white">
              {countryPlayers.filter(p => p.type === 'bowler').length}
            </div>
          </Card>
          <Card className="glass border-white/10 p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-neon h-5 w-5" />
              <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">All-Rounders</span>
            </div>
            <div className="text-3xl font-black text-white">
              {countryPlayers.filter(p => p.type === 'allrounder').length}
            </div>
          </Card>
        </div>

        {HEAD_TO_HEAD[countryName] && (
          <div className="mb-12">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8 border-l-4 border-neon pl-4 text-white flex items-center gap-3">
              <Swords className="h-6 w-6" /> Head-to-Head Records
            </h2>
            <Card className="glass border-white/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/10">
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-gray-400">Opponent</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center text-gray-400">Played</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center text-green-400">Won</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center text-red-400">Lost</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center text-gray-400">Draw/NR</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right text-gray-400">Win %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {HEAD_TO_HEAD[countryName].map((record) => (
                    <TableRow key={record.vs} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold flex items-center gap-2 text-white">
                        <span className="text-xl">{COUNTRY_FLAGS[record.vs]}</span>
                        {record.vs}
                      </TableCell>
                      <TableCell className="text-center font-medium text-gray-300">{record.played}</TableCell>
                      <TableCell className="text-center font-bold text-green-400">{record.won}</TableCell>
                      <TableCell className="text-center font-bold text-red-400">{record.lost}</TableCell>
                      <TableCell className="text-center text-gray-500">{record.draw + record.nr}</TableCell>
                      <TableCell className="text-right font-black text-neon">
                        {((record.won / record.played) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        <h2 className="text-2xl font-black uppercase tracking-tight mb-8 border-l-4 border-neon pl-4 text-white">
          Active Squad
        </h2>

        <Tabs defaultValue="batsmen" className="w-full">
          <TabsList className="bg-white/5 p-1 rounded-full mb-8 border border-white/10">
            <TabsTrigger value="batsmen" className="rounded-full px-8 py-2 data-[state=active]:bg-neon data-[state=active]:text-black text-gray-400">
              <User className="mr-2 h-4 w-4" /> Batsmen
            </TabsTrigger>
            <TabsTrigger value="bowlers" className="rounded-full px-8 py-2 data-[state=active]:bg-neon data-[state=active]:text-black text-gray-400">
              <Zap className="mr-2 h-4 w-4" /> Bowlers
            </TabsTrigger>
            <TabsTrigger value="allrounders" className="rounded-full px-8 py-2 data-[state=active]:bg-neon data-[state=active]:text-black text-gray-400">
              <Activity className="mr-2 h-4 w-4" /> All-Rounders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batsmen">
            {renderPlayerGrid(countryPlayers.filter(p => p.type === 'batsman'))}
          </TabsContent>
          <TabsContent value="bowlers">
            {renderPlayerGrid(countryPlayers.filter(p => p.type === 'bowler'))}
          </TabsContent>
          <TabsContent value="allrounders">
            {renderPlayerGrid(countryPlayers.filter(p => p.type === 'allrounder'))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

function renderPlayerGrid(players: any[]) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
        <p className="text-gray-500 font-bold uppercase tracking-widest">No players found in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {players.map((player, i) => (
        <motion.div
          key={player.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="glass border-white/10 overflow-hidden group card-hover h-full flex flex-col">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img 
                src={player.img} 
                alt={player.name} 
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-3 right-3">
                <Badge className="bg-black/80 backdrop-blur-md border-white/10 text-neon text-[10px] font-bold uppercase">
                  {player.type}
                </Badge>
              </div>
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg font-bold text-white group-hover:text-neon transition-colors">
                {player.name}
              </CardTitle>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{player.role}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0 grid grid-cols-2 gap-4 mt-auto">
              {player.type === 'batsman' || player.type === 'allrounder' ? (
                <>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Runs</p>
                    <p className="text-sm font-bold text-white">{(player.stats as any).runs}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Avg</p>
                    <p className="text-sm font-bold text-white">{(player.stats as any).avg}</p>
                  </div>
                </>
              ) : null}
              {player.type === 'bowler' || player.type === 'allrounder' ? (
                <>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Wkts</p>
                    <p className="text-sm font-bold text-white">{(player.stats as any).wickets}</p>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold">Econ</p>
                    <p className="text-sm font-bold text-white">{(player.stats as any).econ || (player.stats as any).sr}</p>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
