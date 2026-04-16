import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { 
  Activity, Zap, Target, AlertTriangle, ChevronRight, 
  Play, Pause, SkipBack, SkipForward, Download, BrainCircuit,
  Camera, Video, X, Info, ShieldAlert, TrendingUp, History,
  Box, PieChart as PieIcon, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnalysisResults, Delivery } from "@/src/types";
import Cricket3DView from "./Cricket3DView";
import LiveTrackingOverlay from "./LiveTrackingOverlay";

import { useAuth } from "@/src/context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";

export default function Dashboard() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();
  const [data, setData] = useState<AnalysisResults | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ videoUrl: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const uploadedVideoUrl = location.state?.videoUrl;
  const matchContext = location.state?.match;
  const defaultVideo = "https://assets.mixkit.co/videos/preview/mixkit-cricket-player-hitting-the-ball-32747-large.mp4";

  const handleSaveLiveSession = async () => {
    if (!user) return;
    setIsSaving(true);
    const sessionId = "sess_" + Date.now();
    try {
      // Save to Firestore directly for real-time demo
      await setDoc(doc(db, 'analysis_sessions', sessionId), {
        id: sessionId,
        userId: user.id,
        videoUrl: defaultVideo,
        status: 'Completed',
        createdAt: serverTimestamp(),
        // Mock results for now
        resultData: JSON.stringify({
          deliveries: [], // Would be populated in real app
          summary: {
            totalDeliveries: 0,
            avgSpeed: 0,
            topSpeed: 0,
            weakness: "None detected",
            insights: ["Live session saved successfully"],
            overCount: 0,
            currentOverBalls: 0
          }
        })
      });
      alert("Live session saved to My Game!");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `analysis_sessions/${sessionId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleLiveCamera = useCallback(async (forceState?: boolean) => {
    setIsLiveMode(prev => {
      const nextState = forceState !== undefined ? forceState : !prev;
      return nextState;
    });
  }, []);

  useEffect(() => {
    if (selectedDelivery && videoRef.current) {
      videoRef.current.currentTime = selectedDelivery.startTime;
      setCurrentTime(selectedDelivery.startTime);
    }
  }, [selectedDelivery]);

  const flipCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    // Stop current stream to force restart with new facingMode
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Handle stream lifecycle based on isLiveMode and facingMode
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingMode } 
        });
        setStream(activeStream);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setIsLiveMode(false);
      }
    };

    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };

    if (isLiveMode && !stream) {
      startCamera();
    } else if (!isLiveMode && stream) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isLiveMode, stream, facingMode]);

  useEffect(() => {
    // 1. Check if we have temporary session data in state (from UploadSection)
    if (id === 'temp' && location.state?.analysisData) {
      setData(location.state.analysisData);
      setSessionInfo({ 
        videoUrl: location.state.videoUrl || defaultVideo, 
        status: 'Completed' 
      });
      if (location.state.analysisData.deliveries?.length > 0) {
        setSelectedDelivery(location.state.analysisData.deliveries[0]);
      }
      return;
    }

    if (!id || id === 'temp') {
      // Load mock data for general dashboard
      const fetchMockData = async () => {
        try {
          const res = await fetch('/api/results');
          if (!res.ok) throw new Error("Failed to fetch mock results");
          const d = await res.json();
          setData(d);
          if (d.deliveries?.length > 0) {
            setSelectedDelivery(d.deliveries[0]);
          }
        } catch (err: any) {
          setError(err.message);
        }
      };
      fetchMockData();
      return;
    }

    // Real-time listener for session data
    const unsubscribe = onSnapshot(doc(db, 'analysis_sessions', id), (snapshot) => {
      if (snapshot.exists()) {
        const d = snapshot.data();
        setSessionInfo({ videoUrl: d.videoUrl, status: d.status });
        
        if (d.status === 'Completed' && d.resultData) {
          const results = JSON.parse(d.resultData);
          setData(results);
          if (results?.deliveries?.length > 0 && !selectedDelivery) {
            setSelectedDelivery(results.deliveries[0]);
          }
        } else if (d.status === 'Failed') {
          setError("Analysis failed. Please try again.");
        } else {
          // Keep data null to show processing state
          setData(null);
        }
      } else {
        setError("Session not found in real-time database");
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `analysis_sessions/${id}`);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (searchParams.get("mode") === "live") {
      setIsLiveMode(true);
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Error Loading Analysis</h2>
        <p className="text-gray-400 mt-2">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6 bg-neon text-black font-bold">
          Retry
        </Button>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <BrainCircuit className="h-16 w-16 text-neon animate-pulse mb-4" />
      <h2 className="text-xl font-black uppercase tracking-widest text-white">AI Processing Analysis...</h2>
      <p className="text-gray-500 mt-2 font-medium">Extracting performance insights from video</p>
    </div>
  );

  const outcomeColors = {
    'Dot': '#94a3b8',
    'Single': '#3b82f6',
    'Four': '#39FF14',
    'Six': '#facc15',
    'Wicket': '#ef4444'
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        
        {/* Top Section: Video/Camera & 3D Reconstruction */}
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {isLiveMode ? <span className="text-red-500 animate-pulse">● LIVE</span> : "Session"} <span className="text-neon">Analysis</span>
              </h2>
              {matchContext ? (
                <p className="text-sm text-neon font-bold uppercase tracking-widest mt-1">
                  {matchContext.teamA} vs {matchContext.teamB} • {matchContext.venue}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Real-time AI performance tracking and 3D reconstruction.</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isLiveMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSaveLiveSession}
                  disabled={isSaving || !user}
                  className="rounded-full border-neon/30 text-neon hover:bg-neon hover:text-black"
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
                  Save Session
                </Button>
              )}
              {isLiveMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={flipCamera}
                  className="rounded-full border-white/10 hidden md:flex"
                >
                  <History className="mr-2 h-4 w-4" /> Flip Camera
                </Button>
              )}
              <Button 
                variant={isLiveMode ? "destructive" : "outline"}
                size="sm"
                onClick={() => toggleLiveCamera()}
                className="rounded-full border-white/10"
              >
                {isLiveMode ? <X className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                {isLiveMode ? "Stop Camera" : "Live Camera"}
              </Button>
              {!isLiveMode && (
                <Button variant="outline" size="sm" className="rounded-full border-white/10">
                  <Box className="mr-2 h-4 w-4" /> Sync 3D
                </Button>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-1 ${isLiveMode ? '' : 'lg:grid-cols-2'} gap-6 h-[600px]`}>
            {/* Video Player / Live Tracking */}
            <Card className={`glass border-white/10 overflow-hidden rounded-3xl relative flex flex-col ${isLiveMode ? 'aspect-[9/16] md:aspect-video max-w-4xl mx-auto' : ''}`}>
              <div className="relative flex-1 bg-black flex items-center justify-center group">
                {isLiveMode ? (
                  <div className="w-full h-full relative">
                    <LiveTrackingOverlay isLive={isLiveMode} stream={stream} />
                    {/* Fulltrack AI Style Flip Button for Mobile */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={flipCamera}
                      className="absolute top-4 right-4 z-30 bg-black/40 backdrop-blur-md rounded-full text-white md:hidden pointer-events-auto"
                    >
                      <History className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <video 
                      ref={videoRef}
                      src={sessionInfo?.videoUrl || uploadedVideoUrl || defaultVideo} 
                      className={`w-full h-full object-cover transition-all duration-500 ${!(sessionInfo?.videoUrl || uploadedVideoUrl) ? 'opacity-60 grayscale group-hover:grayscale-0' : ''}`}
                      autoPlay={isPlaying}
                      muted
                      loop
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                    />
                  </div>
                )}
                
                {/* Shot Classification Overlay */}
                {!isLiveMode && selectedDelivery && isPlaying && (
                  <AnimatePresence>
                    {currentTime >= selectedDelivery.events.impact && currentTime <= selectedDelivery.events.impact + 1.5 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: -20 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                      >
                        <div className="bg-neon text-black px-8 py-4 rounded-2xl font-black text-4xl shadow-[0_0_50px_rgba(57,255,20,0.6)] uppercase tracking-tighter italic">
                          {selectedDelivery.batsmanAnalysis.shotType}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}

                {/* Ball Trajectory Overlay (Only in playback mode) */}
                {!isLiveMode && selectedDelivery && selectedDelivery.trajectory && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path
                      key={selectedDelivery.id}
                      d={`M ${selectedDelivery.trajectory.map(p => `${p.x},${p.y}`).join(' L ')}`}
                      fill="none"
                      stroke="#39FF14"
                      strokeWidth="0.5"
                      strokeDasharray="2,1"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    
                    {/* Bounce Point */}
                    {selectedDelivery.bouncePoint && (
                      <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 }}
                      >
                        <circle
                          cx={selectedDelivery.bouncePoint.x}
                          cy={selectedDelivery.bouncePoint.y}
                          r="1.5"
                          fill="#facc15"
                          className="animate-pulse"
                        />
                        <text x={selectedDelivery.bouncePoint.x + 2} y={selectedDelivery.bouncePoint.y} fill="#facc15" fontSize="3" fontWeight="bold">BOUNCE</text>
                      </motion.g>
                    )}

                    {/* Hit Point */}
                    {selectedDelivery.hitPoint && (
                      <motion.g
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 }}
                      >
                        <circle
                          cx={selectedDelivery.hitPoint.x}
                          cy={selectedDelivery.hitPoint.y}
                          r="1.5"
                          fill="#ef4444"
                        />
                        <text x={selectedDelivery.hitPoint.x + 2} y={selectedDelivery.hitPoint.y} fill="#ef4444" fontSize="3" fontWeight="bold">HIT</text>
                      </motion.g>
                    )}
                  </svg>
                )}

                {/* AI Umpire Overlay (Only in playback) */}
                {!isLiveMode && (
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-black/80 backdrop-blur-md border-neon/30 text-neon font-black px-3 py-1">
                          OVER {data.summary?.overCount || 0}.{data.summary?.currentOverBalls || 0}
                        </Badge>
                        {selectedDelivery?.isWide && (
                          <Badge className="bg-yellow-500 text-black font-black animate-bounce">WIDE BALL</Badge>
                        )}
                        {selectedDelivery?.isNoBall && (
                          <Badge className="bg-red-500 text-white font-black animate-bounce">NO BALL</Badge>
                        )}
                      </div>
                      {selectedDelivery && (
                        <div className="glass p-3 rounded-xl border-white/10 space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Length</span>
                            <span className="text-[10px] text-white font-black">{selectedDelivery.type}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Swing</span>
                            <span className="text-[10px] text-neon font-black">{selectedDelivery.movement.swing}°</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-[10px] text-gray-400 uppercase font-bold">Spin</span>
                            <span className="text-[10px] text-yellow-400 font-black">{selectedDelivery.movement.spin}°</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="glass p-3 rounded-xl border-white/10 text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Batsman Analysis</div>
                        <div className="text-xs font-black text-white">{selectedDelivery?.batsmanAnalysis.style} Style</div>
                        <div className="text-[10px] text-neon mt-1">Good Area: {selectedDelivery?.batsmanAnalysis.goodShotArea}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live AI Detection Boxes (Removed - now in LiveTrackingOverlay) */}

                <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                  <Badge className="bg-neon text-black font-bold">
                    {isLiveMode ? "LIVE AI PROCESSING" : uploadedVideoUrl ? "ANALYZING UPLOADED VIDEO" : "AI TRACKING"}
                  </Badge>
                  {!isLiveMode && (
                    <Badge variant="outline" className="bg-black/50 border-white/20">
                      {selectedDelivery?.speed} KM/H
                    </Badge>
                  )}
                </div>

                {!isLiveMode && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-16 w-16 rounded-full bg-neon text-black hover:bg-neon/80"
                      onClick={() => {
                        if (videoRef.current) {
                          if (isPlaying) videoRef.current.pause();
                          else videoRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }}
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                    </Button>
                  </div>
                )}
              </div>
              
              {!isLiveMode && (
                <div className="p-4 flex items-center justify-between bg-black/40 border-t border-white/5">
                  <div className="flex items-center space-x-2 mr-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        const currentIndex = (data.deliveries || []).findIndex(d => d.id === selectedDelivery?.id);
                        if (currentIndex > 0) setSelectedDelivery(data.deliveries?.[currentIndex - 1] || null);
                      }}
                    >
                      <SkipBack className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-white"
                      onClick={() => {
                        const currentIndex = (data.deliveries || []).findIndex(d => d.id === selectedDelivery?.id);
                        if (currentIndex < (data.deliveries?.length || 0) - 1) setSelectedDelivery(data.deliveries?.[currentIndex + 1] || null);
                      }}
                    >
                      <SkipForward className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex-1 px-4 relative">
                    {/* Event Markers on Timeline */}
                    {selectedDelivery && duration > 0 && (
                      <div className="absolute inset-x-4 top-0 h-full pointer-events-none flex items-center">
                        <div 
                          className="absolute w-1 h-3 bg-blue-500 rounded-full" 
                          style={{ left: `${(selectedDelivery.events.release / duration) * 100}%` }}
                          title="Release"
                        />
                        <div 
                          className="absolute w-1 h-3 bg-yellow-500 rounded-full" 
                          style={{ left: `${(selectedDelivery.events.bounce / duration) * 100}%` }}
                          title="Bounce"
                        />
                        <div 
                          className="absolute w-1 h-3 bg-red-500 rounded-full" 
                          style={{ left: `${(selectedDelivery.events.impact / duration) * 100}%` }}
                          title="Impact"
                        />
                      </div>
                    )}
                    <input 
                      type="range" 
                      min="0" 
                      max={duration} 
                      step="0.01"
                      value={currentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value);
                        if (videoRef.current) videoRef.current.currentTime = time;
                        setCurrentTime(time);
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neon"
                    />
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className="text-sm font-mono text-gray-400">
                      {currentTime.toFixed(2)} / {duration.toFixed(2)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-neon ml-4">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              )}
            </Card>

            {/* 3D Reconstruction View */}
            {!isLiveMode && (
              <div className="aspect-video lg:aspect-auto h-full min-h-[400px]">
                <Cricket3DView 
                  delivery={selectedDelivery} 
                  isPlaying={isPlaying} 
                  currentTime={currentTime}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Analysis & Stats */}
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {/* Delivery Timeline */}
            {!isLiveMode && data.deliveries && (
              <div className="space-y-4">
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                  {data.deliveries?.map((d, i) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDelivery(d)}
                      className={`h-12 rounded-lg border flex items-center justify-center text-xs font-bold transition-all
                        ${selectedDelivery?.id === d.id ? 'border-neon bg-neon/20 text-neon' : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/20'}
                      `}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <Card className="glass border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Ball-by-Ball Breakdown</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-gray-500 uppercase tracking-wider">
                          <th className="p-4 font-bold">Ball</th>
                          <th className="p-4 font-bold">Batsman</th>
                          <th className="p-4 font-bold">Speed</th>
                          <th className="p-4 font-bold">Length</th>
                          <th className="p-4 font-bold">Outcome</th>
                          <th className="p-4 font-bold">Shot</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.deliveries?.map((d, i) => (
                          <tr 
                            key={d.id} 
                            onClick={() => setSelectedDelivery(d)}
                            className={`border-b border-white/5 cursor-pointer transition-colors ${selectedDelivery?.id === d.id ? 'bg-neon/10' : 'hover:bg-white/5'}`}
                          >
                            <td className="p-4 font-black">{i + 1}</td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                {d.batsman && (
                                  <img 
                                    src={d.batsman.img} 
                                    alt={d.batsman.name} 
                                    className="h-8 w-8 rounded-full object-cover border border-white/10"
                                    referrerPolicy="no-referrer"
                                  />
                                )}
                                <span className="font-bold text-white whitespace-nowrap">{d.batsman?.name || "Unknown"}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono">{d.speed} KM/H</td>
                            <td className="p-4">{d.type}</td>
                            <td className="p-4">
                              <Badge style={{ backgroundColor: outcomeColors[d.outcome as keyof typeof outcomeColors] + '20', color: outcomeColors[d.outcome as keyof typeof outcomeColors], border: `1px solid ${outcomeColors[d.outcome as keyof typeof outcomeColors]}40` }}>
                                {d.outcome}
                              </Badge>
                            </td>
                            <td className="p-4 text-gray-400">{d.batsmanAnalysis.shotType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass border-white/10 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-gray-400 flex items-center">
                  <TrendingUp className="mr-2 h-3 w-3 text-neon" /> Speed Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.deliveries || []}>
                    <XAxis dataKey="id" hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(204,255,0,0.2)', borderRadius: '12px' }}
                      itemStyle={{ color: '#CCFF00' }}
                    />
                    <Bar dataKey="speed">
                      {data.deliveries?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'Short' ? '#ef4444' : '#39FF14'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-gray-400 flex items-center">
                  <ShieldAlert className="mr-2 h-3 w-3 text-red-500" /> Pitch Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 relative flex items-center justify-center">
                <div className="w-full h-full bg-black/40 rounded-lg border border-white/5 relative overflow-hidden">
                  {/* Pitch Lines */}
                  <div className="absolute inset-x-0 top-1/4 border-t border-white/10" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
                  <div className="absolute inset-x-0 top-3/4 border-t border-white/10" />
                  
                  {data.deliveries?.map((d) => (
                    <motion.div
                      key={d.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute w-3 h-3 rounded-full border-2 border-black
                        ${d.type === 'Short' ? 'bg-red-500' : d.type === 'Full' ? 'bg-blue-500' : 'bg-neon'}
                      `}
                      style={{ 
                        left: `${(d.bouncePoint?.x || 50)}%`, 
                        top: `${(d.bouncePoint?.y || 50)}%` 
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-gray-400 flex items-center">
                  <PieIcon className="mr-2 h-3 w-3 text-neon" /> Shot Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(
                        (data.deliveries || []).reduce((acc: any, d) => {
                          const shot = d.batsmanAnalysis?.shotType || 'Unknown';
                          acc[shot] = (acc[shot] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {['#39FF14', '#3b82f6', '#facc15', '#ef4444', '#a855f7'].map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141417', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-white/10 rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-widest text-gray-400 flex items-center">
                  <PieIcon className="mr-2 h-3 w-3 text-neon" /> Wagon Wheel
                </CardTitle>
              </CardHeader>
              <CardContent className="h-48 relative flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-white/10 relative overflow-hidden bg-green-900/20">
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-75" />
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-50" />
                  <div className="absolute inset-x-0 top-1/2 border-t border-white/10" />
                  <div className="absolute inset-y-0 left-1/2 border-l border-white/10" />
                  
                  {data.deliveries?.map((d, i) => {
                    // Use hittingArea to determine angle if possible, or random for now
                    const angle = (i * (360 / (data.deliveries?.length || 1))) * (Math.PI / 180);
                    return (
                      <motion.div
                        key={d.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-1 h-10 origin-bottom"
                        style={{ 
                          left: '50%', 
                          bottom: '50%',
                          transform: `rotate(${angle}rad)`,
                          backgroundColor: outcomeColors[d.outcome as keyof typeof outcomeColors] || '#fff'
                        }}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Stats & Insights */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
            <Card className="glass border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Activity className="text-neon h-5 w-5" />
                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Deliveries</span>
              </div>
              <div className="text-3xl font-black text-white">{data.summary?.totalDeliveries || 0}</div>
              <div className="text-xs text-neon mt-1 font-semibold">Session Analysis</div>
            </Card>
            
            <Card className="glass border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Zap className="text-yellow-400 h-5 w-5" />
                <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">Avg Speed</span>
              </div>
              <div className="text-3xl font-black text-white">{data.summary?.avgSpeed || 0} <span className="text-sm font-normal text-gray-400">KM/H</span></div>
              <div className="text-xs text-gray-300 mt-1">Top: {data.summary?.topSpeed || 0} KM/H</div>
            </Card>
          </div>

          <Card className="glass border-white/10 rounded-2xl overflow-hidden">
            <div className="bg-red-500/10 p-4 border-b border-red-500/20 flex items-center space-x-2">
              <AlertTriangle className="text-red-500 h-5 w-5" />
              <span className="text-sm font-bold text-red-500 uppercase">Critical Weakness</span>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{data.summary?.weakness || "No significant weakness"}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                AI identified this as the primary technical area for improvement based on ball-by-ball tracking.
              </p>
            </div>
          </Card>

          <Card className="glass border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-6 flex items-center">
              <Target className="mr-2 h-4 w-4 text-neon" />
              AI Coach Insights
            </h3>
            <div className="space-y-4 mb-8">
              {data.summary?.insights?.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neon shrink-0" />
                  <p className="text-sm text-gray-300 leading-snug">{insight}</p>
                </div>
              ))}
              {!data.summary?.insights && (
                <p className="text-sm text-gray-500 italic">No specific insights generated for this session.</p>
              )}
            </div>

            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Last Shot</div>
                  <div className="text-sm font-black text-white">{selectedDelivery?.batsmanAnalysis.shotType}</div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Hitting Area</div>
                  <div className="text-sm font-black text-neon">{selectedDelivery?.batsmanAnalysis.hittingArea}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neon shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Good Shot Area</p>
                    <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                      {selectedDelivery?.batsmanAnalysis.goodShotArea}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1">Weak Area</p>
                    <p className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                      {selectedDelivery?.batsmanAnalysis.weakArea}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button variant="link" className="text-neon p-0 mt-6 h-auto text-xs font-bold uppercase tracking-widest">
              View Technical Breakdown <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>

      </div>
    </div>
  );
}
