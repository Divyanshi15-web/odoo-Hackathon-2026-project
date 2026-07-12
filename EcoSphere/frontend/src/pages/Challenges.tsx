import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Target, Trophy, Clock } from 'lucide-react';

const Challenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [challengesRes, leaderboardRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/challenges/leaderboard')
      ]);
      setChallenges(challengesRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Failed to fetch challenges data');
    }
  };

  const handleEnroll = async (id: string) => {
    try {
      await api.post(`/challenges/${id}/enroll`);
      fetchData();
    } catch (error) {
      alert('Error enrolling in challenge');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await api.post(`/challenges/${id}/complete`);
      fetchData();
    } catch (error) {
      alert('Error completing challenge');
    }
  };

  const getStatus = (challenge: any) => {
    if (challenge.participations?.length > 0) {
      return challenge.participations[0].status; // ENROLLED or COMPLETED
    }
    return 'AVAILABLE';
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sustainability Challenges</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Challenges</h2>
          {challenges.map(challenge => {
            const status = getStatus(challenge);
            return (
              <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <Trophy size={14} />
                      <span>{challenge.points} XP</span>
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      {challenge.difficulty}
                    </span>
                  </div>
                  <span className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={16} />
                    <span>{new Date(challenge.endDate).toLocaleDateString()}</span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">{challenge.description}</p>
                
                {status === 'AVAILABLE' && (
                  <button onClick={() => handleEnroll(challenge.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-colors">
                    Enroll Now
                  </button>
                )}
                {status === 'ENROLLED' && (
                  <button onClick={() => handleComplete(challenge.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                    Mark as Completed
                  </button>
                )}
                {status === 'COMPLETED' && (
                  <button disabled className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium py-2 rounded-lg cursor-not-allowed">
                    Completed
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
          <div className="flex items-center space-x-2 mb-6">
            <Target className="text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Leaderboard</h2>
          </div>
          <div className="space-y-4">
            {leaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-500'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
