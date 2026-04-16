import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, Trash2, Calendar, Activity, 
  ChevronRight, Video, Loader2, History,
  BrainCircuit, AlertCircle
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from "firebase/firestore";

interface Session {
  id: string;
  userId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: any;
}

export default function MyGame() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const q = query(
      collection(db, 'analysis_sessions'), 
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData: Session[] = [];
      snapshot.forEach((doc) => {
        sessionData.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(sessionData);
      setIsLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'analysis_sessions');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this session?")) return;
    
    try {
      await deleteDoc(doc(db, 'analysis_sessions', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `analysis_sessions/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-neon animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <Badge className="bg-neon/10 text-neon border-neon/20 mb-4 px-3 py-1">
              Personal Dashboard
            </Badge>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">
              My <span className="text-neon">Game</span>
            </h1>
            <p className="text-gray-400 font-medium mt-4 max-w-xl">
              Manage your analyzed sessions, track your progress, and revisit your best shots.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/upload')}
            className="bg-neon text-black hover:bg-neon/90 font-black uppercase tracking-widest px-8 py-6 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.3)]"
          >
            New Analysis
          </Button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-32 glass rounded-3xl border-white/10">
            <Video className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">No sessions yet</h3>
            <p className="text-gray-500 mt-2 mb-8">Upload your first video to start your AI-powered journey.</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/upload')}
              className="border-white/10 text-white hover:bg-neon hover:text-black"
            >
              Upload Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="glass border-white/10 overflow-hidden group hover:border-neon/30 transition-all duration-500">
                    <div className="aspect-video relative overflow-hidden">
                      <video 
                        src={session.videoUrl} 
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <Badge className={`${session.status === 'Completed' ? 'bg-neon text-black' : 'bg-yellow-500 text-black'} font-black uppercase text-[8px] tracking-widest`}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          className="h-12 w-12 rounded-full bg-neon text-black"
                          onClick={() => navigate(`/dashboard/${session.id}`)}
                        >
                          <Play className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-black text-white group-hover:text-neon transition-colors">Session Analysis</h3>
                          <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            <Calendar className="h-3 w-3 mr-1.5 text-neon" />
                            {session.createdAt?.toDate ? session.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-gray-600 hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-4 w-4 text-neon" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Processed</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="text-white hover:text-neon p-0 h-auto group/btn"
                          onClick={() => navigate(`/dashboard/${session.id}`)}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest mr-1">View Results</span>
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
