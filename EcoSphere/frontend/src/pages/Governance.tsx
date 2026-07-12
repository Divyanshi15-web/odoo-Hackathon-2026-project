import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, FileText, CheckCircle, BarChart3 } from 'lucide-react';

const Governance = () => {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('library');

  useEffect(() => {
    fetchPolicies();
    if (user?.role === 'ADMIN') {
      fetchCompliance();
    }
  }, [user]);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/governance/policies');
      setPolicies(res.data);
    } catch (error) {
      console.error('Failed to fetch policies');
    }
  };

  const fetchCompliance = async () => {
    try {
      const res = await api.get('/governance/compliance');
      setCompliance(res.data);
    } catch (error) {
      console.error('Failed to fetch compliance stats');
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await api.post(`/governance/policies/${id}/acknowledge`);
      fetchPolicies();
    } catch (error) {
      alert('Error acknowledging policy');
    }
  };

  const hasAcknowledged = (policy: any) => {
    return policy.acknowledgements?.some((ack: any) => ack.employee?.userId === user?.id);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance & Compliance</h1>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
        <button 
          onClick={() => setActiveTab('library')} 
          className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
        >
          <div className="flex items-center space-x-2"><FileText size={18} /><span>Policy Library</span></div>
        </button>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          >
            <div className="flex items-center space-x-2"><BarChart3 size={18} /><span>Compliance Dashboard</span></div>
          </button>
        )}
      </div>

      {activeTab === 'library' && (
        <div className="space-y-6">
          {policies.map(policy => {
            const acknowledged = hasAcknowledged(policy);
            return (
              <div key={policy.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                      <ShieldCheck className="text-emerald-500" />
                      <span>{policy.title}</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Version {policy.version} &bull; Effective: {new Date(policy.effectiveDate).toLocaleDateString()}</p>
                  </div>
                  {acknowledged ? (
                    <span className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full text-sm font-medium">
                      <CheckCircle size={16} /> <span>Acknowledged</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full text-sm font-medium">
                      Action Required
                    </span>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-48 overflow-y-auto">
                  {policy.content}
                </div>
                
                {!acknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(policy.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    I Acknowledge and Agree
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'dashboard' && user?.role === 'ADMIN' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Policy Name</th>
                <th className="p-4 font-medium">Version</th>
                <th className="p-4 font-medium">Compliance Rate</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {compliance.map(metric => (
                <tr key={metric.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{metric.title}</td>
                  <td className="p-4 text-gray-500">{metric.version}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${metric.complianceRate >= 90 ? 'bg-emerald-500' : metric.complianceRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${metric.complianceRate}%` }} 
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(metric.complianceRate)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {metric.complianceRate >= 90 ? (
                      <span className="text-emerald-600 text-sm font-medium">Excellent</span>
                    ) : metric.complianceRate >= 70 ? (
                      <span className="text-amber-600 text-sm font-medium">Needs Attention</span>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">Critical</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Governance;
