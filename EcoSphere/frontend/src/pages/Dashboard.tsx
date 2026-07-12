import { useEffect, useState } from 'react';
import api from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, trendsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/trends')
        ]);
        setStats(statsRes.data);
        setTrends(trendsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data');
      }
    };
    fetchDashboardData();
  }, []);

  if (!stats || !trends) return <div className="animate-pulse">Loading dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Overall ESG Score</p>
          <p className="text-4xl font-bold text-emerald-600">{stats.overallScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Carbon Score</p>
          <p className="text-4xl font-bold text-blue-600">{stats.carbonScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Social Score</p>
          <p className="text-4xl font-bold text-purple-600">{stats.socialScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Governance Score</p>
          <p className="text-4xl font-bold text-amber-600">{stats.governanceScore}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Carbon & Goal Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="emissions" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="goals" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Department Ranking</h2>
          <div className="space-y-4">
            {stats.rankings.map((dept: any, index: number) => (
              <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center space-x-3">
                  <span className={`w-6 text-center font-bold ${index === 0 ? 'text-amber-500' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{dept.score} pt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
