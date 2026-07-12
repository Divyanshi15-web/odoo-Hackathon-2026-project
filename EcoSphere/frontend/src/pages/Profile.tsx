
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">EcoSphere Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-gray-500 dark:text-gray-400">{user.email} &bull; {user.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <h3 className="text-emerald-800 dark:text-emerald-300 font-medium">Environmental Goals</h3>
              <p className="text-3xl font-bold text-emerald-600 mt-2">0</p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="text-blue-800 dark:text-blue-300 font-medium">CSR Hours</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <h3 className="text-purple-800 dark:text-purple-300 font-medium">Badges Earned</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
