import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Gift, Medal, History } from 'lucide-react';

const Rewards = () => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('store');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rewardsRes, badgesRes, historyRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/rewards/badges'),
        api.get('/rewards/history')
      ]);
      setRewards(rewardsRes.data);
      setBadges(badgesRes.data);
      setHistory(historyRes.data);
    } catch (error) {
      console.error('Failed to fetch rewards data');
    }
  };

  const handleRedeem = async (id: string) => {
    try {
      await api.post(`/rewards/${id}/redeem`);
      fetchData();
      alert('Reward redeemed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error redeeming reward');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Rewards & Badges</h1>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('store')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'store' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <div className="flex items-center space-x-2"><Gift size={18} /><span>Reward Store</span></div>
        </button>
        <button 
          onClick={() => setActiveTab('badges')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'badges' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <div className="flex items-center space-x-2"><Medal size={18} /><span>My Badges</span></div>
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <div className="flex items-center space-x-2"><History size={18} /><span>History</span></div>
        </button>
      </div>

      {activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rewards.map(reward => (
            <div key={reward.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{reward.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">{reward.description}</p>
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{reward.pointsRequired} XP</span>
                <span className="text-xs text-gray-500">
                  {reward.inventory === -1 ? 'Unlimited' : `${reward.inventory} left`}
                </span>
              </div>
              <button 
                onClick={() => handleRedeem(reward.id)}
                disabled={reward.inventory === 0}
                className={`w-full font-medium py-2 rounded-lg transition-colors ${reward.inventory === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
              >
                {reward.inventory === 0 ? 'Out of Stock' : 'Redeem'}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          {badges.length === 0 ? (
            <div className="py-12">
              <Medal size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No badges yet</h3>
              <p className="text-gray-500">Complete challenges to earn XP and unlock badges!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {badges.map(badge => (
                <div key={badge.id} className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4 shadow-inner border border-amber-200 dark:border-amber-700">
                    <Medal size={40} />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{badge.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Reward</th>
                <th className="p-4 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {history.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="p-4 text-gray-900 dark:text-gray-300">{new Date(item.redeemedAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{item.reward.title}</td>
                  <td className="p-4 text-red-500 font-medium">-{item.reward.pointsRequired} XP</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={3} className="p-8 text-center text-gray-500">No redemptions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Rewards;
