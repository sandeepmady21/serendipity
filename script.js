/**
 * Serendipity Learn - A cross-disciplinary learning application
 * 
 * Key features:
 * - Hierarchical nested extracts (extracts can be created from other extracts)
 * - Inline content editing (edit text directly)
 * - Content tree navigation
 * - Flashcards with spaced repetition
 */

// ========================
// LLM Integration Module
// ========================

const LLMService = {
    config: {
      endpoint: "http://localhost:11434/api/generate",
      model: "mistral" // Use whichever model you've pulled
    },
    
    /**
     * Call the LLM API with a prompt
     * @param {string} prompt - The prompt to send to the LLM
     * @param {number} temperature - Controls randomness (0-1)
     * @returns {Promise<string>} - The LLM response
     */
    async callLLM(prompt, temperature = 0.7) {
      try {
        console.log("Sending to Ollama:", prompt);
        const response = await fetch(this.config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: this.config.model,
            prompt: prompt,
            temperature: temperature,
            stream: false
          })
        });
        
        const data = await response.json();
        console.log("Received from Ollama:", data.response);
        return data.response;
      } catch (error) {
        console.error("Error calling Ollama API:", error);
        return null;
      }
    }
  };
  
  // ========================
  // Content Tree Module
  // ========================
  
  const ContentTreeManager = {
    /**
     * Initialize the content tree
     */
    init() {
      this.renderContentTree();
    },
    
    /**
     * Render the content tree based on current content items
     */
    renderContentTree() {
      const treeContainer = document.getElementById('contentTree');
      treeContainer.innerHTML = '';
      
      // Get references to the current active item
      const currentItem = ContentManager.getCurrentItem();
      
      // First add all topics
      ContentManager.sections.forEach(section => {
        const topicId = section.id;
        const topicTitle = section.querySelector('h2').textContent;
        const topicType = section.getAttribute('data-topic');
        
        // Create topic item
        const topicElement = document.createElement('div');
        topicElement.className = 'tree-item tree-topic';
        topicElement.setAttribute('data-id', topicId);
        topicElement.textContent = topicTitle;
        
        // Make it active if this is the current item
        if (currentItem && currentItem.id === topicId) {
          topicElement.classList.add('active');
        }
        
        // Add topic click handler
        topicElement.addEventListener('click', () => {
          this.navigateToItem(topicId);
        });
        
        treeContainer.appendChild(topicElement);
        
        // Add a recursive function to add extracts and their children
        this.addExtractsToTree(treeContainer, topicId, currentItem, 0);
      });
    },
    
    /**
   * Recursively add extracts and their child extracts to the tree
   * @param {HTMLElement} container - Container element to add items to
   * @param {string} parentId - ID of the parent element
   * @param {Object} currentItem - Currently active item (if any)
   * @param {number} level - Nesting level (0 = direct child of topic)
   */
  addExtractsToTree(container, parentId, currentItem, level) {
    // Get direct extracts for this parent
    const extracts = ContentManager.getDirectChildren(parentId);
    
    extracts.forEach(extractId => {
      const extract = document.getElementById(extractId);
      if (!extract) return; // Skip if extract doesn't exist
      
      // Get first sentence from extract text
      const extractText = extract.querySelector('p').textContent;
      const firstSentenceMatch = extractText.match(/^[^.!?]+[.!?]/);
      let displayText = firstSentenceMatch ? firstSentenceMatch[0].trim() : extractText.substring(0, 60) + "...";
      
      // Truncate if too long
      displayText = this.truncateText(displayText, 60);
      
      // Choose CSS class based on nesting level
      let treeItemClass = 'tree-item tree-extract';
      if (level === 1) {
        treeItemClass = 'tree-item tree-nested-extract';
      } else if (level >= 2) {
        treeItemClass = 'tree-item tree-deep-nested-extract';
      }
      
      // Create extract item
      const extractElement = document.createElement('div');
      extractElement.className = treeItemClass;
      extractElement.setAttribute('data-id', extractId);
      extractElement.textContent = displayText;
      extractElement.title = extractText; // Show full text on hover
      
      // Make it active if this is the current item
      if (currentItem && currentItem.id === extractId) {
        extractElement.classList.add('active');
      }
      
      // Add extract click handler
      extractElement.addEventListener('click', () => {
        this.navigateToItem(extractId);
      });
      
      container.appendChild(extractElement);
      
      // Create a container for extract's children (flashcards and nested extracts)
      const extractChildrenContainer = document.createElement('div');
      extractChildrenContainer.className = 'extract-children';
      extractChildrenContainer.style.marginLeft = '15px'; // Proper indentation
      container.appendChild(extractChildrenContainer);
      
      // Add flashcards for this extract to the extract's children container
      this.addFlashcardsToTree(extractChildrenContainer, extractId, currentItem);
      
      // Recursively add child extracts to the extract's children container
      this.addNestedExtracts(extractChildrenContainer, extractId, currentItem, level + 1);
    });
  },
  
  /**
   * Add nested extracts to the tree (extracted from addExtractsToTree to separate concerns)
   * @param {HTMLElement} container - Container element to add items to
   * @param {string} parentId - ID of the parent extract
   * @param {Object} currentItem - Currently active item (if any)
   * @param {number} level - Nesting level
   */
  addNestedExtracts(container, parentId, currentItem, level) {
    // Get direct nested extracts for this parent extract
    const nestedExtracts = ContentManager.getDirectChildren(parentId);
    
    if (nestedExtracts.length > 0) {
      this.addExtractsToTree(container, parentId, currentItem, level);
    }
  },
  
  /**
   * Add flashcards for an extract to the tree
   * @param {HTMLElement} container - Container element to add items to
   * @param {string} extractId - ID of the parent extract
   * @param {Object} currentItem - Currently active item (if any)
   */
  addFlashcardsToTree(container, extractId, currentItem) {
    if (ContentManager.extractFlashcards[extractId]) {
      ContentManager.extractFlashcards[extractId].forEach(cardId => {
        const card = document.getElementById(cardId);
        if (!card) return; // Skip if card doesn't exist
        
        const cardQuestion = card.querySelector('.flashcard-question').textContent;
        const shortQuestion = this.truncateText(cardQuestion, 40);
        
        // Create flashcard item
        const cardElement = document.createElement('div');
        cardElement.className = 'tree-item tree-flashcard';
        cardElement.setAttribute('data-id', cardId);
        cardElement.textContent = shortQuestion;
        cardElement.title = cardQuestion; // Full question on hover
        
        // Make it active if this is the current item
        if (currentItem && currentItem.id === cardId) {
          cardElement.classList.add('active');
        }
        
        // Add flashcard click handler
        cardElement.addEventListener('click', () => {
          this.navigateToItem(cardId);
        });
        
        container.appendChild(cardElement);
      });
    }
  },
    
    /**
     * Navigate to a specific content item by ID
     * @param {string} itemId - The ID of the item to navigate to
     */
    navigateToItem(itemId) {
      // Find the item index in the content sequence
      const itemIndex = ContentManager.contentItems.findIndex(item => item.id === itemId);
      
      if (itemIndex !== -1) {
        ContentManager.currentItemIndex = itemIndex;
        ContentManager.showCurrentItem();
        this.updateActiveTreeItem(itemId);
      }
    },
    
    /**
     * Update the active item in the tree
     * @param {string} itemId - The ID of the active item
     */
    updateActiveTreeItem(itemId) {
      // Remove active class from all items
      document.querySelectorAll('.tree-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Add active class to the current item
      const activeItem = document.querySelector(`.tree-item[data-id="${itemId}"]`);
      if (activeItem) {
        activeItem.classList.add('active');
        
        // Scroll the item into view
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    
    /**
     * Truncate text to a specific length with ellipsis
     * @param {string} text - The text to truncate
     * @param {number} maxLength - The maximum length
     * @returns {string} - Truncated text
     */
    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    }
  };
  
  // ========================
  // Content Manager Module
  // ========================
  
  const ContentManager = {
    contentItems: [],
    sections: [],
    extracts: [],
    flashcards: [],
    topicExtracts: {}, // Maps topics to their extracts
    extractChildren: {}, // Maps extracts to their child extracts
    extractFlashcards: {}, // Maps extracts to their flashcards
    topicOrder: [],
    currentItemIndex: 0,
    
    /**
     * Initialize the content manager
     */
    init() {
      // Get DOM elements
      this.sections = document.querySelectorAll('.content-section');
      this.extracts = document.querySelectorAll('.extract');
      this.flashcards = document.querySelectorAll('.flashcard');
      
      // Set up content relationships
      this.mapContentRelationships();
      this.buildContentSequence();
      
      // Set up the content edit listeners
      this.setupEditableContent();
      
      // Set up extract selection handling
      this.setupExtractHandlers();
      
      // Initial display
      this.showCurrentItem();
    },
    
    /**
     * Map relationships between topics, extracts, and flashcards
     */
    mapContentRelationships() {
      // Initialize collections
      this.topicExtracts = {};
      this.extractChildren = {};
      this.extractFlashcards = {};
      
      // Map topics to extracts
      this.sections.forEach(section => {
        const topicId = section.id;
        this.topicExtracts[topicId] = [];
      });
      
      // Map extracts to parents and initialize flashcard mapping
      this.extracts.forEach(extract => {
        const extractId = extract.id;
        const parentId = extract.getAttribute('data-source');
        
        // Determine if parent is a topic or another extract
        if (parentId.startsWith('topic')) {
          // This extract has a topic as parent
          if (this.topicExtracts[parentId]) {
            this.topicExtracts[parentId].push(extractId);
          }
        } else {
          // This extract has another extract as parent
          if (!this.extractChildren[parentId]) {
            this.extractChildren[parentId] = [];
          }
          this.extractChildren[parentId].push(extractId);
        }
        
        // Initialize flashcard mapping
        this.extractFlashcards[extractId] = [];
      });
      
      // Map flashcards to extracts
      this.flashcards.forEach(card => {
        const cardId = card.id;
        const extractId = card.getAttribute('data-source');
        
        if (this.extractFlashcards[extractId]) {
          this.extractFlashcards[extractId].push(cardId);
        }
      });
    },
    
    /**
     * Get direct children of a parent (topic or extract)
     * @param {string} parentId - ID of the parent element
     * @returns {Array} - Array of direct child IDs
     */
    getDirectChildren(parentId) {
      if (parentId.startsWith('topic')) {
        return this.topicExtracts[parentId] || [];
      } else {
        return this.extractChildren[parentId] || [];
      }
    },
    
    /**
     * Create a randomized order of topics
     */
    createTopicOrder() {
      const topicIds = Array.from(this.sections).map(section => section.id);
      this.topicOrder = this.shuffleArray([...topicIds]);
    },
    
    /**
     * Shuffle array elements randomly
     * @param {Array} array - Array to shuffle
     * @returns {Array} - Shuffled array
     */
    shuffleArray(array) {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    },
    
    /**
     * Set up listeners for editable content
     */
    setupEditableContent() {
      // Listen for content changes in editable elements
      document.addEventListener('blur', (e) => {
        const target = e.target;
        if (target.hasAttribute('contenteditable') && target.getAttribute('contenteditable') === 'true') {
          // Content was edited, update the data structures if needed
          const container = target.closest('.content-section, .extract, .flashcard');
          if (container) {
            // After content changes, update the content tree
            this.buildContentSequence();
            ContentTreeManager.renderContentTree();
          }
        }
      }, true);
      
      // Set up edit buttons
      document.addEventListener('click', (e) => {
        if (e.target.closest('.edit-button')) {
          const container = e.target.closest('.content-section, .extract, .flashcard');
          if (container) {
            // Focus on the first editable element
            const editableElement = container.querySelector('[contenteditable="true"]');
            if (editableElement) {
              editableElement.focus();
            }
          }
        }
        
        // Handle delete buttons
        if (e.target.closest('.delete-button')) {
          const container = e.target.closest('.extract, .flashcard');
          if (container && confirm('Are you sure you want to delete this item?')) {
            this.deleteItem(container.id);
          }
        }
      });
    },
    
    /**
     * Delete an item and its children
     * @param {string} itemId - ID of the item to delete
     */
    deleteItem(itemId) {
      const item = document.getElementById(itemId);
      if (!item) return;
      
      // If it's an extract, also delete its children and flashcards
      if (item.classList.contains('extract')) {
        // Delete child extracts recursively
        const childExtracts = this.extractChildren[itemId] || [];
        childExtracts.forEach(childId => {
          this.deleteItem(childId);
        });
        
        // Delete flashcards
        const flashcards = this.extractFlashcards[itemId] || [];
        flashcards.forEach(cardId => {
          const card = document.getElementById(cardId);
          if (card) card.remove();
        });
        
        // Remove from parent's children list
        const parentId = item.getAttribute('data-source');
        if (parentId.startsWith('topic')) {
          this.topicExtracts[parentId] = this.topicExtracts[parentId].filter(id => id !== itemId);
        } else {
          this.extractChildren[parentId] = (this.extractChildren[parentId] || []).filter(id => id !== itemId);
        }
        
        // Clean up data structures
        delete this.extractChildren[itemId];
        delete this.extractFlashcards[itemId];
      }
      
      // Remove from DOM
      item.remove();
      
      // Update data structures
      this.extracts = document.querySelectorAll('.extract');
      this.flashcards = document.querySelectorAll('.flashcard');
      
      // Rebuild the content sequence
      this.mapContentRelationships();
      this.buildContentSequence();
      
      // Update the view
      if (this.contentItems.length > 0) {
        this.currentItemIndex = Math.min(this.currentItemIndex, this.contentItems.length - 1);
        this.showCurrentItem();
      }
      
      // Update the content tree
      ContentTreeManager.renderContentTree();
    },
    
    /**
     * Set up extract selection handling
     */
    setupExtractHandlers() {
      document.addEventListener('click', (e) => {
        const extractButton = e.target.closest('.extract-button');
        if (!extractButton) return;
        
        const sourceId = extractButton.getAttribute('data-source');
        if (!sourceId) return;
        
        const container = document.getElementById(sourceId);
        if (!container) return;
        
        // Get selected text
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        if (selectedText) {
          // Create extract from selection
          this.createExtractFromSelection(selectedText, sourceId);
        } else {
          alert('Please select some text first to create an extract');
        }
      });
      
      // Handle flashcard generation buttons
      document.addEventListener('click', (e) => {
        const flashcardButton = e.target.closest('.flashcard-generator-button');
        if (!flashcardButton) return;
        
        const container = flashcardButton.closest('.extract');
        if (container) {
          const extractId = container.id;
          const extractText = container.querySelector('p').textContent;
          const parentTitle = container.querySelector('.parent-title').textContent;
          
          // Generate flashcards for this extract
          FlashcardManager.generateFlashcardsFromExtract(extractId, extractText, parentTitle, parentTitle);
        }
      });
    },
    
    /**
     * Create a new extract from selected text
     * @param {string} text - The selected text
     * @param {string} sourceId - ID of the parent element
     */
    async createExtractFromSelection(text, sourceId) {
      if (text.length < 10) {
        alert('Please select at least 10 characters to create an extract');
        return;
      }
      
      // Show a loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.className = 'loading-indicator';
      loadingIndicator.textContent = 'Creating extract';
      document.getElementById('contentContainer').appendChild(loadingIndicator);
      
      try {
        // Get source element and parent info
        const sourceElement = document.getElementById(sourceId);
        let parentTitle = '';
        let topicType = '';
        
        if (sourceId.startsWith('topic')) {
          // If parent is a topic
          parentTitle = sourceElement.querySelector('h2').textContent;
          topicType = sourceElement.getAttribute('data-topic');
        } else {
          // If parent is another extract
          parentTitle = sourceElement.querySelector('.parent-title').textContent;
          topicType = sourceElement.getAttribute('data-topic');
        }
        
        // Calculate nesting level for styling
        let nestingLevel = 0;
        if (sourceId.startsWith('extract')) {
          // Get the parent extract's level and add 1
          const parentLevel = parseInt(sourceElement.getAttribute('data-level') || '0');
          nestingLevel = parentLevel + 1;
        }
        
        // Generate a unique ID for the new extract
        const extractId = `extract-${Date.now()}`;
        
        // Clone the extract template
        const template = document.getElementById('extractTemplate');
        const extractElement = template.content.cloneNode(true).querySelector('.extract');
        
        // Set attributes
        extractElement.id = extractId;
        extractElement.setAttribute('data-topic', topicType);
        extractElement.setAttribute('data-source', sourceId);
        extractElement.setAttribute('data-level', nestingLevel);
        
        // Set content
        extractElement.querySelector('.parent-title').textContent = parentTitle;
        extractElement.querySelector('p').textContent = text;
        
        // Set extract button data-source
        extractElement.querySelector('.extract-button').setAttribute('data-source', extractId);
        
        // Append new extract to container
        document.getElementById('contentContainer').appendChild(extractElement);
        
        // Update data structures
        this.extracts = document.querySelectorAll('.extract');
        
        // Update parent-child relationships
        if (sourceId.startsWith('topic')) {
          if (!this.topicExtracts[sourceId]) {
            this.topicExtracts[sourceId] = [];
          }
          this.topicExtracts[sourceId].push(extractId);
        } else {
          if (!this.extractChildren[sourceId]) {
            this.extractChildren[sourceId] = [];
          }
          this.extractChildren[sourceId].push(extractId);
        }
        
        // Initialize flashcard mapping
        this.extractFlashcards[extractId] = [];
        
        // Generate flashcards automatically
        await FlashcardManager.generateFlashcardsFromExtract(extractId, text, parentTitle, parentTitle);
        
        // Rebuild content sequence to include new extract and flashcards
        this.buildContentSequence();
        
        // Navigate to the new extract
        const newExtractIndex = this.contentItems.findIndex(item => item.id === extractId);
        if (newExtractIndex !== -1) {
          this.currentItemIndex = newExtractIndex;
          this.showCurrentItem();
        }
        
        // Update the content tree
        ContentTreeManager.renderContentTree();
      } catch (error) {
        console.error("Error creating extract:", error);
        alert("There was an error creating the extract. Please try again.");
      } finally {
        // Remove loading indicator
        document.getElementById('contentContainer').removeChild(loadingIndicator);
      }
    },
    
    /**
     * Build the content sequence from topics, extracts, and flashcards
     */
    buildContentSequence() {
      this.contentItems = [];
      
      if (this.topicOrder.length === 0) {
        this.createTopicOrder();
      }
      
      // Group content by type
      const allTopics = Array.from(this.sections).map(section => ({
        type: 'section',
        element: section,
        id: section.id
      }));
      
      const allExtracts = Array.from(this.extracts).map(extract => ({
        type: 'extract',
        element: extract,
        id: extract.id,
        source: extract.getAttribute('data-source')
      }));
      
      const allFlashcards = Array.from(this.flashcards).map(card => ({
        type: 'flashcard',
        element: card,
        id: card.id,
        source: card.getAttribute('data-source')
      }));
      
      // Sort topics by the random order
      const sortedTopics = [];
      for (const topicId of this.topicOrder) {
        const topic = allTopics.find(t => t.id === topicId);
        if (topic) sortedTopics.push(topic);
      }
      
      // Create a flat sequence, starting with topics and alternating with extracts and flashcards
      const result = this.createContentSequence(sortedTopics, allExtracts, allFlashcards);
      
      // Set the content items
      this.contentItems = result;
    },
    
    /**
     * Create a balanced content sequence
     * @param {Array} topics - Topic items
     * @param {Array} extracts - Extract items
     * @param {Array} flashcards - Flashcard items
     * @returns {Array} - Sequenced content items
     */
    createContentSequence(topics, extracts, flashcards) {
      const result = [];
      
      // Add topics first
      topics.forEach(topic => {
        result.push(topic);
        
        // Add direct extract children of this topic
        const topicExtracts = extracts.filter(e => e.source === topic.id);
        topicExtracts.forEach(extract => {
          result.push(extract);
          
          // Add flashcards associated with this extract
          const extractFlashcards = flashcards.filter(f => f.source === extract.id);
          result.push(...extractFlashcards);
          
          // Recursively add nested extracts
          this.addNestedContent(result, extracts, flashcards, extract.id);
        });
      });
      
      // Add any remaining extracts or flashcards
      const addedIds = new Set(result.map(item => item.id));
      
      extracts.forEach(extract => {
        if (!addedIds.has(extract.id)) {
          result.push(extract);
          addedIds.add(extract.id);
        }
      });
      
      flashcards.forEach(card => {
        if (!addedIds.has(card.id)) {
          result.push(card);
          addedIds.add(card.id);
        }
      });
      
      return result;
    },
    
    /**
     * Recursively add nested content (extracts and their flashcards)
     * @param {Array} result - Result array to add items to
     * @param {Array} extracts - All extracts
     * @param {Array} flashcards - All flashcards
     * @param {string} parentId - ID of the parent extract
     */
    addNestedContent(result, extracts, flashcards, parentId) {
      // Find child extracts
      const childExtracts = extracts.filter(e => e.source === parentId);
      
      childExtracts.forEach(extract => {
        result.push(extract);
        
        // Add flashcards for this extract
        const extractFlashcards = flashcards.filter(f => f.source === extract.id);
        result.push(...extractFlashcards);
        
        // Recursively add nested content
        this.addNestedContent(result, extracts, flashcards, extract.id);
      });
    },
    
    /**
     * Show the current content item
     */
    showCurrentItem() {
      // Hide all items
      this.sections.forEach(section => section.classList.remove('active'));
      this.extracts.forEach(extract => extract.classList.remove('active'));
      this.flashcards.forEach(card => card.classList.remove('active'));
      
      // Show current item
      const currentItem = this.contentItems[this.currentItemIndex];
      if (!currentItem || !currentItem.element) {
        // If the current item is no longer valid, reset to the first item
        if (this.contentItems.length > 0) {
          this.currentItemIndex = 0;
          this.showCurrentItem();
        }
        return;
      }
      
      currentItem.element.classList.add('active');
      
      // Update progress bar
      const progressPercent = (this.currentItemIndex / (this.contentItems.length - 1)) * 100;
      document.getElementById('progressFill').style.width = `${progressPercent}%`;
      
      // Update navigation buttons
      document.getElementById('prevButton').disabled = this.currentItemIndex === 0;
      document.getElementById('nextButton').disabled = this.currentItemIndex === this.contentItems.length - 1;
      
      // Update content tree
      ContentTreeManager.updateActiveTreeItem(currentItem.id);
    },
    
    /**
     * Get the current content item
     * @returns {Object} - The current content item
     */
    getCurrentItem() {
      if (this.contentItems.length === 0) return null;
      return this.contentItems[this.currentItemIndex];
    },
    
    /**
     * Navigate to the next content item
     */
    goToNext() {
      if (this.currentItemIndex < this.contentItems.length - 1) {
        this.currentItemIndex++;
        this.showCurrentItem();
        return true;
      }
      return false;
    },
    
    /**
     * Navigate to the previous content item
     */
    goToPrevious() {
      if (this.currentItemIndex > 0) {
        this.currentItemIndex--;
        this.showCurrentItem();
        return true;
      }
      return false;
    }
  };
  
  // ========================
  // Flashcard Manager Module
  // ========================
  
  const FlashcardManager = {
    cards: {},
    reviewQueue: [],
    reviewModalActive: false,
    
    /**
     * Initialize the flashcard manager
     */
    init() {
      this.initializeCards();
      this.setupCardControlEvents();
      this.updateReviewQueue();
    },
    
    /**
     * Initialize all flashcard data
     */
    initializeCards() {
      document.querySelectorAll('.flashcard').forEach(card => {
        this.registerFlashcard(card);
      });
    },
    
    /**
     * Register a flashcard in the system
     * @param {HTMLElement} card - The flashcard element
     */
    registerFlashcard(card) {
      const cardId = card.id;
      const question = card.querySelector('.flashcard-question');
      const answer = card.querySelector('.flashcard-answer');
      const controls = card.querySelector('.flashcard-controls');
      
      this.cards[cardId] = {
        element: card,
        question: question.textContent,
        answer: answer.textContent,
        nextReview: null,
        state: 'new' // new, learning, review
      };
      
      // Setup click to reveal/hide answer
      question.addEventListener('click', () => {
        const isVisible = answer.style.display === 'block';
        answer.style.display = isVisible ? 'none' : 'block';
        controls.style.display = isVisible ? 'none' : 'block';
      });
      
      // Update when content changes
      question.addEventListener('blur', () => {
        this.cards[cardId].question = question.textContent;
      });
      
      answer.addEventListener('blur', () => {
        this.cards[cardId].answer = answer.textContent;
      });
    },
    
    /**
     * Set up flashcard control buttons
     */
    setupCardControlEvents() {
      document.addEventListener('click', (e) => {
        const button = e.target.closest('.flashcard-button');
        if (!button || !button.hasAttribute('data-card')) return;
        
        const cardId = button.getAttribute('data-card');
        const difficulty = button.classList.contains('easy') ? 'easy' : 
                          button.classList.contains('medium') ? 'medium' : 'hard';
        
        this.gradeCard(cardId, difficulty);
      });
    },
    
    /**
     * Grade a flashcard and schedule its next review
     * @param {string} cardId - The card ID
     * @param {string} difficulty - Difficulty rating (easy, medium, hard)
     */
    gradeCard(cardId, difficulty) {
      // Set next review time based on difficulty
      const now = new Date();
      let nextReview;
      
      if (difficulty === 'easy') {
        nextReview = new Date(now.getTime() + 3 * 60000); // 3 minutes
      } else if (difficulty === 'medium') {
        nextReview = new Date(now.getTime() + 1 * 60000); // 1 minute
      } else {
        nextReview = new Date(now.getTime() + 30000); // 30 seconds
      }
      
      this.cards[cardId].nextReview = nextReview;
      this.cards[cardId].state = 'learning';
      
      // Hide the answer after rating
      const card = this.cards[cardId].element;
      const answer = card.querySelector('.flashcard-answer');
      const controls = card.querySelector('.flashcard-controls');
      
      answer.style.display = 'none';
      controls.style.display = 'none';
      
      // Move to next item if we're on a flashcard
      if (ContentManager.contentItems[ContentManager.currentItemIndex].type === 'flashcard' && 
          ContentManager.contentItems[ContentManager.currentItemIndex].id === cardId) {
        ContentManager.goToNext();
      }
      
      this.updateReviewQueue();
    },
    
    /**
     * Update the review queue with cards due for review
     */
    updateReviewQueue() {
      const now = new Date();
      this.reviewQueue = [];
      
      // Add due cards to the queue
      for (const cardId in this.cards) {
        const card = this.cards[cardId];
        if (card.state !== 'new' && card.nextReview && card.nextReview <= now) {
          this.reviewQueue.push(cardId);
        }
      }
      
      // Update the review count display
      const reviewCountElement = document.querySelector('.review-count');
      reviewCountElement.textContent = `${this.reviewQueue.length} card${this.reviewQueue.length === 1 ? '' : 's'} due for review`;
      
      // Check again in 5 seconds
      setTimeout(() => this.updateReviewQueue(), 5000);
    },
    
    /**
     * Open the review modal to review due cards
     */
    openReviewModal() {
      if (this.reviewModalActive) return;
      
      this.reviewModalActive = true;
      document.getElementById('reviewModal').style.display = 'flex';
      this.showNextReviewCard();
    },
    
    /**
     * Close the review modal
     */
    closeReviewModal() {
      this.reviewModalActive = false;
      document.getElementById('reviewModal').style.display = 'none';
      document.getElementById('reviewModalContent').innerHTML = '';
    },
    
    /**
     * Show the next card due for review
     */
    showNextReviewCard() {
      const modalContent = document.getElementById('reviewModalContent');
      
      if (this.reviewQueue.length === 0) {
        modalContent.innerHTML = `
          <h2>Review Complete!</h2>
          <p>You've reviewed all the cards that were due. Great job!</p>
          <button class="flashcard-button" onclick="FlashcardManager.closeReviewModal()">Close</button>
        `;
        return;
      }
      
      const cardId = this.reviewQueue.shift();
      const card = this.cards[cardId];
      
      modalContent.innerHTML = `
        <div class="flashcard" style="margin: 0; display: block;">
          <div class="flashcard-question">${card.question}</div>
          <div class="flashcard-answer" style="display: none;">${card.answer}</div>
          <button class="flashcard-button" id="showAnswerBtn" style="margin-top: 1rem;">Show Answer</button>
          <div class="flashcard-controls" style="display: none;">
            <button class="flashcard-button easy" id="easyBtn">Easy (3m)</button>
            <button class="flashcard-button medium" id="mediumBtn">Medium (1m)</button>
            <button class="flashcard-button hard" id="hardBtn">Hard (30s)</button>
          </div>
        </div>
      `;
      
      // Set up event listeners for the review modal buttons
      document.getElementById('showAnswerBtn').addEventListener('click', () => {
        modalContent.querySelector('.flashcard-answer').style.display = 'block';
        document.getElementById('showAnswerBtn').style.display = 'none';
        modalContent.querySelector('.flashcard-controls').style.display = 'block';
      });
      
      document.getElementById('easyBtn').addEventListener('click', () => {
        this.gradeDueCard(cardId, 'easy');
      });
      
      document.getElementById('mediumBtn').addEventListener('click', () => {
        this.gradeDueCard(cardId, 'medium');
      });
      
      document.getElementById('hardBtn').addEventListener('click', () => {
        this.gradeDueCard(cardId, 'hard');
      });
    },
    
    /**
     * Grade a card during review
     * @param {string} cardId - The card ID
     * @param {string} difficulty - Difficulty rating (easy, medium, hard)
     */
    gradeDueCard(cardId, difficulty) {
      this.gradeCard(cardId, difficulty);
      this.showNextReviewCard();
    },
    
    /**
     * Generate flashcards from an extract using the LLM
     * @param {string} extractId - The extract ID
     * @param {string} extractText - The extract text
     * @param {string} extractTitle - The extract title
     * @param {string} topicTitle - The parent topic title
     */
    async generateFlashcardsFromExtract(extractId, extractText, extractTitle, topicTitle) {
      // Create improved prompt for the LLM with better instructions
      const flashcardPrompt = `
        You are an educational flashcard creator specializing in effective learning through active recall. 
        Create 2-3 high-quality flashcards based on this extract about ${topicTitle}, titled "${extractTitle}":
        
        "${extractText}"
        
        Your output must be a valid JSON array of objects with 'question' and 'answer' properties.
        
        ESSENTIAL RULES for effective flashcards:
        1. NEVER ask generic questions like "What is the main topic?" or about the extract's title
        2. Each flashcard must test a SPECIFIC fact, concept, or relationship from the extract text
        3. Questions must require understanding of the material, not just recognition
        4. Focus on the most important, challenging concepts that require memorization
        5. Questions should be precise and unambiguous
        6. Answers should be concise (1-7 words) but complete
        7. At least one card should test application of knowledge, not just facts
        8. All questions must be answerable ONLY from information in the extract
        
        Example high-quality flashcards:
        [
          {"question": "What specific mechanism allows water to move up plant stems against gravity?", "answer": "Capillary action"},
          {"question": "What distinguishes a compiler from an interpreter in programming?", "answer": "Translates entire program before execution"}
        ]
        
        RESPOND ONLY with the JSON array of flashcards, no explanations or other text.
      `;
      
      try {
        // Get flashcards from LLM
        const flashcardsJson = await LLMService.callLLM(flashcardPrompt, 0.7);
        let flashcards = [];
        
        try {
          // Parse JSON from the response
          const jsonMatch = flashcardsJson.match(/\[\s*\{.*\}\s*\]/s);
          if (jsonMatch) {
            flashcards = JSON.parse(jsonMatch[0]);
          } else {
            flashcards = JSON.parse(flashcardsJson);
          }
          
          // Validate flashcards format and quality
          if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error("Invalid flashcards format");
          }
          
          // Filter out bad flashcards
          flashcards = flashcards.filter(card => {
            // Filter out cards with generic questions like "what is the main topic"
            const lowercaseQuestion = card.question.toLowerCase();
            return !(
              lowercaseQuestion.includes("main topic") ||
              lowercaseQuestion.includes("extract title") ||
              lowercaseQuestion.includes("extract about") ||
              lowercaseQuestion.includes("what is this extract") ||
              (card.answer.length < 2) // Extremely short answers are likely not useful
            );
          });
          
          // If all flashcards were filtered out, throw an error to trigger fallback
          if (flashcards.length === 0) {
            throw new Error("All generated flashcards were low quality");
          }
          
        } catch (e) {
          console.error("Failed to generate quality flashcards:", e);
          console.log("Raw response:", flashcardsJson);
          
          // Better fallback flashcards that extract actual content
          // Find key terms or phrases from the extract
          const sentences = extractText.split(/[.!?]+/).filter(s => s.trim().length > 0);
          
          if (sentences.length > 0) {
            // Use the first sentence as the basis for a flashcard
            const firstSentence = sentences[0].trim();
            // Find a key noun phrase or concept
            const words = firstSentence.split(' ');
            const keyTermIndex = words.findIndex((word, i) => 
              word.length > 5 && i > 0 && word[0] === word[0].toUpperCase()
            ) || Math.floor(words.length / 2);
            
            const keyTerm = words[keyTermIndex] || words[0];
            flashcards = [{
              question: `Define "${keyTerm}" as mentioned in the extract about ${topicTitle}`,
              answer: firstSentence.includes(':') ? 
                      firstSentence.split(':')[1].trim() : 
                      sentences[Math.min(1, sentences.length - 1)].trim()
            }];
            
            // If we have more sentences, add a second flashcard
            if (sentences.length > 1) {
              const secondSentence = sentences[1].trim();
              flashcards.push({
                question: `What is the relationship between ${keyTerm} and ${topicTitle}?`,
                answer: secondSentence.length < 50 ? 
                       secondSentence : 
                       secondSentence.substring(0, 47) + "..."
              });
            }
          } else {
            // Last resort fallback if we can't parse sentences
            flashcards = [{
              question: `What is a key concept related to ${topicTitle} mentioned in this extract?`,
              answer: extractTitle
            }];
          }
        }
        
        // Create DOM elements for each flashcard
        this.createFlashcardElements(flashcards, extractId);
        
        // Update the content tree
        ContentTreeManager.renderContentTree();
        
      } catch (error) {
        console.error("Error generating flashcards:", error);
      }
    },
    
    /**
     * Create flashcard DOM elements
     * @param {Array} flashcards - Array of flashcard data
     * @param {string} extractId - The parent extract ID
     */
    createFlashcardElements(flashcards, extractId) {
      flashcards.forEach((fc, index) => {
        const cardId = `card-${extractId}-${index}-${Date.now()}`;
        
        // Clone the flashcard template
        const template = document.getElementById('flashcardTemplate');
        const cardElement = template.content.cloneNode(true).querySelector('.flashcard');
        
        // Set attributes
        cardElement.id = cardId;
        cardElement.setAttribute('data-source', extractId);
        
        // Set content
        cardElement.querySelector('.flashcard-question').textContent = fc.question;
        cardElement.querySelector('.flashcard-answer').textContent = fc.answer;
        
        // Set button data attributes
        cardElement.querySelectorAll('.flashcard-button').forEach(button => {
          if (button.classList.contains('easy') || 
              button.classList.contains('medium') || 
              button.classList.contains('hard')) {
            button.setAttribute('data-card', cardId);
          }
        });
        
        // Add to DOM
        document.getElementById('contentContainer').appendChild(cardElement);
        
        // Update data structures
        ContentManager.flashcards = document.querySelectorAll('.flashcard');
        ContentManager.extractFlashcards[extractId].push(cardId);
        
        // Register flashcard
        this.registerFlashcard(cardElement);
        
        // Rebuild content sequence to include the new flashcard
        ContentManager.buildContentSequence();
      });
    }
  };
  
  // ========================
  // App Initialization
  // ========================
  
  // Initialize the application
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize modules
    ContentManager.init();
    FlashcardManager.init();
    ContentTreeManager.init();
    
    // Set up navigation buttons
    document.getElementById('nextButton').addEventListener('click', () => {
      ContentManager.goToNext();
    });
    
    document.getElementById('prevButton').addEventListener('click', () => {
      ContentManager.goToPrevious();
    });
    
    // Set up review button
    document.getElementById('reviewButton').addEventListener('click', () => {
      if (FlashcardManager.reviewQueue.length > 0) {
        FlashcardManager.openReviewModal();
      } else {
        alert('No cards are currently due for review.');
      }
    });
    
    // Set up close modal button
    document.getElementById('closeModal').addEventListener('click', () => {
      FlashcardManager.closeReviewModal();
    });
  });