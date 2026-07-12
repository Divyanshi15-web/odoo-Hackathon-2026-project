import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus } from 'lucide-react';

const CarbonTracker = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [factors, setFactors] = useState<any[]>([]);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [emissionFactorId, setEmissionFactorId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, transRes, factorsRes] = await Promise.all([
        api.get('/carbon/reports/monthly'),
        api.get('/carbon/transactions'),
        api.get('/carbon/factors')
      ]);
      setReports(reportsRes.data);
      setTransactions(transRes.data);
      setFactors(factorsRes.data);
      if (factorsRes.data.length > 0) setEmissionFactorId(factorsRes.data[0].id);
    } catch (error) {
      console.error('Failed to fetch carbon data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/carbon/transactions', {
        departmentId: '1', // Hardcoded for demo if no department fetching
        emissionFactorId,
        amount: parseFloat(amount),
        description
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert('Error saving transaction');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Carbon Tracking</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Record Emission</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Emissions by Category</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="category" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip cursor={{ fill: 'rgba(5, 150, 105, 0.1)' }} contentStyle={{ borderRadius: '8px' }} />
              <Bar dataKey="amount" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="p-4 text-gray-900 dark:text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      {tx.emissionFactor?.source || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-gray-900 dark:text-gray-300">{tx.amount} {tx.emissionFactor?.unit}</td>
                  <td className="p-4 text-gray-500 dark:text-gray-400">{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Record Emission</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emission Source</label>
                <select 
                  className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white p-2.5"
                  value={emissionFactorId} onChange={e => setEmissionFactorId(e.target.value)} required
                >
                  {factors.map(f => (
                    <option key={f.id} value={f.id}>{f.source} ({f.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input type="number" step="any" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white p-2.5" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white p-2.5" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonTracker;
