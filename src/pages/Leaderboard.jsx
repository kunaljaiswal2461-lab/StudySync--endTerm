import React, { useState, useEffect, useMemo } from 'react';
import { getLeaderboard } from '../services/roomService';
import { Trophy, Award, Star, Flame, Loader2 } from 'lucide-react';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => b.totalFocusMinutes - a.totalFocusMinutes);
  }, [users]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <Loader2 className="animate-spin mx-auto h-12 w-12 text-active" />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-block p-3 bg-yellow-500/10 rounded-full mb-4 border border-yellow-500/20">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Global Leaderboard</h1>
        <p className="mt-3 text-lg text-slate-400">The most dedicated students in the StudySync community</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center w-20">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Focused</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {index === 0 && <Award className="h-6 w-6 text-yellow-400 mx-auto" />}
                    {index === 1 && <Star className="h-6 w-6 text-slate-300 mx-auto" />}
                    {index === 2 && <Star className="h-6 w-6 text-amber-600 mx-auto" />}
                    {index > 2 && <span className="text-lg font-bold text-slate-500">{index + 1}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-active font-bold mr-4 group-hover:border-active transition-colors">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white uppercase tracking-tight">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.totalFocusMinutes > 1000 ? 'Master' : 'Explorer'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-white">{(user.totalFocusMinutes / 60).toFixed(1)} hrs</div>
                    <div className="text-[10px] text-slate-500 uppercase">{user.totalFocusMinutes % 60} mins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full border border-slate-700">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-bold text-white">{user.streak || 0}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedUsers.length === 0 && (
          <div className="py-20 text-center text-slate-500 uppercase tracking-widest text-xs">
            No data available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
