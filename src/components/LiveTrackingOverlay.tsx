import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { 
  Maximize2, Settings, Layers, Map as MapIcon, 
  Activity, Target, User, Box, Zap, ShieldCheck, Bug
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TrackingObject {
  id: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, w, h]
  trajectory: { x: number; y: number }[];
  lastSeen: number;
}

export default function LiveTrackingOverlay({ isLive, stream }: { isLive: boolean; stream: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [trackedObjects, setTrackedObjects] = useState<TrackingObject[]>([]);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showFieldMap, setShowFieldMap] = useState(true);
  const [isLoadingModel, setIsLoadingModel] = useState(true);

  // Load Model
  useEffect(() => {
    async function loadModel() {
      try {
        await tf.ready();
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Optimized for browser performance
        });
        setModel(loadedModel);
        setIsLoadingModel(false);
      } catch (err) {
        console.error("Failed to load AI model:", err);
      }
    }
    loadModel();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Simple IOU Tracker
  const updateTracking = useCallback((detections: cocoSsd.DetectedObject[]) => {
    const now = Date.now();
    const CONFIDENCE_THRESHOLD = 0.6;
    const ALLOWED_CLASSES = ['person', 'sports ball'];

    setTrackedObjects(prev => {
      const next = [...prev];
      
      // 1. Filter and process new detections
      const validDetections = detections.filter(d => 
        d.score >= CONFIDENCE_THRESHOLD && 
        ALLOWED_CLASSES.includes(d.class)
      );

      // 2. Match detections to existing tracks (Simple Distance/IOU)
      const matchedDetections = new Set();
      
      next.forEach(track => {
        let bestMatch: cocoSsd.DetectedObject | null = null;
        let minDistance = 100; // Max pixels for matching

        validDetections.forEach(det => {
          if (matchedDetections.has(det)) return;
          if (det.class !== track.label) return;

          const dist = Math.sqrt(
            Math.pow(det.bbox[0] - track.bbox[0], 2) + 
            Math.pow(det.bbox[1] - track.bbox[1], 2)
          );

          if (dist < minDistance) {
            minDistance = dist;
            bestMatch = det;
          }
        });

        if (bestMatch) {
          const det = bestMatch as cocoSsd.DetectedObject;
          track.bbox = det.bbox as [number, number, number, number];
          track.confidence = det.score;
          track.lastSeen = now;
          track.trajectory = [...track.trajectory.slice(-19), { x: det.bbox[0] + det.bbox[2]/2, y: det.bbox[1] + det.bbox[3]/2 }];
          matchedDetections.add(det);
        }
      });

      // 3. Create new tracks for unmatched detections
      validDetections.forEach(det => {
        if (matchedDetections.has(det)) return;
        next.push({
          id: `${det.class}_${Math.random().toString(36).substr(2, 5)}`,
          label: det.class,
          confidence: det.score,
          bbox: det.bbox as [number, number, number, number],
          trajectory: [{ x: det.bbox[0] + det.bbox[2]/2, y: det.bbox[1] + det.bbox[3]/2 }],
          lastSeen: now
        });
      });

      // 4. Remove stale tracks (not seen for 1 second)
      return next.filter(t => now - t.lastSeen < 1000);
    });
  }, []);

  // Detection Loop
  useEffect(() => {
    let animationFrame: number;
    const runDetection = async () => {
      if (model && videoRef.current && videoRef.current.readyState === 4 && isLive) {
        const predictions = await model.detect(videoRef.current);
        updateTracking(predictions);
      }
      animationFrame = requestAnimationFrame(runDetection);
    };

    if (isLive && model) {
      runDetection();
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isLive, model, updateTracking]);

  // Draw Overlays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    trackedObjects.forEach(obj => {
      const [x, y, w, h] = obj.bbox;
      const color = obj.label === 'sports ball' ? '#CCFF00' : '#3b82f6';
      
      if (showBoxes) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        if (isDebugMode) {
          ctx.fillStyle = color;
          ctx.font = 'bold 12px Inter';
          ctx.fillText(`${obj.label.toUpperCase()} ${(obj.confidence * 100).toFixed(0)}%`, x, y - 8);
          ctx.fillText(`ID: ${obj.id}`, x, y + h + 15);
        }
      }

      if (showTrajectory && obj.label === 'sports ball') {
        ctx.beginPath();
        ctx.strokeStyle = '#CCFF00';
        ctx.lineWidth = 3;
        obj.trajectory.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    });
  }, [trackedObjects, showBoxes, showTrajectory, isDebugMode]);

  return (
    <div className="relative w-full h-full bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover opacity-90"
      />

      {/* Tracking Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Broadcast HUD */}
      <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse shadow-[0_0_10px_#ef4444]' : 'bg-gray-500'}`} />
              <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-white font-black tracking-widest">
                {isLoadingModel ? 'INITIALIZING AI...' : 'LIVE AI TRACKING'}
              </Badge>
            </div>
            <div className="glass px-3 py-1.5 rounded-lg border-white/10 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-neon" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Stability</span>
                <span className="text-[10px] font-black text-white">HIGH</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Model</span>
                <span className="text-[10px] font-black text-white">COCO-SSD LITE</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <AnimatePresence>
              {trackedObjects.some(o => o.label === 'sports ball') && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-neon text-black px-4 py-2 rounded-xl font-black text-2xl shadow-[0_0_30px_rgba(57,255,20,0.4)]"
                >
                  142.5 <span className="text-xs">KM/H</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 pointer-events-auto">
            <Button 
              size="icon" 
              variant="ghost" 
              className={`rounded-xl backdrop-blur-md border border-white/10 ${showBoxes ? 'bg-neon text-black' : 'bg-black/40 text-white'}`}
              onClick={() => setShowBoxes(!showBoxes)}
              title="Toggle Bounding Boxes"
            >
              <Box className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className={`rounded-xl backdrop-blur-md border border-white/10 ${showTrajectory ? 'bg-neon text-black' : 'bg-black/40 text-white'}`}
              onClick={() => setShowTrajectory(!showTrajectory)}
              title="Toggle Trajectory"
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className={`rounded-xl backdrop-blur-md border border-white/10 ${isDebugMode ? 'bg-red-500 text-white' : 'bg-black/40 text-white'}`}
              onClick={() => setIsDebugMode(!isDebugMode)}
              title="Debug Mode"
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>

          {showFieldMap && trackedObjects.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-40 h-60 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 border-2 border-white/20 rounded-full m-4" />
                <div className="absolute inset-x-0 top-1/2 border-t border-white/20" />
                <div className="absolute inset-y-0 left-1/2 border-l border-white/20" />
              </div>
              
              {trackedObjects.map(obj => (
                <motion.div
                  key={obj.id}
                  animate={{ 
                    left: `${(obj.bbox[0] / 800) * 100}%`, 
                    top: `${(obj.bbox[1] / 450) * 100}%` 
                  }}
                  className={`absolute w-2 h-2 rounded-full shadow-[0_0_5px_currentColor] ${obj.label === 'sports ball' ? 'bg-neon text-neon' : 'bg-blue-500 text-blue-500'}`}
                />
              ))}
              
              <div className="absolute top-2 left-2 text-[8px] font-bold text-gray-500 uppercase tracking-widest">Field Telemetry</div>
            </motion.div>
          )}
        </div>
      </div>

      {isLive && !isLoadingModel && (
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-px bg-neon/30 shadow-[0_0_15px_#39FF14] pointer-events-none"
        />
      )}
    </div>
  );
}
