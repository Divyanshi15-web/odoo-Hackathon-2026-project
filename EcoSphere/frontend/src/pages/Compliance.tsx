import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Compliance = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const res = await api.get('/compliance/issues');
      setIssues(res.data);
    } catch (error) {
      console.error('Failed to fetch compliance issues');
    }
  };

  const escalateIssue = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/compliance/issues/${id}`, { isEscalated: !currentStatus });
      fetchIssues();
    } catch (error) {
      alert('Failed to escalate issue');
    }
  };

  const resolveIssue = async (id: string) => {
    try {
      await api.patch(`/compliance/issues/${id}`, { status: 'RESOLVED' });
      fetchIssues();
    } catch (error) {
      alert('Failed to resolve issue');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compliance Tracking</h1>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.map(issue => (
          <div key={issue.id} className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-l-4 ${issue.status === 'RESOLVED' ? 'border-emerald-500' : issue.severity === 'HIGH' ? 'border-red-500' : issue.severity === 'MEDIUM' ? 'border-amber-500' : 'border-blue-500'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${issue.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                    {issue.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${issue.severity === 'HIGH' ? 'bg-red-100 text-red-800' : issue.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {issue.severity} Priority
                  </span>
                  {issue.isEscalated && (
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                      <AlertCircle size={12} /> <span>ESCALATED</span>
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{issue.description}</h3>
                
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  {issue.audit && (
                    <div className="flex items-center space-x-1">
                      <ShieldAlert size={16} /> <span>Source: {issue.audit.title}</span>
                    </div>
                  )}
                  {issue.dueDate && (
                    <div>Due: <span className="font-medium text-gray-700 dark:text-gray-300">{new Date(issue.dueDate).toLocaleDateString()}</span></div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-3 min-w-[200px]">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    {issue.owner ? issue.owner.user.firstName[0] : <UserPlus size={16} />}
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500 text-xs">Assigned to</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {issue.owner ? `${issue.owner.user.firstName} ${issue.owner.user.lastName}` : 'Unassigned'}
                    </p>
                  </div>
                </div>
                
                {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') && issue.status !== 'RESOLVED' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => resolveIssue(issue.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-sm font-medium transition-colors flex justify-center items-center space-x-1"
                    >
                      <CheckCircle2 size={16} /> <span>Resolve</span>
                    </button>
                    <button 
                      onClick={() => escalateIssue(issue.id, issue.isEscalated)}
                      className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors border ${issue.isEscalated ? 'border-gray-300 text-gray-700 hover:bg-gray-50' : 'border-purple-300 text-purple-700 hover:bg-purple-50'}`}
                    >
                      {issue.isEscalated ? 'De-escalate' : 'Escalate'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {issues.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">All Clear!</h3>
            <p className="text-gray-500">There are no open compliance issues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compliance;
