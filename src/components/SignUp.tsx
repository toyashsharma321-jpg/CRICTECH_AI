import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError("Google sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="glass border-white/10 overflow-hidden rounded-3xl shadow-2xl">
          <div className="p-8 text-center border-b border-white/5 bg-white/5">
            <div className="w-16 h-16 bg-neon/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="text-neon h-8 w-8" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Create <span className="text-neon">Account</span></h1>
            <p className="text-gray-400 text-sm mt-2">Join the future of cricket analytics</p>
          </div>

          <CardContent className="p-8">
            <Button
              onClick={handleGoogleSignUp}
              disabled={isLoading}
              variant="outline"
              className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 h-12 rounded-xl font-black uppercase tracking-widest mb-6 flex items-center justify-center gap-3"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue with Google"}
            </Button>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/5"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-950 px-2 text-gray-500 font-bold">Or sign up with</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                Already have an account?{" "}
                <Link to="/login" className="text-neon hover:underline">Sign In</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
