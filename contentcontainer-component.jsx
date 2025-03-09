import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEdit, 
  faSave, 
  faExternalLinkAlt, 
  faClock, 
  faUser 
} from '@fortawesome/free-solid-svg-icons';

const ContentContainer = ({ contentObj, onContentChange }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [localContent, setLocalContent] = useState(contentObj);

  // Update local content when props change
  useEffect(() => {
    setLocalContent(contentObj);
  }, [contentObj]);

  // Get topic category color
  const getTopicColor = (topic) => {
    const topicColors = {
      'Astronomy': 'bg-blue-500',
      'Physics': 'bg-purple-500',
      'Telescope': 'bg-green-500',
      'Space': 'bg-indigo-500',
      'History': 'bg-yellow-500',
      'Engineering': 'bg-red-500',
      'New Topic': 'bg-gray-500'
    };
    
    return topicColors[topic] || 'bg-gray-500';
  };

  // Get type badge color
  const getTypeColor = (type) => {
    return type === 'topic' 
      ? 'bg-blue-100 text-blue-800 border-blue-200' 
      : 'bg-purple-100 text-purple-800 border-purple-200';
  };

  // Handle title change
  const handleTitleChange = (e) => {
    setLocalContent({
      ...localContent,
      title: e.target.value
    });
  };

  // Handle content change
  const handleContentChange = (e) => {
    setLocalContent({
      ...localContent,
      content: e.target.value
    });
  };

  // Save changes
  const saveChanges = (field) => {
    if (field === 'title') {
      setIsEditingTitle(false);
    } else if (field === 'content') {
      setIsEditingContent(false);
    }
    
    // Notify parent component of changes
    if (onContentChange) {
      onContentChange(localContent);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      {/* Header with type and topic tags */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        {/* Topic tag */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTopicColor(localContent.topic)} text-white`}>
          {localContent.topic}
        </span>
        
        {/* Type tag */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(localContent.type)}`}>
          {localContent.type.charAt(0).toUpperCase() + localContent.type.slice(1)}
        </span>
      </div>
      
      {/* Title section */}
      <div className="p-4 border-b border-gray-200">
        {isEditingTitle ? (
          <div className="flex items-center">
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={localContent.title}
              onChange={handleTitleChange}
              autoFocus
            />
            <button
              className="ml-2 p-2 bg-green-50 text-green-600 rounded hover:bg-green-100"
              onClick={() => saveChanges('title')}
            >
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">{localContent.title}</h2>
            <button
              className="p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsEditingTitle(true)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-4 border-b border-gray-200">
        {isEditingContent ? (
          <div className="flex flex-col">
            <textarea
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows="8"
              value={localContent.content}
              onChange={handleContentChange}
              autoFocus
            />
            <div className="flex justify-end mt-2">
              <button
                className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                onClick={() => saveChanges('content')}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="text-gray-700 whitespace-pre-line min-h-[200px]">
              {localContent.content}
            </div>
            <button
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsEditingContent(true)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
        )}
      </div>
      
      {/* Reference section */}
      {localContent.reference && (
        <div className="p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-500 mb-2">References</h3>
          <div className="text-sm text-gray-600 space-y-2">
            {localContent.reference.source && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2 text-gray-400" />
                <a 
                  href={localContent.reference.source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {localContent.reference.source}
                </a>
              </div>
            )}
            {localContent.reference.timestamp && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                <span>{localContent.reference.timestamp}</span>
              </div>
            )}
            {localContent.reference.author && (
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-400" />
                <span>{localContent.reference.author}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentContainer;