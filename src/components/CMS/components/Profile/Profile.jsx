import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Navigate } from 'react-router-dom';
import { logoutUser } from '../../../../manageApi/store/authSlice';
import axios from 'axios';
import {
  EnvelopeIcon,
  PhoneIcon,
  HomeIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  IdentificationIcon,
  AcademicCapIcon,
  DocumentIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const token = useSelector((state) => state.auth?.token);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Redirect to login if not authenticated
  // if (!user || !token) {
  //   return <Navigate to="/sawtar/login" replace />;
  // }

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://kotiboxglobaltech.online/api/customer/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data.success) {
          setUserData(response.data.customer);
        } else {
          setError('Failed to load profile data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  // Handle loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-orange-500 flex items-center justify-center text-white text-5xl font-bold mb-4">
                  {userData?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 text-center">
                {userData?.name || 'Customer'}
              </h2>
              
              <p className="text-gray-500 text-sm text-center mb-4">
                {userData?.role?.name || 'Customer'}
              </p>
              
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 mb-6">
                {userData?.status?.charAt(0).toUpperCase() + userData?.status?.slice(1) || 'Active'}
              </span>
              
              <div className="w-full border-t border-gray-200 pt-4">
                <ul className="space-y-3 w-full">
                  <li className="flex items-center">
                    <EnvelopeIcon className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-600 truncate">{userData?.email || 'N/A'}</span>
                  </li>
                  
                  <li className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">{userData?.phone || 'N/A'}</span>
                  </li>
                  
                  <li className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">
                      Joined {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </li>
                  
                  <li className="flex items-center">
                    <IdentificationIcon className="h-5 w-5 text-orange-500 mr-3" />
                    <span className="text-gray-600">ID: {userData?._id || 'N/A'}</span>
                  </li>
                </ul>
              </div>
              
              <div className="w-full mt-6 space-y-3">
                <button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
                  // onClick={() => navigate('/sawtar/cms?role=customer')}
                >
                  Dashboard
                </button>
                
                <button
                  className="w-full border border-orange-500 text-orange-500 hover:bg-orange-50 py-2 px-4 rounded"
                  onClick={() => {
                    dispatch(logoutUser());
                    navigate('/sawtar/login');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'overview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <UserIcon className={`h-5 w-5 mr-2 ${activeTab === 'overview' ? 'text-orange-500' : 'text-gray-400'}`} />
                  Overview
                </button>
                
                <button
                  onClick={() => setActiveTab('address')}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'address' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <MapPinIcon className={`h-5 w-5 mr-2 ${activeTab === 'address' ? 'text-orange-500' : 'text-gray-400'}`} />
                  Address
                </button>
                
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'professional' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <BriefcaseIcon className={`h-5 w-5 mr-2 ${activeTab === 'professional' ? 'text-orange-500' : 'text-gray-400'}`} />
                  Professional
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'documents' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  <DocumentIcon className={`h-5 w-5 mr-2 ${activeTab === 'documents' ? 'text-orange-500' : 'text-gray-400'}`} />
                  Documents
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Full Name</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?.name || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData?.date_of_birth ? new Date(userData.date_of_birth).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Gender</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?.gender || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Marital Status</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?.maritalStatus || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Name</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userData?.emergencyContact?.name || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Relationship</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userData?.emergencyContact?.relationship || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Phone</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {userData?.emergencyContact?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {userData?.skills?.length > 0 ? (
                      userData.skills.map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No skills listed</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Address Tab */}
              {activeTab === 'address' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Address Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData?.addresses?.length > 0 ? (
                      userData.addresses.map((addr, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center mb-4">
                            <HomeIcon className="h-6 w-6 text-orange-500 mr-2" />
                            <h4 className="text-base font-medium text-gray-900">Address {index + 1}</h4>
                          </div>
                          <p className="text-gray-600">
                            {addr.street || ''}, {addr.city || ''}, {addr.state || ''} {addr.zip || ''}, {addr.country || ''}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-gray-500">
                        No addresses on file
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Professional Tab */}
              {activeTab === 'professional' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Professional Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Occupation</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?.occupation || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Industry</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?.industry || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Customer ID</label>
                      <p className="mt-1 text-sm text-gray-900">{userData?._id || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Member Since</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
                  
                  <ul className="divide-y divide-gray-200">
                    {userData?.education?.length > 0 ? (
                      userData.education.map((edu, index) => (
                        <li key={index} className="py-4">
                          <div className="flex items-start">
                            <AcademicCapIcon className="h-6 w-6 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                              <p className="text-sm text-gray-500">{edu.institution} ({edu.year})</p>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No education history listed</p>
                    )}
                  </ul>
                </div>
              )}
              
              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Documents</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {userData?.documents?.length > 0 ? (
                      userData.documents.map((doc, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 flex items-start">
                          <div className="bg-orange-100 p-3 rounded-lg mr-4">
                            <DocumentIcon className="h-6 w-6 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.type}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center text-gray-500">
                        No documents on file
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
                  >
                    Upload New Document
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;