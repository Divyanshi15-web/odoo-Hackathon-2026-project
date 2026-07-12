import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';

const CSRActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  
  // Registration Form
  const [hours, setHours] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await api.get('/csr');
      setActivities(res.data);
    } catch (error) {
      console.error('Failed to fetch CSR activities');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/csr/register', {
        activityId: selectedActivity.id,
        hoursContributed: parseFloat(hours),
        evidenceUrl
      });
      setSelectedActivity(null);
      fetchActivities();
      alert('Successfully registered for activity! Waiting for Admin approval.');
    } catch (error) {
      alert('Error registering');
    }
  };

  const handleApprove = async (participationId: string) => {
    try {
      await api.patch(`/csr/participations/${participationId}/approve`);
      fetchActivities();
    } catch (error) {
      alert('Error approving participation');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">CSR Activities</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => (
          <div key={activity.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {activity.category}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(activity.date).toLocaleDateString()}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{activity.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 flex-1 mb-6 text-sm">{activity.description}</p>
            
            <button 
              onClick={() => setSelectedActivity(activity)}
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 dark:text-emerald-400 font-medium py-2 rounded-lg transition-colors"
            >
              Participate
            </button>

            {/* Admin View for Pending Participations */}
            {user?.role === 'ADMIN' && activity.participations?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pending Approvals</p>
                {activity.participations.filter((p: any) => p.status === 'PENDING').map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-gray-600 dark:text-gray-400">{p.hoursContributed} hrs</span>
                    <button 
                      onClick={() => handleApprove(p.id)}
                      className="text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                    >
                      <CheckCircle size={16} /> <span>Approve</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join Activity</h2>
            <p className="text-gray-500 mb-6">{selectedActivity.title}</p>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hours Contributed</label>
                <input type="number" step="0.5" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white p-2.5" value={hours} onChange={e => setHours(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Evidence Link (URL)</label>
                <input type="url" placeholder="https://photo-link.com" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white p-2.5" value={evidenceUrl} onChange={e => setEvidenceUrl(e.target.value)} />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setSelectedActivity(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Submit Participation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSRActivities;
