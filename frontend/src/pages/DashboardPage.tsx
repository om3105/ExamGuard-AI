
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
   const { username, logout } = useAuth();
   const navigate = useNavigate();

   const handleLogout = () => {
      logout();
      navigate('/login');
   };

   return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
         {/* Navigation Bar */}
         <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex justify-between h-16">
                  <div className="flex items-center gap-3">
                     <img src="/src/assets/logo.png" alt="ExamGuard Logo" className="w-12 h-12 object-contain" />
                     <span className="font-bold text-xl tracking-tight text-gray-800">ExamGuard <span className="text-blue-600">Global</span></span>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-sm font-semibold text-gray-700">{username}</span>
                        <span className="text-xs text-gray-500">Candidate ID: 8492-2024</span>
                     </div>
                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                        {username?.charAt(0).toUpperCase()}
                     </div>
                     <button
                        onClick={handleLogout}
                        className="ml-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                     >
                        Sign Out
                     </button>
                  </div>
               </div>
            </div>
         </nav>

         {/* Main Content */}
         <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Welcome Section */}
            <div className="mb-8">
               <h1 className="text-2xl font-bold text-gray-800">Candidate Dashboard</h1>
               <p className="text-gray-500 mt-1">Manage your assessments and view your performance reports.</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               {/* Card 1 */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">System Status</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">Ready</p>
                     </div>
                     <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Verified</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                     Browser, Camera, and Network checks passed.
                  </div>
               </div>

               {/* Card 2 */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Biometric Profile</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">98%</p>
                     </div>
                     <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                     Keystroke dynamics calibrated successfully.
                  </div>
               </div>

               {/* Card 3 */}
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                     <div>
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pending Exams</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                     </div>
                     <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">View All</span>
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                     No assessments scheduled for this week.
                  </div>
               </div>
            </div>

            {/* Action Area / Empty State */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800">Assigned Assessments</h2>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Refresh List</button>
               </div>

               <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Exams Assigned</h3>
                  <p className="text-gray-500 max-w-sm mt-2">
                     You currently have no pending assessments. Check back later or contact your recruitment coordinator.
                  </p>
               </div>
            </section>

         </main>
      </div>
   );
};

export default DashboardPage;
