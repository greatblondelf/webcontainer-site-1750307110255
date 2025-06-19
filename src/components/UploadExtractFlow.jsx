import React, { useState, useRef } from 'react';

const UploadExtractFlow = ({ onApiCall, onObjectCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setUploadedFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const processFile = async () => {
    if (!uploadedFile || !prompt.trim()) return;

    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // Step 1: Upload file data
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileContent = e.target.result;
        const objectName = `uploaded_${Date.now()}`;

        // Input data API call
        const inputResponse = await fetch('https://builder.impromptu-labs.com/api_tools/input_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            created_object_name: objectName,
            data_type: 'strings',
            input_data: [fileContent]
          })
        });

        onApiCall({
          type: 'POST',
          url: '/input_data',
          body: {
            created_object_name: objectName,
            data_type: 'strings',
            input_data: [fileContent]
          },
          status: inputResponse.ok ? 'success' : 'error'
        });

        if (inputResponse.ok) {
          onObjectCreated(objectName);

          // Step 2: Apply prompt
          const processedObjectName = `processed_${Date.now()}`;
          const promptResponse = await fetch('https://builder.impromptu-labs.com/api_tools/apply_prompt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              created_object_names: [processedObjectName],
              prompt_string: prompt,
              inputs: [{
                object_name: objectName,
                processing_mode: 'combine_events'
              }]
            })
          });

          onApiCall({
            type: 'POST',
            url: '/apply_prompt',
            body: {
              created_object_names: [processedObjectName],
              prompt_string: prompt,
              inputs: [{
                object_name: objectName,
                processing_mode: 'combine_events'
              }]
            },
            status: promptResponse.ok ? 'success' : 'error'
          });

          if (promptResponse.ok) {
            onObjectCreated(processedObjectName);

            // Step 3: Get results
            const resultResponse = await fetch(`https://builder.impromptu-labs.com/api_tools/return_data/${processedObjectName}`);
            const resultData = await resultResponse.json();

            onApiCall({
              type: 'GET',
              url: `/return_data/${processedObjectName}`,
              status: resultResponse.ok ? 'success' : 'error'
            });

            if (resultResponse.ok) {
              setExtractedData(resultData.text_value);
              setCurrentStep(3);
            }
          }
        }
      };
      reader.readAsText(uploadedFile);
    } catch (error) {
      onApiCall({
        type: 'ERROR',
        error: error.message,
        status: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (!extractedData) return;
    
    const blob = new Blob([extractedData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extracted_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setUploadedFile(null);
    setExtractedData(null);
    setPrompt('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Upload & Extract Flow
        </h2>
        <div className="flex items-center mt-4 space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  currentStep > step 
                    ? 'bg-primary-600' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload File
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="text-4xl">📄</div>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Drop your file here
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      or click to browse
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Choose File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".txt,.csv,.json,.md"
                    aria-label="File upload input"
                  />
                </div>
              </div>
              {uploadedFile && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Selected: {uploadedFile.name}
                </p>
              )}
            </div>

            {/* Prompt Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Processing Instructions
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter instructions for processing the file..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={4}
                aria-describedby="prompt-help"
              />
              <p id="prompt-help" className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {prompt.length}/500 characters
              </p>
            </div>

            <button
              onClick={processFile}
              disabled={!uploadedFile || !prompt.trim()}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
              aria-label="Process uploaded file with instructions"
            >
              Process File
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Processing your file...
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              This may take a few moments
            </p>
            <button
              onClick={() => {
                setIsProcessing(false);
                setCurrentStep(1);
              }}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Extraction Results
              </h3>
              <div className="space-x-3">
                <button
                  onClick={downloadCSV}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Download CSV
                </button>
                <button
                  onClick={resetFlow}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Start Over
                </button>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {extractedData}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExtractFlow;
