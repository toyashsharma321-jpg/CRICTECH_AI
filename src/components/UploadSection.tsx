import { useState, useCallback, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, FileVideo, CheckCircle2, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/context/AuthContext";
import { GoogleGenAI, Type } from "@google/genai";

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setStatus('uploading');
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(r => setTimeout(r, 100));
    }

    setStatus('processing');
    setProgress(0);

    try {
      // 1. Real AI Analysis using Gemini
      setProgress(20);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const base64Data = await fileToBase64(file);
      setProgress(40);

      const prompt = `You are an expert cricket analyst. Analyze the provided match video and identify every delivery. 
      For each delivery, provide a detailed performance breakdown.
      
      CRITICAL INSTRUCTIONS:
      1. Identify the exact start and end time of each delivery in seconds.
      2. Estimate the ball speed in KM/H.
      3. Determine the ball length (Short, Good, Full, Yorker).
      4. Record the outcome (Dot, Single, Four, Six, Wicket, Wide, No Ball).
      5. Provide a detailed batsman analysis including shot type and hitting areas.
      6. Generate a 2D trajectory of the ball path as it travels from the bowler to the batsman. 
         Use a coordinate system from 0 to 100 for both X and Y.
      7. Identify key event timestamps: release, bounce, and impact.
      
      Return the data in a structured JSON format matching the provided schema.`;
      
      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.OBJECT,
            properties: {
              totalDeliveries: { type: Type.NUMBER },
              avgSpeed: { type: Type.NUMBER },
              topSpeed: { type: Type.NUMBER },
              overCount: { type: Type.NUMBER },
              currentOverBalls: { type: Type.NUMBER },
              weakness: { type: Type.STRING, description: "Main weakness identified in the batsman's technique" },
              insights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-4 key coaching insights based on the overall session"
              }
            },
            required: ["totalDeliveries", "avgSpeed", "topSpeed", "overCount", "currentOverBalls", "weakness", "insights"]
          },
          deliveries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                startTime: { type: Type.NUMBER, description: "Start time of the delivery in seconds" },
                speed: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["Short", "Good Length", "Full", "Yorker"] },
                outcome: { type: Type.STRING, enum: ["Dot", "Single", "Four", "Six", "Wicket"] },
                isWide: { type: Type.BOOLEAN },
                isNoBall: { type: Type.BOOLEAN },
                trajectory: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER }
                    },
                    required: ["x", "y"]
                  },
                  description: "A list of 10-15 points representing the ball path"
                },
                bouncePoint: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  },
                  required: ["x", "y"]
                },
                hitPoint: {
                  type: Type.OBJECT,
                  properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER }
                  },
                  required: ["x", "y"]
                },
                movement: {
                  type: Type.OBJECT,
                  properties: {
                    swing: { type: Type.NUMBER, description: "Swing in degrees" },
                    spin: { type: Type.NUMBER, description: "Spin in degrees" }
                  },
                  required: ["swing", "spin"]
                },
                events: {
                  type: Type.OBJECT,
                  properties: {
                    release: { type: Type.NUMBER, description: "Timestamp of release" },
                    bounce: { type: Type.NUMBER, description: "Timestamp of bounce" },
                    impact: { type: Type.NUMBER, description: "Timestamp of impact with bat" }
                  },
                  required: ["release", "bounce", "impact"]
                },
                batsmanAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    shotType: { type: Type.STRING },
                    hittingArea: { type: Type.STRING },
                    goodShotArea: { type: Type.STRING },
                    weakArea: { type: Type.STRING },
                    style: { type: Type.STRING, enum: ["Aggressive", "Defensive", "Balanced"] }
                  },
                  required: ["shotType", "hittingArea", "goodShotArea", "weakArea", "style"]
                }
              },
              required: ["id", "startTime", "speed", "type", "outcome", "isWide", "isNoBall", "trajectory", "bouncePoint", "hitPoint", "movement", "events", "batsmanAnalysis"]
            }
          }
        },
        required: ["summary", "deliveries"]
      };

      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              { inlineData: { mimeType: file.type, data: base64Data } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema as any
        }
      });

      setProgress(80);
      const analysisData = JSON.parse(result.text);

      // 3. Show results directly in frontend without saving to backend
      const localVideoUrl = URL.createObjectURL(file);
      
      setProgress(100);
      setStatus('completed');
      
      // Navigate to dashboard with temporary state
      setTimeout(() => {
        navigate(`/dashboard/temp`, { 
          state: { 
            analysisData, 
            videoUrl: localVideoUrl 
          } 
        });
      }, 1000);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setStatus('idle');
      alert("AI Analysis failed. Please try a smaller video or check your connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full glass p-8 rounded-3xl border-white/10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black mb-2 uppercase tracking-tight">Upload Match <span className="text-neon">Video</span></h2>
          <p className="text-gray-300 font-medium">Support MP4 formats up to 50MB. AI will automatically segment deliveries.</p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all flex flex-col items-center justify-center
            ${status !== 'idle' ? 'border-neon/50 bg-neon/5' : 'border-white/10 hover:border-neon/30 hover:bg-white/5 cursor-pointer'}
          `}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (status === 'idle') setFile(e.dataTransfer.files[0]);
          }}
          onClick={() => status === 'idle' && document.getElementById('file-input')?.click()}
        >
          <input 
            id="file-input"
            type="file" 
            accept="video/mp4" 
            className="hidden" 
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {status === 'idle' ? (
            <>
              <div className="w-16 h-16 bg-neon/10 rounded-full flex items-center justify-center mb-4">
                <Upload className="text-neon h-8 w-8" />
              </div>
              <p className="text-lg font-bold mb-1 text-white">
                {file ? file.name : "Drag & drop or click to select"}
              </p>
              <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">MP4, MOV supported</p>
            </>
          ) : (
            <div className="w-full space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-neon uppercase tracking-widest">
                  {status === 'uploading' ? 'Uploading Video...' : status === 'processing' ? 'AI Analyzing Deliveries...' : 'Analysis Complete'}
                </span>
                <span className="text-sm font-mono text-white font-bold">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/5" />
              <div className="flex justify-center">
                {status === 'processing' && <Loader2 className="h-8 w-8 text-neon animate-spin" />}
                {status === 'completed' && <CheckCircle2 className="h-8 w-8 text-neon" />}
              </div>
            </div>
          )}
        </div>

        {file && status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex items-center justify-between p-4 glass rounded-xl border-white/5"
          >
            <div className="flex items-center space-x-3">
              <FileVideo className="text-neon" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button 
              onClick={handleUpload}
              className="bg-neon text-black hover:bg-neon/90 font-bold"
            >
              Start Analysis
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
