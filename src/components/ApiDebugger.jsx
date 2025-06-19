import React, { useState } from 'react';

const ApiDebugger = ({ apiCalls, createdObjects, onApiCall }) => {
  const [showRawData, setShowRawData] = useState(false);
  const [selectedObject, setSelectedObject] = useState('');
  const [objectData, setObjectData] = useState(null);

  const fetchObjectData = async () => {
    if (!selectedObject) return;

    try {
      const response = await fetch(`https://builder.impromptu-labs.com/api_tools/return_data/${selectedObject}`);
      const data = await response.json();
      
      onApiCall({
        type: 'GET',
        url: `/return_data/${selectedObject}`,
        status: response.ok ? 'success' : 'error'
      });

      if (response.ok) {
        setObjectData(data);
      }
    } catch (error) {
      onApiCall({
        type: 'GET',
        url: `/return_data/${selectedObject}`,
        status: 'error',
        error: error.message
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            API Debugger
          </h3>
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Object Data Viewer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            View Object Data
          </label>
          <div className="flex space-x-3">
            <select
              value={selectedObject}
              onChange={(e) => setSelectedObject(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select an object...</option>
              {createdObjects.map((obj) => (
                <option key={obj} value={obj}>{obj}</option>
              ))}
            </select>
            <button
              onClick={fetchObjectData}
              disabled={!selectedObject}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
            >
              Fetch Data
            </button>
          </div>
          
          {objectData && (
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200">
                {JSON.stringify(objectData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* API Calls Log */}
        {showRawData && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              API Calls Log ({apiCalls.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {apiCalls.map((call, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    call.status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      call.type === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      call.type === 'POST' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      call.type === 'DELETE' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {call.type}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(call.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white font-mono">
                    {call.url}
                  </div>
                  {call.body && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                        Request Body
                      </summary>
                      <pre className="mt-2 text-xs text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                        {JSON.stringify(call.body, null, 2)}
                      </pre>
                    </details>
                  )}
                  {call.error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      Error: {call.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Created Objects */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Created Objects ({createdObjects.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {createdObjects.map((obj) => (
              <span
                key={obj}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {obj}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDebugger;
