import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Dummy search results data
  const [searchResults, setSearchResults] = useState([
    { type: 'Topic', category: 'Physics', title: 'What is hubble telescope' },
    { type: 'Topic', category: 'Astronomy', title: 'Hubble deep field image' },
    { type: 'Flashcard', category: 'Telescope', title: 'Who invented Hubble Telescope' },
    { type: 'Flashcard', category: 'Astronomy', title: 'When was Hubble launched' },
    { type: 'Topic', category: 'Space', title: 'Hubble telescope discoveries' },
    { type: 'Topic', category: 'Astrophysics', title: 'Red shift and hubble constant' },
    { type: 'Flashcard', category: 'History', title: 'Why is it called Hubble telescope' },
    { type: 'Topic', category: 'Engineering', title: 'How does the hubble telescope work' }
  ]);

  // Filtered results based on search term
  const filteredResults = searchTerm.length > 0
    ? searchResults.filter(result => 
        result.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownVisible(e.target.value.length > 0);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
    setIsDropdownVisible(false);
    inputRef.current.focus();
  };

  // Highlight matching text
  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Search topics and flashcards..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchTerm.length > 0) setIsDropdownVisible(true);
          }}
        />
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={clearSearch}
          >
            <FontAwesomeIcon icon={faTimesCircle} className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isDropdownVisible && filteredResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-sm overflow-hidden"
        >
          {filteredResults.map((result, index) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                // Handle result selection
                setIsDropdownVisible(false);
              }}
            >
              <div className="flex items-start">
                <span className="text-xs font-semibold text-indigo-600 mr-1">
                  {result.type}:
                </span>
                <span className="text-gray-600 mr-1">{result.category} |</span>
                <span className="text-gray-800">
                  {highlightMatch(result.title, searchTerm)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;