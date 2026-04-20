import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logout } from '../services/authService';
import { LogOut, LayoutDashboard, Trophy, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (!currentUser) return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#0a0a0a] border-b border-[#333333] z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="text-white w-6 h-6" />
            <span className="text-xl font-[600] text-white">StudySync</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-[#888888] hover:text-white transition-colors">
              <LayoutDashboard size={16} />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center space-x-2 text-[#888888] hover:text-white transition-colors">
              <Trophy size={16} />
              <span className="text-sm font-medium">Leaderboard</span>
            </Link>
            <div className="flex items-center space-x-4 ml-4">
              <div className="text-right">
                <p className="text-sm font-[500] text-white">{currentUser.name}</p>
                <p className="text-xs text-[#888888]">{currentUser.totalFocusMinutes || 0} mins focused</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-[#888888] hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
             <button onClick={handleLogout} className="text-[#888888] hover:text-white"><LogOut size={18} /></button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
