import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Plus, AlertTriangle } from 'lucide-react';

const Audits = () => {
  const { user } = useAuth();
  const [audits, setAudits] = useState<any[]>([]);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await api.get('/audits');
      setAudits(res.data);
    } catch (error) {
      console.error('Failed to fetch audits');
    }
  };

  const updateStatus = async (auditId: string, status: string) => {
    try {
      await api.patch(`/audits/${auditId}/status`, { status });
      fetchAudits();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'AUDITOR') {
    return (
      <div className="text-center mt-20">
        <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Restricted</h2>
        <p className="text-gray-500">Only Auditors and Admins can access this module.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Management</h1>
        <button className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus size={20} /> <span>New Audit</span>
        </button>
      </div>

      <div className="grid gap-6">
        {audits.map(audit => (
          <div key={audit.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${audit.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : audit.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                  <ClipboardCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{audit.title}</h3>
                  <p className="text-sm text-gray-500">Auditor: {audit.auditor.firstName} {audit.auditor.lastName} &bull; Date: {new Date(audit.auditDate).toLocaleDateString()}</p>
                </div>
              </div>
              <select
                value={audit.status}
                onChange={(e) => updateStatus(audit.id, e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            
            {audit.summary && (
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{audit.summary}</p>
            )}

            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Observations</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {audit.observations || 'No observations recorded yet.'}
              </p>
            </div>

            {audit.issues?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Linked Compliance Issues ({audit.issues.length})</h4>
                <div className="flex gap-2">
                  {audit.issues.map((issue: any) => (
                    <span key={issue.id} className={`text-xs px-2.5 py-1 rounded-full font-medium ${issue.severity === 'HIGH' ? 'bg-red-100 text-red-800' : issue.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {issue.status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {audits.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <ClipboardCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Audits Found</h3>
            <p className="text-gray-500">Click "New Audit" to schedule one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Audits;
