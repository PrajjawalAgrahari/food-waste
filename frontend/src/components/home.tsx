import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    navigate('/login', { state: { role } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-center text-gray-900">
            Food Donation Platform
          </h1>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Choose Your Role
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select whether you want to donate food or receive donations
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <button
            onClick={() => handleRoleSelect('DONOR')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            I want to donate food
          </button>
          
          <button
            onClick={() => handleRoleSelect('RECEIVER')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            I need food donations
          </button>
          <button
            onClick={() => handleRoleSelect('ADMIN')}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            I am an admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
