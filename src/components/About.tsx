import { motion } from "motion/react";
import { Brain, Cpu, Database, Network } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl md:text-6xl font-black mb-6 text-black">HOW IT WORKS</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          CricTech leverages cutting-edge computer vision and machine learning 
          to turn raw video into actionable sports intelligence.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          {[
            {
              icon: <Cpu className="text-neon" />,
              title: "YOLOv8 Detection",
              desc: "We use a custom-trained YOLOv8 model to detect the cricket ball, bat, and players in every frame with 98% accuracy."
            },
            {
              icon: <Network className="text-neon" />,
              title: "Trajectory Estimation",
              desc: "Optical flow algorithms track the ball's movement across frames, reconstructing its 3D path even at high speeds."
            },
            {
              icon: <Brain className="text-neon" />,
              title: "Pattern Recognition",
              desc: "Our neural network classifies delivery types (Yorker, Bouncer, etc.) and identifies technical flaws in batting stance."
            },
            {
              icon: <Database className="text-neon" />,
              title: "Big Data Analytics",
              desc: "Historical data comparison allows us to benchmark player performance against professional standards."
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex space-x-4"
            >
              <div className="shrink-0 w-12 h-12 glass rounded-xl flex items-center justify-center">
                {item.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-black">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-neon/5 rounded-3xl blur-3xl" />
          <div className="relative glass border-black/10 rounded-3xl p-8 h-full flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6 neon-text">The Tech Stack</h3>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-neon mr-3" /> Python / PyTorch for AI Models</li>
              <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-neon mr-3" /> OpenCV for Frame Processing</li>
              <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-neon mr-3" /> React / Vite for Real-time UI</li>
              <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-neon mr-3" /> Node.js for Scalable Backend</li>
              <li className="flex items-center"><div className="h-1.5 w-1.5 rounded-full bg-neon mr-3" /> Gemini AI for Strategic Insights</li>
            </ul>
            <div className="mt-10 p-4 bg-gray-100 rounded-xl border border-black/5">
              <p className="text-xs font-mono text-gray-500">
                // System Status: Operational <br />
                // AI Confidence: 0.9842 <br />
                // Processing Latency: 142ms
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
