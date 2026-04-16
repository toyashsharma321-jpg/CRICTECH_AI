import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import UploadSection from "./components/UploadSection";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import Database from "./components/Database";
import PlayerProfile from "./components/PlayerProfile";
import Matches from "./components/Matches";
import CountryDetail from "./components/CountryDetail";
import Tournaments from "./components/Tournaments";
import TournamentDetail from "./components/TournamentDetail";
import TeamDetail from "./components/TeamDetail";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import MyGame from "./components/MyGame";
import AdminDashboard from "./components/AdminDashboard";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-white selection:bg-neon selection:text-black dark">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/my-game" element={<MyGame />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/upload" element={<UploadSection />} />
              <Route path="/dashboard/:id?" element={<Dashboard />} />
              <Route path="/about" element={<About />} />
              <Route path="/database" element={<Database />} />
              <Route path="/player/:id" element={<PlayerProfile />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/country/:countryName" element={<CountryDetail />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournament/:id" element={<TournamentDetail />} />
              <Route path="/team/:id" element={<TeamDetail />} />
            </Routes>
          </main>
        
        <footer className="py-12 border-t border-white/5 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 CRICTECH AI. ALL RIGHTS RESERVED. <br />
              <span className="text-[10px] tracking-[0.2em] uppercase mt-2 block opacity-50 text-gray-400">
                Precision Performance Analytics
              </span>
            </p>
          </div>
        </footer>
      </div>
    </Router>
  </AuthProvider>
  );
}
