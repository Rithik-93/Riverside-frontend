import React from 'react';
import { useParams } from 'react-router-dom';

const PodcastDetailsPage: React.FC = () => {
  const { username, studioId, projectId } = useParams<{ 
    username: string; 
    studioId: string; 
    projectId: string; 
  }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Podcast Details
              </h1>
              <p className="text-gray-600">
                Studio: {username}-{studioId} | Project: {projectId}
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Podcast Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Title</label>
                      <p className="text-gray-900">Sample Podcast Episode</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Description</label>
                      <p className="text-gray-900">This is a sample podcast episode description.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Duration</label>
                      <p className="text-gray-900">45:30</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created</label>
                      <p className="text-gray-900">September 21, 2024</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Audio Player</h2>
                  <div className="bg-gray-200 rounded-lg p-8 text-center">
                    <p className="text-gray-600">Audio player will be implemented here</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-100 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Actions</h2>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Download
                    </button>
                    <button className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      Share
                    </button>
                    <button className="w-full bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                      Edit
                    </button>
                    <button className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Views</span>
                      <span className="font-semibold">1,234</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads</span>
                      <span className="font-semibold">567</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shares</span>
                      <span className="font-semibold">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastDetailsPage;
