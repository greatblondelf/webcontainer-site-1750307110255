import React, { useState, useRef } from 'react';
import RandomColorButton from './components/RandomColorButton';
import UploadExtractFlow from './components/UploadExtractFlow';
import ApiDebugger from './components/ApiDebugger';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [apiCalls, setApiCalls] = useState([]);
  const [createdObjects, setCreatedObjects] = useState([]);

  const addApiCall = (call) => {
    setApiCalls(prev => [...prev, { ...call, timestamp: new Date().toISOString() }]);
  };

  const addCreatedObject = (objectName) => {
    setCreatedObjects(prev => [...prev, objectName]);
  };

  const clearObjects = async () => {
    for (const objectName of createdObjects) {
      try {
        await fetch(`https://builder.impromptu-labs.com/api_tools/objects/${objectName}`, {
          method: 'DELETE'
        });
        addApiCall({
          type: 'DELETE',
          url: `/objects/${objectName}`,
          status: 'success'
        });
      } catch (error) {
        addApiCall({
          type: 'DELETE',
          url: `/objects/${objectName}`,
          status: 'error',
          error: error.message
        });
      }
    }
    setCreatedObjects([]);
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Random Color Button App
              </h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Random Color Button Section */}
          <section className="mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Interactive Color Button
              </h2>
              <RandomColorButton />
            </div>
          </section>

          {/* Upload & Extract Flow */}
          <section className="mb-12">
            <UploadExtractFlow 
              onApiCall={addApiCall}
              onObjectCreated={addCreatedObject}
            />
          </section>

          {/* API Management */}
          <section className="mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                API Management
              </h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={clearObjects}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  disabled={createdObjects.length === 0}
                >
                  Delete All Objects ({createdObjects.length})
                </button>
              </div>
            </div>
          </section>

          {/* API Debugger */}
          <ApiDebugger 
            apiCalls={apiCalls} 
            createdObjects={createdObjects}
            onApiCall={addApiCall}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
