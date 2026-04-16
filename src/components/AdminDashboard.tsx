import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Video, 
  Trash2, 
  Edit, 
  Shield, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  Save,
  UserCircle,
  Trophy,
  Flag,
  Calendar,
  Database
} from "lucide-react";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  getDocs,
  writeBatch
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ALL_PLAYERS } from "../data/players";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  photoURL?: string;
}

interface SessionData {
  id: string;
  userId: string;
  videoUrl: string;
  status: string;
  createdAt: any;
  resultData?: string;
}

type AdminTab = 'users' | 'sessions' | 'players' | 'teams' | 'tournaments' | 'matches';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('sessions');
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSession, setEditingSession] = useState<SessionData | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<any | null>(null);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [isAddingTournament, setIsAddingTournament] = useState(false);
  const [isAddingMatch, setIsAddingMatch] = useState(false);
  const [newSession, setNewSession] = useState({ userId: "", videoUrl: "", status: "Processing" });
  const [newPlayer, setNewPlayer] = useState({ name: "", team: "", role: "", img: "https://picsum.photos/seed/player/200/200" });
  const [newTeam, setNewTeam] = useState({ name: "", shortName: "", color: "#000000", logo: "https://picsum.photos/seed/team/200/200" });
  const [newTournament, setNewTournament] = useState({ name: "", year: new Date().getFullYear(), format: "T20" });
  const [newMatch, setNewMatch] = useState({ team1: "", team2: "", date: "", venue: "", tournamentId: "" });
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    const unsubscribers: (() => void)[] = [];

    const setupListener = (collectionName: string, setter: (data: any[]) => void) => {
      const q = query(collection(db, collectionName));
      const unsub = onSnapshot(q, (snapshot) => {
        setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        if (collectionName === 'analysis_sessions') setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.LIST, collectionName));
      unsubscribers.push(unsub);
    };

    setupListener('users', setUsers);
    setupListener('analysis_sessions', setSessions);
    setupListener('players', setPlayers);
    setupListener('teams', setTeams);
    setupListener('tournaments', setTournaments);
    setupListener('matches', setMatches);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [user, navigate]);

  const handleSeedData = async () => {
    if (!window.confirm("This will seed initial data for players, teams, etc. Continue?")) return;
    setIsSeeding(true);
    try {
      const batch = writeBatch(db);
      
      // Seed Players (first 20)
      ALL_PLAYERS.slice(0, 20).forEach(player => {
        const playerRef = doc(db, 'players', player.id);
        batch.set(playerRef, player);
      });

      // Seed Teams (Mock)
      const mockTeams = [
        { id: "ind", name: "India", shortName: "IND", color: "#0038A8", logo: "https://picsum.photos/seed/india/200/200" },
        { id: "aus", name: "Australia", shortName: "AUS", color: "#FFD700", logo: "https://picsum.photos/seed/aus/200/200" },
        { id: "eng", name: "England", shortName: "ENG", color: "#CE1126", logo: "https://picsum.photos/seed/eng/200/200" }
      ];
      mockTeams.forEach(team => {
        const teamRef = doc(db, 'teams', team.id);
        batch.set(teamRef, team);
      });

      await batch.commit();
      alert("Data seeded successfully!");
    } catch (err) {
      console.error("Seeding error:", err);
      alert("Seeding failed.");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${collectionName.slice(0, -1)}?`)) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    try {
      await updateDoc(doc(db, 'players', editingPlayer.id), editingPlayer);
      setEditingPlayer(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `players/${editingPlayer.id}`);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    try {
      await updateDoc(doc(db, 'teams', editingTeam.id), editingTeam);
      setEditingTeam(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `teams/${editingTeam.id}`);
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    try {
      await updateDoc(doc(db, 'analysis_sessions', editingSession.id), {
        status: editingSession.status,
        videoUrl: editingSession.videoUrl
      });
      setEditingSession(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `analysis_sessions/${editingSession.id}`);
    }
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'analysis_sessions'), {
        ...newSession,
        createdAt: serverTimestamp()
      });
      setIsAddingSession(false);
      setNewSession({ userId: "", videoUrl: "", status: "Processing" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'analysis_sessions');
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'players'), newPlayer);
      setIsAddingPlayer(false);
      setNewPlayer({ name: "", team: "", role: "", img: "https://picsum.photos/seed/player/200/200" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'players');
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'teams'), newTeam);
      setIsAddingTeam(false);
      setNewTeam({ name: "", shortName: "", color: "#000000", logo: "https://picsum.photos/seed/team/200/200" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'teams');
    }
  };

  const handleAddTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'tournaments'), newTournament);
      setIsAddingTournament(false);
      setNewTournament({ name: "", year: new Date().getFullYear(), format: "T20" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tournaments');
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'matches'), newMatch);
      setIsAddingMatch(false);
      setNewMatch({ team1: "", team2: "", date: "", venue: "", tournamentId: "" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'matches');
    }
  };

  const filteredData = () => {
    const term = searchTerm.toLowerCase();
    switch (activeTab) {
      case 'sessions':
        return sessions.filter(s => {
          const userName = users.find(u => u.id === s.userId)?.name || "";
          return s.id.toLowerCase().includes(term) || s.userId.toLowerCase().includes(term) || userName.toLowerCase().includes(term);
        });
      case 'users':
        return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
      case 'players':
        return players.filter(p => p.name.toLowerCase().includes(term) || p.team.toLowerCase().includes(term));
      case 'teams':
        return teams.filter(t => t.name.toLowerCase().includes(term) || t.shortName.toLowerCase().includes(term));
      case 'tournaments':
        return tournaments.filter(t => t.name.toLowerCase().includes(term));
      case 'matches':
        return matches.filter(m => m.team1.toLowerCase().includes(term) || m.team2.toLowerCase().includes(term));
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Clock className="h-8 w-8 text-neon animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <Shield className="text-neon h-10 w-10" />
              Admin <span className="text-neon">Control</span>
            </h1>
            <p className="text-gray-400 font-medium mt-1">Manage platform data in real-time.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 w-64 rounded-xl focus:border-neon/50 text-white"
              />
            </div>
            <Button 
              onClick={handleSeedData}
              disabled={isSeeding}
              className="bg-white/10 text-white hover:bg-white/20 font-bold uppercase tracking-widest px-6"
            >
              <Database className="h-4 w-4 mr-2" /> {isSeeding ? 'Seeding...' : 'Seed Data'}
            </Button>
            <Button 
              onClick={() => {
                if (activeTab === 'sessions') setIsAddingSession(true);
                else if (activeTab === 'players') setIsAddingPlayer(true);
                else if (activeTab === 'teams') setIsAddingTeam(true);
                else if (activeTab === 'tournaments') setIsAddingTournament(true);
                else if (activeTab === 'matches') setIsAddingMatch(true);
              }}
              className="bg-neon text-black hover:bg-neon/90 font-bold uppercase tracking-widest px-6"
            >
              <Plus className="h-4 w-4 mr-2" /> Add {activeTab.slice(0, -1)}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'sessions', icon: Video, label: 'Sessions', count: sessions.length },
            { id: 'users', icon: Users, label: 'Users', count: users.length },
            { id: 'players', icon: UserCircle, label: 'Players', count: players.length },
            { id: 'teams', icon: Flag, label: 'Teams', count: teams.length },
            { id: 'tournaments', icon: Trophy, label: 'Tournaments', count: tournaments.length },
            { id: 'matches', icon: Calendar, label: 'Matches', count: matches.length },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl font-black uppercase tracking-widest transition-all flex items-center gap-2 text-xs md:text-sm ${activeTab === tab.id ? 'bg-neon text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activeTab === 'sessions' && filteredData().map((session: any) => (
            <Card key={session.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                    <Video className="text-neon h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold uppercase tracking-tight">{session.id}</h3>
                      <Badge variant={session.status === 'Completed' ? 'default' : 'secondary'} className={session.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      User: {users.find(u => u.id === session.userId)?.name || session.userId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => setEditingSession(session)} className="border-white/10 text-white hover:bg-white/10">
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete('analysis_sessions', session.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                  <Button onClick={() => navigate(`/dashboard/${session.id}`)} className="bg-white/10 text-white hover:bg-white/20">View</Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map((u: any) => (
                <Card key={u.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-neon/10 rounded-full flex items-center justify-center overflow-hidden border border-neon/20">
                        {u.photoURL ? <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Users className="text-neon h-6 w-6" />}
                      </div>
                      <div>
                        <h3 className="text-white font-bold uppercase tracking-tight">{u.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge className={u.role === 'admin' ? 'bg-neon text-black' : 'bg-white/10 text-white'}>{u.role.toUpperCase()}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleDelete('users', u.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'players' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map((p: any) => (
                <Card key={p.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={p.img} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="text-white font-bold uppercase tracking-tight">{p.name}</h3>
                        <p className="text-xs text-neon font-mono uppercase tracking-widest">{p.team}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-white/10 text-white">{p.role}</Badge>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingPlayer(p)} className="border-white/10 text-white hover:bg-white/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete('players', p.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map((t: any) => (
                <Card key={t.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img src={t.logo} alt={t.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="text-white font-bold uppercase tracking-tight">{t.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{t.shortName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingTeam(t)} className="border-white/10 text-white hover:bg-white/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete('teams', t.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'tournaments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map((t: any) => (
                <Card key={t.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center">
                        <Trophy className="text-neon h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold uppercase tracking-tight">{t.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{t.year} • {t.format}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleDelete('tournaments', t.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData().map((m: any) => (
                <Card key={m.id} className="glass border-white/10 overflow-hidden hover:border-neon/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-neon/10 rounded-xl flex items-center justify-center">
                        <Calendar className="text-neon h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold uppercase tracking-tight">{m.team1} vs {m.team2}</h3>
                        <p className="text-xs text-gray-500 font-mono">{m.date} • {m.venue}</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleDelete('matches', m.id)} className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Edit Session Modal */}
        {editingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Edit <span className="text-neon">Session</span></h2>
                <button onClick={() => setEditingSession(null)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleUpdateSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                  <select value={editingSession.status} onChange={(e) => setEditingSession({...editingSession, status: e.target.value})} className="w-full bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white focus:border-neon/50 outline-none">
                    <option value="Processing" className="bg-slate-900">Processing</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                    <option value="Failed" className="bg-slate-900">Failed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Video URL</label>
                  <Input value={editingSession.videoUrl} onChange={(e) => setEditingSession({...editingSession, videoUrl: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Session Modal */}
        {isAddingSession && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add <span className="text-neon">Session</span></h2>
                <button onClick={() => setIsAddingSession(false)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">User ID</label>
                  <select value={newSession.userId} onChange={(e) => setNewSession({...newSession, userId: e.target.value})} className="w-full bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white focus:border-neon/50 outline-none" required>
                    <option value="" className="bg-slate-900">Select a user</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-900">{u.name} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Video URL</label>
                  <Input placeholder="https://..." value={newSession.videoUrl} onChange={(e) => setNewSession({...newSession, videoUrl: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                  <select value={newSession.status} onChange={(e) => setNewSession({...newSession, status: e.target.value})} className="w-full bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white focus:border-neon/50 outline-none">
                    <option value="Processing" className="bg-slate-900">Processing</option>
                    <option value="Completed" className="bg-slate-900">Completed</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create Session
                </Button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Edit Player Modal */}
        {editingPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Edit <span className="text-neon">Player</span></h2>
                <button onClick={() => setEditingPlayer(null)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleUpdatePlayer} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <Input value={editingPlayer.name} onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Team</label>
                  <Input value={editingPlayer.team} onChange={(e) => setEditingPlayer({...editingPlayer, team: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                  <Input value={editingPlayer.role} onChange={(e) => setEditingPlayer({...editingPlayer, role: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Team Modal */}
        {editingTeam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Edit <span className="text-neon">Team</span></h2>
                <button onClick={() => setEditingTeam(null)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleUpdateTeam} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <Input value={editingTeam.name} onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Short Name</label>
                  <Input value={editingTeam.shortName} onChange={(e) => setEditingTeam({...editingTeam, shortName: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Color</label>
                  <Input value={editingTeam.color} onChange={(e) => setEditingTeam({...editingTeam, color: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Add Player Modal */}
        {isAddingPlayer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add <span className="text-neon">Player</span></h2>
                <button onClick={() => setIsAddingPlayer(false)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddPlayer} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <Input value={newPlayer.name} onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Team</label>
                  <Input value={newPlayer.team} onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Role</label>
                  <Input value={newPlayer.role} onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create Player
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Team Modal */}
        {isAddingTeam && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add <span className="text-neon">Team</span></h2>
                <button onClick={() => setIsAddingTeam(false)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddTeam} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <Input value={newTeam.name} onChange={(e) => setNewTeam({...newTeam, name: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Short Name</label>
                  <Input value={newTeam.shortName} onChange={(e) => setNewTeam({...newTeam, shortName: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Color</label>
                  <Input type="color" value={newTeam.color} onChange={(e) => setNewTeam({...newTeam, color: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white p-1" required />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create Team
                </Button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Add Tournament Modal */}
        {isAddingTournament && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add <span className="text-neon">Tournament</span></h2>
                <button onClick={() => setIsAddingTournament(false)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddTournament} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Name</label>
                  <Input value={newTournament.name} onChange={(e) => setNewTournament({...newTournament, name: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Year</label>
                  <Input type="number" value={newTournament.year} onChange={(e) => setNewTournament({...newTournament, year: parseInt(e.target.value)})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Format</label>
                  <select value={newTournament.format} onChange={(e) => setNewTournament({...newTournament, format: e.target.value})} className="w-full bg-white/5 border-white/10 h-12 rounded-xl px-4 text-white focus:border-neon/50 outline-none">
                    <option value="T20" className="bg-slate-900">T20</option>
                    <option value="ODI" className="bg-slate-900">ODI</option>
                    <option value="Test" className="bg-slate-900">Test</option>
                  </select>
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create Tournament
                </Button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Match Modal */}
        {isAddingMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass max-w-md w-full p-8 rounded-3xl border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Add <span className="text-neon">Match</span></h2>
                <button onClick={() => setIsAddingMatch(false)} className="text-gray-500 hover:text-white"><X className="h-6 w-6" /></button>
              </div>
              <form onSubmit={handleAddMatch} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Team 1</label>
                  <Input value={newMatch.team1} onChange={(e) => setNewMatch({...newMatch, team1: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Team 2</label>
                  <Input value={newMatch.team2} onChange={(e) => setNewMatch({...newMatch, team2: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Date</label>
                  <Input type="date" value={newMatch.date} onChange={(e) => setNewMatch({...newMatch, date: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Venue</label>
                  <Input value={newMatch.venue} onChange={(e) => setNewMatch({...newMatch, venue: e.target.value})} className="bg-white/5 border-white/10 h-12 rounded-xl text-white" required />
                </div>
                <Button type="submit" className="w-full bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest h-12 rounded-xl">
                  <Plus className="h-4 w-4 mr-2" /> Create Match
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
