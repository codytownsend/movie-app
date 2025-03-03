// src/modals/CreateListModal.js
import React from 'react';
import { X, Plus } from 'lucide-react';

const CreateListModal = ({ colorScheme, setShowCreateList, handleCreateList, showToast, darkMode }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setShowCreateList(false)}>
      <div 
        className={`${colorScheme.card} w-11/12 max-w-md rounded-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-bold ${colorScheme.text}`}>Create New List</h2>
            <button onClick={() => setShowCreateList(false)}>
              <X className={`w-6 h-6 ${colorScheme.text}`} />
            </button>
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>List Title</label>
            <input
              type="text"
              className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
              placeholder="e.g., My Favorite Sci-Fi Movies"
              id="listTitle"
            />
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>Description</label>
            <textarea
              className={`w-full px-3 py-2 rounded-lg border ${colorScheme.border} bg-transparent ${colorScheme.text}`}
              rows="3"
              placeholder="What's this list about?"
              id="listDescription"
            ></textarea>
          </div>
          <div className="mb-4">
            <div className="flex items-center">
              <input type="checkbox" id="public-list" className="mr-2" defaultChecked />
              <label htmlFor="public-list" className={colorScheme.text}>Make this list public</label>
            </div>
            <p className={`text-xs ${colorScheme.textSecondary} mt-1`}>
              Public lists can be seen by your friends and followers
            </p>
          </div>
          <div className="mb-4">
            <label className={`block text-sm font-medium ${colorScheme.text} mb-2`}>Add Movies</label>
            <p className={`text-xs ${colorScheme.textSecondary} mb-2`}>
              You can add more movies later
            </p>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-3 rounded-lg flex justify-center items-center h-24`}>
              <button 
                className={`flex flex-col items-center ${colorScheme.textSecondary}`}
                onClick={() => showToast("Movie selection would open here")}
              >
                <Plus className="w-8 h-8 mb-1" />
                <span className="text-sm">Add movies from your watchlist</span>
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              className="mr-3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600"
              onClick={() => setShowCreateList(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              onClick={() => {
                handleCreateList({
                  title: "My Favorite Movies",
                  description: "A collection of movies I love",
                  movies: [],
                  public: true
                });
              }}
            >
              Create List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;
