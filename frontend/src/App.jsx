import React, { useState } from 'react';

// --- Icons (Inline SVGs to avoid dependency install issues) ---
const Icons = {
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Refresh: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  )
};

const App = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_URL = 'https://Subhrapratim07-Dog-Emotion-API-Docker.hf.space/predict'; 

  // Helper: Get Emoji for Emotion
  const getEmotionEmoji = (emotion) => {
    const map = {
      happy: '🥰',
      sad: '🥺',
      angry: '😠',
      relaxed: '😌',
      scared: '😨',
      playful: '🎾',
      aggressive: '😡'
    };
    return map[emotion.toLowerCase()] || '🐶';
  };

  // Helper: Get Color for Probability Bar
  const getBarColor = (value) => {
    if (value > 75) return 'bg-green-500';
    if (value > 50) return 'bg-blue-500';
    if (value > 25) return 'bg-yellow-400';
    return 'bg-gray-400';
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setPrediction(null);
      setError(null);
    }
  };

  const resetApp = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrediction(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);
    setPrediction(null);
    
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Logic from original code (Exponential backoff)
      const MAX_RETRIES = 3;
      let delay = 1000;
      let response = null;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          response = await fetch(API_URL, { method: 'POST', body: formData });
          if (response.status !== 429) break; 
        } catch (e) { /* ignore */ }
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; 
        }
      }

      if (!response || !response.ok) {
        throw new Error("Could not connect to the analysis engine.");
      }

      const data = await response.json();
      setPrediction(data);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Background Wrapper
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 relative overflow-hidden flex items-center justify-center p-4">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      {/* Main Glass Card */}
      <div className="relative bg-white/60 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Side: Upload & Input */}
        <div className="w-full md:w-5/12 p-8 flex flex-col border-r border-white/20">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
              <span className="text-4xl">🐾</span> PawFeel
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium">
              AI-Powered Dog Emotion Scanner
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            
            {/* Conditional Rendering for Upload Area or Preview */}
            {!previewUrl ? (
              <label 
                htmlFor="file-upload" 
                className="flex-1 border-4 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
              >
                <div className="bg-white p-4 rounded-full shadow-md mb-3 group-hover:scale-110 transition-transform">
                  <Icons.Upload />
                </div>
                <span className="text-gray-500 font-semibold group-hover:text-indigo-600">Click to upload photo</span>
                <span className="text-gray-400 text-xs mt-1">Supports JPG, PNG</span>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            ) : (
              <div className="flex-1 relative rounded-2xl overflow-hidden shadow-lg border-4 border-white group">
                 <img src={previewUrl} alt="Dog Preview" className="w-full h-full object-cover" />
                 <button 
                    type="button"
                    onClick={resetApp}
                    className="absolute top-3 right-3 bg-white/90 text-gray-700 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors shadow-sm"
                    title="Remove Image"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
            )}

            {/* Action Button */}
            <button 
              type="submit" 
              disabled={!selectedFile || isLoading}
              className={`
                w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2
                transition-all duration-300 transform
                ${!selectedFile 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : isLoading 
                    ? 'bg-indigo-400 cursor-wait' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-indigo-500/30'}
              `}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <Icons.Sparkles /> Analyze Emotion
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Results & Decor */}
        <div className="w-full md:w-7/12 bg-white/40 p-8 flex flex-col justify-center relative">
          
          {/* Default State (No prediction) */}
          {!prediction && !isLoading && !error && (
            <div className="text-center opacity-60">
               <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-6xl">🐶</span>
               </div>
               <h3 className="text-2xl font-bold text-gray-700">Ready to understand your pet?</h3>
               <p className="text-gray-500 mt-2 max-w-xs mx-auto">Upload a clear photo of your dog's face to get started.</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center animate-pulse">
               <div className="text-4xl mb-2">📡</div>
               <h3 className="text-red-600 font-bold mb-1">Oops! Something went wrong.</h3>
               <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Success State */}
          {prediction && (
            <div className="animate-fade-in-up">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Primary Emotion</p>
                  <h2 className="text-5xl font-extrabold text-gray-800 mt-1 flex items-center gap-3">
                    {prediction.predicted_emotion.charAt(0).toUpperCase() + prediction.predicted_emotion.slice(1)}
                    <span className="animate-bounce">{getEmotionEmoji(prediction.predicted_emotion)}</span>
                  </h2>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-black text-indigo-600">{prediction.confidence}%</div>
                   <div className="text-xs text-gray-500 font-bold">CONFIDENCE</div>
                </div>
              </div>

              <div className="bg-white/50 rounded-2xl p-6 shadow-sm border border-white/60">
                <h3 className="text-gray-700 font-bold mb-4 flex items-center gap-2">
                  <Icons.Image /> Analysis Breakdown
                </h3>
                <div className="space-y-4">
                  {Object.entries(prediction.full_probabilities)
                    .sort(([,a], [,b]) => b - a) // Sort by probability
                    .slice(0, 5) // Top 5 only
                    .map(([emotion, probability]) => (
                    <div key={emotion}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-gray-600 capitalize">{emotion}</span>
                        <span className="font-mono text-gray-500">{probability.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${getBarColor(probability)}`} 
                          style={{ width: `${probability}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full text-gray-500 text-xs font-medium opacity-60">
         Powered by Bipasha • Designed for Dog Lovers
      </div>
    </div>
  );
};

export default App;