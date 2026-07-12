import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password, firstName, lastName });
      navigate('/login');
    } catch (error) {
      alert('Error creating account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-96 border border-gray-100 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-8">Join EcoSphere</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
              <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white px-4 py-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
              <input type="text" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white px-4 py-2" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input type="email" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white px-4 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input type="password" className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 dark:bg-gray-700 dark:text-white px-4 py-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors">
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
