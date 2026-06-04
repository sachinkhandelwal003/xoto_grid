import React from 'react';
import { useContext } from 'react';

const EmployeeDashboard = () => {
  const stats = [
    { label: 'Total Leads', value: '156', change: '+12%', icon: 'fas fa-user-tag', trend: 'up' },
    { label: 'New Leads', value: '24', change: '+5%', icon: 'fas fa-user-plus', trend: 'up' },
    { label: 'Follow Ups', value: '42', change: '-3%', icon: 'fas fa-phone-alt', trend: 'down' },
    { label: 'Converted', value: '18', change: '+8%', icon: 'fas fa-check-circle', trend: 'up' },
    { label: 'Tasks Due', value: '7', change: '+2', icon: 'fas fa-tasks', trend: 'neutral' },
    { label: 'Documents', value: '23', change: '+4', icon: 'fas fa-file-alt', trend: 'up' },
  ];

  const recentActivity = [
    { action: 'Added new lead #4567', user: 'John Smith', time: '15 mins ago', icon: 'fas fa-user-tag', color: 'text-blue-500' },
    { action: 'Completed follow-up call', user: 'Sarah Johnson', time: '1 hour ago', icon: 'fas fa-phone-alt', color: 'text-green-500' },
    { action: 'Generated proposal document', user: 'You', time: '2 hours ago', icon: 'fas fa-file-contract', color: 'text-purple-500' },
    { action: 'Scheduled client meeting', user: 'Michael Brown', time: '5 hours ago', icon: 'fas fa-calendar-check', color: 'text-yellow-500' },
    { action: 'Converted lead to client', user: 'You', time: '1 day ago', icon: 'fas fa-check-circle', color: 'text-indigo-500' },
  ];

  const quickActions = [
    { title: 'Add Lead', icon: 'fas fa-user-plus', path: '/employee/leads/new' },
    { title: 'Create Task', icon: 'fas fa-tasks', path: '/employee/tasks/new' },
    { title: 'Generate Doc', icon: 'fas fa-file-alt', path: '/employee/documents/generate' },
    { title: 'Schedule Call', icon: 'fas fa-phone-alt', path: '/employee/leads/schedule' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Employee Dashboard
        </h1>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200">
            Export Report
          </button>
          <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
            Refresh Data
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <a
            key={index}
            href={action.path}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
              <i className={`${action.icon} text-indigo-600`}></i>
            </div>
            <span className="text-sm font-medium text-gray-700">{action.title}</span>
          </a>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.trend === 'up' ? 'bg-green-50' : stat.trend === 'down' ? 'bg-red-50' : 'bg-gray-50'} flex items-center justify-center`}>
                <i className={`${stat.icon} ${stat.trend === 'up' ? 'text-green-500' : stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}></i>
              </div>
            </div>
            <div className="mt-3 flex items-center">
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                {stat.change}
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Summary */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Leads Pipeline</h2>
            <select className="mt-2 sm:mt-0 px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-600 bg-white">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
            </select>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="mt-2 text-gray-500">Leads pipeline visualization</p>
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">Lead Sources</h2>
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6">
              <svg
                className="w-40 h-40 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
            
            <div className="w-full space-y-3">
              {[
                { source: 'Website', percentage: 40, color: 'bg-indigo-500' },
                { source: 'Referral', percentage: 25, color: 'bg-green-500' },
                { source: 'Social Media', percentage: 20, color: 'bg-blue-500' },
                { source: 'Events', percentage: 10, color: 'bg-yellow-500' },
                { source: 'Other', percentage: 5, color: 'bg-gray-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${item.color}`} />
                    <p className="text-sm text-gray-600">{item.source}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{item.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All Activity
          </button>
        </div>
        
        <div className="space-y-4">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start pb-4 border-b border-gray-100 last:border-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} bg-opacity-10 mr-3`}>
                <i className={`${item.icon} ${item.color} text-lg`}></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.user} <span className="font-normal text-gray-600">{item.action}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{item.time}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;