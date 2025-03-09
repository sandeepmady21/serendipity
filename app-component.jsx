import React, { useState } from 'react';
import Search from './Search';
import ContentTree from './ContentTree';
import ContentContainer from './ContentContainer';

const App = () => {
  // Sample content object for ContentContainer
  const [contentObj, setContentObj] = useState({
    type: 'topic',
    topic: 'Astronomy',
    title: 'Hubble Space Telescope',
    content: 'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990 and remains in operation. It is one of the largest and most versatile space telescopes, renowned for its groundbreaking discoveries and detailed images of space.',
    reference: {
      source: 'https://example.com/hubble',
      timestamp: '2023-07-15',
      author: 'NASA'
    }
  });

  // Handle content changes from ContentTree or ContentContainer
  const handleContentChange = (newContent) => {
    setContentObj(newContent);
  };

  return (
    <div className="font-roboto min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="text-xl font-semibold text-indigo-600">SuperMemo Clone</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <Search />
        </div>

        {/* Content Area - Split View */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Panel - Content Tree */}
          <div className="md:w-1/3">
            <ContentTree onSelectContent={handleContentChange} />
          </div>

          {/* Right Panel - Content Container */}
          <div className="md:w-2/3">
            <ContentContainer 
              contentObj={contentObj} 
              onContentChange={handleContentChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;