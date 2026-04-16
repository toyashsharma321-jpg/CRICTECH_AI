import { Link, useNavigate } from "react-router-dom";
import { Activity, Menu, X, User, LogOut, LayoutDashboard, Video, Zap, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/src/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-neon p-1.5 rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] transform group-hover:rotate-12 transition-transform">
              <Zap className="h-6 w-6 text-black fill-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">CRIC<span className="text-neon">TECH</span></span>
          </Link>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Home</Link>
              <Link to="/tournaments" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Tournaments</Link>
              <Link to="/database" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Players</Link>
              <Link to="/matches" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Matches</Link>
              {user && <Link to="/my-game" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">My Game</Link>}
              {user?.role === 'admin' && <Link to="/admin" className="text-neon hover:text-neon/80 transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Admin</Link>}
              <Link to="/upload" className="text-gray-400 hover:text-white transition-colors font-bold uppercase text-[10px] tracking-[0.2em]">Analyze</Link>
              
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden hover:border-neon/50 transition-all cursor-pointer outline-none">
                    <User className="h-5 w-5 text-neon" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass border-white/10 bg-black/90 text-white" side="bottom">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-black uppercase tracking-tight">{user.name}</p>
                          <p className="text-xs leading-none text-gray-400">{user.email}</p>
                        </div>
                      </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={() => navigate('/my-game')} className="hover:bg-neon hover:text-black cursor-pointer font-bold uppercase text-[10px] tracking-widest">
                      <Video className="mr-2 h-4 w-4" /> My Game
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="hover:bg-neon hover:text-black cursor-pointer font-bold uppercase text-[10px] tracking-widest">
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate('/admin')} className="hover:bg-neon hover:text-black cursor-pointer font-bold uppercase text-[10px] tracking-widest text-neon">
                        <Shield className="mr-2 h-4 w-4" /> Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem onClick={logout} className="text-red-500 hover:bg-red-500 hover:text-white cursor-pointer font-bold uppercase text-[10px] tracking-widest">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black transition-all font-black uppercase text-[10px] tracking-[0.2em] rounded-full px-6">
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-b border-white/10 px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-black/90 backdrop-blur-xl">
          <Link to="/" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">Home</Link>
          <Link to="/tournaments" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">Tournaments</Link>
          <Link to="/database" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">Players</Link>
          <Link to="/matches" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">Matches</Link>
          {user && <Link to="/my-game" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">My Game</Link>}
          {user?.role === 'admin' && <Link to="/admin" className="block px-3 py-2 text-neon font-bold uppercase text-[10px] tracking-widest">Admin Panel</Link>}
          <Link to="/upload" className="block px-3 py-2 text-gray-300 hover:text-neon font-bold uppercase text-[10px] tracking-widest">Analyze</Link>
          {!user ? (
            <Link to="/login" className="block px-3 py-2 text-neon font-bold uppercase text-[10px] tracking-widest">Sign In</Link>
          ) : (
            <button onClick={logout} className="block w-full text-left px-3 py-2 text-red-500 font-bold uppercase text-[10px] tracking-widest">Log Out</button>
          )}
        </div>
      )}
    </nav>
  );
}
