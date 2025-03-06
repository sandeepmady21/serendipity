/**
 * Serendipity Learn - A cross-disciplinary learning application
 *
 * Key features:
 * - Hierarchical nested extracts (extracts can be created from other extracts)
 * - Inline content editing (edit text directly)
 * - Content tree navigation
 * - Flashcards with spaced repetition
 * - Cloze deletions
 * - Search functionality
 */

const TOPICS = {
  computerscience: {
    heading: "Cryptography Fundamentals",
    content:
      "Cryptography enables secure digital communication through mathematical techniques that make data unreadable to unauthorized parties. Modern encryption uses public-key systems where different keys encrypt and decrypt information. The security of these systems often relies on mathematical problems like integer factorization that are computationally difficult to solve. As quantum computing advances, researchers are developing quantum-resistant algorithms to maintain digital privacy.",
  },
  philosophy: {
    heading: "Thought Experiments",
    content:
      'Thought experiments allow philosophers to explore complex ideas using imaginary scenarios. The "trolley problem" examines ethical decision-making by asking if redirecting a runaway trolley to kill one person instead of five is morally justified. Plato\'s "Cave" illustrates how limited perception shapes our understanding of reality. These mental exercises reveal underlying assumptions in our reasoning and help clarify abstract concepts without requiring physical experimentation.',
  },
  geology: {
    heading: "Plate Tectonics",
    content:
      "The theory of plate tectonics explains how Earth's lithosphere is divided into massive plates that float on the semi-fluid asthenosphere below. As these plates interact, they create geological phenomena at their boundaries: convergent boundaries form mountains and trenches, divergent boundaries create mid-ocean ridges, and transform boundaries produce fault lines where earthquakes frequently occur. This constant movement reshapes continents over millions of years through the slow process of continental drift.",
  },
  astronomy: {
    heading: "Stellar Evolution",
    content:
      "Stars follow predictable life cycles determined primarily by their initial mass. They form from collapsing clouds of gas and dust, then spend most of their lives in main sequence, fusing hydrogen into helium in their cores. Medium-sized stars like our Sun eventually expand into red giants before shedding outer layers as planetary nebulae and ending as white dwarfs. Massive stars experience more dramatic deaths through supernova explosions, potentially leaving behind neutron stars or black holes.",
  },
  linguistics: {
    heading: "Universal Grammar",
    content:
      "Language acquisition follows remarkably similar patterns across all human cultures despite vast differences between languages. Children master complex grammatical rules without explicit instruction, suggesting an innate capacity for language. Noam Chomsky's theory of Universal Grammar proposes that humans possess biological brain structures specifically evolved for language learning. This explains why children can generate entirely new sentences never heard before and why certain grammatical features appear across unrelated languages worldwide.",
  },
  arthistory: {
    heading: "Symbolism in Renaissance Art",
    content:
      "Renaissance artists embedded sophisticated symbolic systems in their work to communicate religious and philosophical ideas. Common motifs included specific flowers (lilies representing purity), animals (lambs symbolizing Christ), and objects (mirrors reflecting truth or vanity). Colors carried consistent meanings: blue for divinity, red for passion or sacrifice. Even composition followed symbolic principles, with hierarchical scaling making important figures physically larger. Understanding these visual codes reveals deeper layers of meaning beyond the surface aesthetics.",
  },
  publichealth: {
    heading: "Herd Immunity",
    content:
      "Herd immunity protects communities when a sufficient percentage of the population becomes immune to a contagious disease, limiting pathogen transmission to vulnerable individuals. This threshold varies by disease based on its reproductive number (R₀)—measles requires approximately 95% immunity while influenza may need only 60%. Immunity can develop through infection or vaccination, but the latter minimizes harm while building protection. This concept explains why maintaining high vaccination rates protects even those who cannot receive vaccines due to medical conditions.",
  },
  musictheory: {
    heading: "Modal Harmony",
    content:
      "Modal harmony organizes music around distinct scales (modes) that create characteristic emotional atmospheres despite using the same set of notes. The bright-sounding Lydian mode emphasizes the sharp fourth scale degree, creating an optimistic quality used in film scores and jazz. In contrast, the Phrygian mode's flat second note produces tension and exotic qualities found in flamenco music. These modal frameworks dominated Western music before the major-minor tonal system and have experienced revival in modern composition, especially in film soundtracks and progressive rock.",
  },
};

// Icon mapping for topics
const ICONS = {
  // Original topics
  networking: '<i class="fas fa-network-wired"></i>',
  biology: '<i class="fas fa-dna"></i>',
  physics: '<i class="fas fa-atom"></i>',
  psychology: '<i class="fas fa-brain"></i>',
  math: '<i class="fas fa-square-root-alt"></i>', // or "fas fa-calculator"

  // New topics
  computerscience: '<i class="fas fa-shield-alt"></i>', // for cryptography
  philosophy: '<i class="fas fa-lightbulb"></i>',
  geology: '<i class="fas fa-mountain"></i>',
  astronomy: '<i class="fas fa-star"></i>',
  linguistics: '<i class="fas fa-language"></i>',
  arthistory: '<i class="fas fa-palette"></i>',
  publichealth: '<i class="fas fa-medkit"></i>',
  musictheory: '<i class="fas fa-music"></i>',

  // Additional icons for other content types
  extract: '<i class="fas fa-quote-right"></i>',
  flashcard: '<i class="fas fa-sticky-note"></i>',
};

// ========================
// LLM Integration Module
// ========================

const LLMService = {
  config: {
    endpoint: "http://localhost:11434/api/generate",
    model: "mistral", // Use whichever model you've pulled
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
          stream: false,
        }),
      });

      const data = await response.json();
      console.log("Received from Ollama:", data.response);
      return data.response;
    } catch (error) {
      console.error("Error calling Ollama API:", error);
      return null;
    }
  },
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

  toggleTreeItem(e) {
    const treeItem = e.target;
    const topicId = treeItem.dataset.id;
    const children = document.querySelectorAll(
      `div.tree-item[data-parent="${topicId}"]`
    );
    children.forEach((child) => {
      child.classList.toggle("tree-item-hidden");
    });
  },

  /**
   * Render the content tree based on current content items
   */
  renderContentTree() {
    const treeContainer = document.getElementById("contentTree");
    if (!treeContainer) {
      console.error("Content tree container not found");
      return;
    }

    // Clear the container
    treeContainer.innerHTML = "";

    // Get references to the current active item
    const currentItem = ContentManager.getCurrentItem();

    // First add all topics
    ContentManager.sections.forEach((section) => {
      const topicId = section.id;
      const originalTopicId = section.dataset.topic;
      const topicTitle =
        section.querySelector("h2")?.textContent || "Untitled Topic";
      const topicType = section.getAttribute("data-topic") || "";

      // Create topic item
      const topicElement = document.createElement("div");
      topicElement.className = "tree-item tree-topic";
      topicElement.setAttribute("data-id", topicId);
      topicElement.setAttribute("data-topic", originalTopicId);
      topicElement.innerHTML = `${ICONS[originalTopicId]} ${topicTitle}`;

      // Make it active if this is the current item
      if (currentItem && currentItem.id === topicId) {
        topicElement.classList.add("active");
      }

      // Add topic click handler
      topicElement.addEventListener("click", (e) => {
        this.navigateToItem(topicId);
        this.toggleTreeItem(e);
      });

      treeContainer.appendChild(topicElement);

      // Add extracts and their children under this topic
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
    let extracts = ContentManager.getDirectChildren(parentId);

    // Check if we have valid data
    if (!Array.isArray(extracts)) {
      console.error(`Invalid extracts array for parent ${parentId}:`, extracts);
      extracts = [];
    }

    extracts.forEach((extractId) => {
      const extract = document.getElementById(extractId);
      if (!extract) {
        console.warn(`Extract element not found for ID: ${extractId}`);
        return; // Skip if extract doesn't exist
      }

      // Get first sentence from extract text
      const extractText = extract.querySelector("p")?.textContent || "";
      const firstSentenceMatch = extractText.match(/^[^.!?]+[.!?]/);
      let displayText = firstSentenceMatch
        ? firstSentenceMatch[0].trim()
        : extractText.substring(0, 60) + (extractText.length > 60 ? "..." : "");

      // Choose CSS class based on nesting level
      let treeItemClass = "tree-item tree-extract";
      if (level === 1) {
        treeItemClass = "tree-item tree-nested-extract";
      } else if (level >= 2) {
        treeItemClass = "tree-item tree-deep-nested-extract";
      }

      // Create extract item
      const extractElement = document.createElement("div");
      extractElement.className = treeItemClass;
      extractElement.setAttribute("data-id", extractId);
      extractElement.setAttribute("data-parent", parentId);
      extractElement.setAttribute("data-level", level);
      extractElement.textContent = displayText;
      extractElement.title = extractText; // Show full text on hover

      // Make it active if this is the current item
      if (currentItem && currentItem.id === extractId) {
        extractElement.classList.add("active");
      }

      // Add extract click handler
      extractElement.addEventListener("click", (e) => {
        this.navigateToItem(extractId);
        this.toggleTreeItem(e);
      });

      container.appendChild(extractElement);

      // Add flashcards for this extract
      this.addFlashcardsToTree(container, extractId, currentItem, parentId);

      // Recursively add child extracts
      this.addExtractsToTree(container, extractId, currentItem, level + 1);
    });
  },

  /**
   * Add flashcards for an extract to the tree
   * @param {HTMLElement} container - Container element to add items to
   * @param {string} extractId - ID of the parent extract
   * @param {Object} currentItem - Currently active item (if any)
   */
  addFlashcardsToTree(container, extractId, currentItem, parentId) {
    const flashcards = ContentManager.extractFlashcards[extractId];

    // Check if we have valid data
    if (!Array.isArray(flashcards)) {
      return; // No flashcards for this extract or invalid data
    }

    flashcards.forEach((cardId) => {
      const card = document.getElementById(cardId);
      if (!card) return; // Skip if card doesn't exist

      const cardQuestion =
        card.querySelector(".flashcard-question")?.textContent ||
        "Untitled Flashcard";
      const shortQuestion = this.truncateText(cardQuestion, 40);

      // Create flashcard item
      const cardElement = document.createElement("div");
      cardElement.className = "tree-item tree-flashcard";
      cardElement.setAttribute("data-id", cardId);
      cardElement.setAttribute("data-parent", parentId);
      cardElement.textContent = shortQuestion;
      cardElement.title = cardQuestion; // Full question on hover

      // Make it active if this is the current item
      if (currentItem && currentItem.id === cardId) {
        cardElement.classList.add("active");
      }

      // Add flashcard click handler
      cardElement.addEventListener("click", () => {
        this.navigateToItem(cardId);
      });

      container.appendChild(cardElement);
    });
  },

  /**
   * Navigate to a specific content item by ID
   * @param {string} itemId - The ID of the item to navigate to
   */
  navigateToItem(itemId) {
    // Find the item index in the content sequence
    const itemIndex = ContentManager.contentItems.findIndex(
      (item) => item.id === itemId
    );

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
    document.querySelectorAll(".tree-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Add active class to the current item
    const activeItem = document.querySelector(
      `.tree-item[data-id="${itemId}"]`
    );
    if (activeItem) {
      activeItem.classList.add("active");

      // Scroll the item into view
      activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  /**
   * Truncate text to a specific length with ellipsis
   * @param {string} text - The text to truncate
   * @param {number} maxLength - The maximum length
   * @returns {string} - Truncated text
   */
  truncateText(text, maxLength) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  },
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
    this.sections = document.querySelectorAll(".content-section");
    this.extracts = document.querySelectorAll(".extract");
    this.flashcards = document.querySelectorAll(".flashcard");

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
    this.sections.forEach((section) => {
      const topicId = section.id;
      this.topicExtracts[topicId] = [];
    });

    // Map extracts to parents and initialize flashcard mapping
    this.extracts.forEach((extract) => {
      const extractId = extract.id;
      const parentId = extract.getAttribute("data-source");

      // Determine if parent is a topic or another extract
      if (parentId.startsWith("topic")) {
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
    this.flashcards.forEach((card) => {
      const cardId = card.id;
      const extractId = card.getAttribute("data-source");

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
    if (parentId.startsWith("topic")) {
      return this.topicExtracts[parentId] || [];
    } else {
      return this.extractChildren[parentId] || [];
    }
  },

  /**
   * Create a randomized order of topics
   */
  createTopicOrder() {
    const topicIds = Array.from(this.sections).map((section) => section.id);
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
    document.addEventListener(
      "blur",
      (e) => {
        const target = e.target;
        if (
          target.hasAttribute &&
          target.hasAttribute("contenteditable") &&
          target.getAttribute("contenteditable") === "true"
        ) {
          // Content was edited, update the data structures if needed
          const container = target.closest(
            ".content-section, .extract, .flashcard"
          );
          if (container) {
            // After content changes, update the content tree
            this.buildContentSequence();
            ContentTreeManager.renderContentTree();
          }
        }
      },
      true
    );

    // Set up edit buttons
    document.addEventListener("click", (e) => {
      if (e.target.closest(".edit-button")) {
        const container = e.target.closest(
          ".content-section, .extract, .flashcard"
        );
        if (container) {
          // Focus on the first editable element
          const editableElement = container.querySelector(
            '[contenteditable="true"]'
          );
          if (editableElement) {
            editableElement.focus();
          }
        }
      }

      // Handle delete buttons
      if (e.target.closest(".delete-button")) {
        const container = e.target.closest(".extract, .flashcard");
        if (
          container &&
          confirm("Are you sure you want to delete this item?")
        ) {
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
    if (item.classList.contains("extract")) {
      // Delete child extracts recursively
      const childExtracts = this.extractChildren[itemId] || [];
      childExtracts.forEach((childId) => {
        this.deleteItem(childId);
      });

      // Delete flashcards
      const flashcards = this.extractFlashcards[itemId] || [];
      flashcards.forEach((cardId) => {
        const card = document.getElementById(cardId);
        if (card) card.remove();
      });

      // Remove from parent's children list
      const parentId = item.getAttribute("data-source");
      if (parentId.startsWith("topic")) {
        this.topicExtracts[parentId] = this.topicExtracts[parentId].filter(
          (id) => id !== itemId
        );
      } else {
        this.extractChildren[parentId] = (
          this.extractChildren[parentId] || []
        ).filter((id) => id !== itemId);
      }

      // Clean up data structures
      delete this.extractChildren[itemId];
      delete this.extractFlashcards[itemId];
    }

    // Remove from DOM
    item.remove();

    // Update data structures
    this.extracts = document.querySelectorAll(".extract");
    this.flashcards = document.querySelectorAll(".flashcard");

    // Rebuild the content sequence
    this.mapContentRelationships();
    this.buildContentSequence();

    // Update the view
    if (this.contentItems.length > 0) {
      this.currentItemIndex = Math.min(
        this.currentItemIndex,
        this.contentItems.length - 1
      );
      this.showCurrentItem();
    }

    // Update the content tree
    ContentTreeManager.renderContentTree();
  },

  /**
   * Set up extract selection handling
   */
  setupExtractHandlers() {
    document.addEventListener("click", (e) => {
      const extractButton = e.target.closest(".extract-button");
      if (!extractButton) return;

      const sourceId = extractButton.getAttribute("data-source");
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
        alert("Please select some text first to create an extract");
      }
    });

    // Handle flashcard generation buttons
    document.addEventListener("click", (e) => {
      const flashcardButton = e.target.closest(".flashcard-generator-button");
      if (!flashcardButton) return;

      const isExtract = !!flashcardButton.closest(".extract");
      const container =
        flashcardButton.closest(".extract") ||
        flashcardButton.closest(".content-section");
      if (container) {
        const extractId = container.id;
        const extractText = container.querySelector("p").textContent;
        const parentTitle = container.querySelector(
          isExtract ? ".parent-title" : "h2"
        ).textContent;

        this.extractFlashcards[extractId] =
          this.extractFlashcards[extractId] || [];

        // Generate flashcards for this extract
        FlashcardManager.generateFlashcardsFromExtract(
          extractId,
          extractText,
          parentTitle,
          parentTitle
        );
      }
    });
  },

  /**
   * Highlight text in the source element
   * @param {HTMLElement} sourceElement - The source element
   * @param {string} text - Text to highlight
   */
  highlightSourceText(sourceElement, text) {
    if (!sourceElement || !text) return;

    // Find paragraph that contains the text
    const paragraphs = sourceElement.querySelectorAll("p, h2");

    paragraphs.forEach((p) => {
      // Clean text for comparison - remove extra spaces
      const cleanText = text.replace(/\s+/g, " ").trim();
      const pText = p.textContent.replace(/\s+/g, " ").trim();

      // Check if paragraph contains the text
      if (pText.includes(cleanText)) {
        // Escape special characters for use in regex
        const escapedText = cleanText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Replace text with highlighted version
        const originalHTML = p.innerHTML;
        p.innerHTML = originalHTML.replace(
          new RegExp(`(${escapedText})`, "g"),
          '<span class="highlighted-source">$1</span>'
        );
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
      alert("Please select at least 10 characters to create an extract");
      return;
    }

    // Show a loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading-indicator";
    loadingIndicator.textContent = "Creating extract";
    document.getElementById("contentContainer").appendChild(loadingIndicator);

    try {
      // Get source element and parent info
      const sourceElement = document.getElementById(sourceId);
      if (!sourceElement) {
        throw new Error(`Source element with ID ${sourceId} not found`);
      }

      let parentTitle = "";
      let topicType = "";

      if (sourceId.startsWith("topic")) {
        // If parent is a topic
        const titleElement = sourceElement.querySelector("h2");
        if (!titleElement) throw new Error("Title element not found in topic");
        parentTitle = titleElement.textContent;
        topicType = sourceElement.getAttribute("data-topic") || "";
      } else {
        // If parent is another extract
        const titleElement = sourceElement.querySelector(".parent-title");
        if (!titleElement)
          throw new Error("Parent title element not found in extract");
        parentTitle = titleElement.textContent;
        topicType = sourceElement.getAttribute("data-topic") || "";
      }

      // Calculate nesting level for styling
      let nestingLevel = 0;
      if (sourceId.startsWith("extract")) {
        // Get the parent extract's level and add 1
        const parentLevel = parseInt(
          sourceElement.getAttribute("data-level") || "0"
        );
        nestingLevel = parentLevel + 1;
      }

      // Generate a unique ID for the new extract
      const extractId = `extract-${Date.now()}`;

      // Clone the extract template
      const template = document.getElementById("extractTemplate");
      if (!template) throw new Error("Extract template not found");

      const extractElement = template.content
        .cloneNode(true)
        .querySelector(".extract");
      if (!extractElement)
        throw new Error("Extract element not found in template");

      // Set attributes
      extractElement.id = extractId;
      extractElement.setAttribute("data-topic", topicType);
      extractElement.setAttribute("data-source", sourceId);
      extractElement.setAttribute("data-level", nestingLevel);

      // Set content
      const parentTitleElement = extractElement.querySelector(".parent-title");
      if (!parentTitleElement)
        throw new Error("Parent title element not found in new extract");
      parentTitleElement.textContent = parentTitle;

      const contentElement = extractElement.querySelector("p");
      if (!contentElement)
        throw new Error("Content element not found in new extract");
      contentElement.textContent = text;

      // Set extract button data-source
      const extractButton = extractElement.querySelector(".extract-button");
      if (!extractButton)
        throw new Error("Extract button not found in new extract");
      extractButton.setAttribute("data-source", extractId);

      // Append new extract to container
      document.getElementById("contentContainer").appendChild(extractElement);

      // Highlight the source text
      this.highlightSourceText(sourceElement, text);

      // Update data structures
      this.extracts = document.querySelectorAll(".extract");

      // Update parent-child relationships
      if (sourceId.startsWith("topic")) {
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

      // Generate flashcards automatically, but don't wait for it
      // This prevents the extract creation from failing if the LLM fails
      FlashcardManager.generateFlashcardsFromExtract(
        extractId,
        text,
        parentTitle,
        parentTitle
      ).catch((err) =>
        console.error(
          "Error generating flashcards, but extract was created:",
          err
        )
      );

      // Rebuild content sequence to include new extract and flashcards
      this.buildContentSequence();

      // Navigate to the new extract
      const newExtractIndex = this.contentItems.findIndex(
        (item) => item.id === extractId
      );
      if (newExtractIndex !== -1) {
        this.currentItemIndex = newExtractIndex;
        this.showCurrentItem();
      }

      // Update the content tree
      ContentTreeManager.renderContentTree();

      return extractId; // Return the ID of the created extract
    } catch (error) {
      console.error("Error creating extract:", error);
      alert("There was an error creating the extract: " + error.message);
      return null;
    } finally {
      // Remove loading indicator
      if (
        document.getElementById("contentContainer").contains(loadingIndicator)
      ) {
        document
          .getElementById("contentContainer")
          .removeChild(loadingIndicator);
      }
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
    const allTopics = Array.from(this.sections).map((section) => ({
      type: "section",
      element: section,
      id: section.id,
    }));

    const allExtracts = Array.from(this.extracts).map((extract) => ({
      type: "extract",
      element: extract,
      id: extract.id,
      source: extract.getAttribute("data-source"),
    }));

    const allFlashcards = Array.from(this.flashcards).map((card) => ({
      type: "flashcard",
      element: card,
      id: card.id,
      source: card.getAttribute("data-source"),
    }));

    // Sort topics by the random order
    const sortedTopics = [];
    for (const topicId of this.topicOrder) {
      const topic = allTopics.find((t) => t.id === topicId);
      if (topic) sortedTopics.push(topic);
    }

    // Create a flat sequence, starting with topics and alternating with extracts and flashcards
    const result = this.createContentSequence(
      sortedTopics,
      allExtracts,
      allFlashcards
    );

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
    topics.forEach((topic) => {
      result.push(topic);

      // Add direct extract children of this topic
      const topicExtracts = extracts.filter((e) => e.source === topic.id);
      topicExtracts.forEach((extract) => {
        result.push(extract);

        // Add flashcards associated with this extract
        const extractFlashcards = flashcards.filter(
          (f) => f.source === extract.id
        );
        result.push(...extractFlashcards);

        // Recursively add nested extracts
        this.addNestedContent(result, extracts, flashcards, extract.id);
      });
    });

    // Add any remaining extracts or flashcards
    const addedIds = new Set(result.map((item) => item.id));

    extracts.forEach((extract) => {
      if (!addedIds.has(extract.id)) {
        result.push(extract);
        addedIds.add(extract.id);
      }
    });

    flashcards.forEach((card) => {
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
    const childExtracts = extracts.filter((e) => e.source === parentId);

    childExtracts.forEach((extract) => {
      result.push(extract);

      // Add flashcards for this extract
      const extractFlashcards = flashcards.filter(
        (f) => f.source === extract.id
      );
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
    this.sections.forEach((section) => section.classList.remove("active"));
    this.extracts.forEach((extract) => extract.classList.remove("active"));
    this.flashcards.forEach((card) => card.classList.remove("active"));

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

    currentItem.element.classList.add("active");

    // Update progress bar
    // const progressPercent =
    //   (this.currentItemIndex / (this.contentItems.length - 1)) * 100;
    // document.getElementById("progressFill").style.width = `${progressPercent}%`;

    // Update navigation buttons
    // document.getElementById("prevButton").disabled =
    // this.currentItemIndex === 0;
    // document.getElementById("nextButton").disabled =
    //   this.currentItemIndex === this.contentItems.length - 1;

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

  getRandomIntExcept(min, max, current) {
    min = Math.ceil(min);
    max = Math.floor(max);
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    if (random !== current) {
      return random;
    }
    return Math.random() < 0.5
      ? Math.max(0, random - 1)
      : Math.min(random + 1, max - 1);
  },

  /**
   * Navigate to the next content item
   */
  goToNext() {
    this.currentItemIndex = this.getRandomIntExcept(
      0,
      this.contentItems.length - 1,
      this.currentItemIndex
    );
    this.showCurrentItem();
    return true;
  },

  // /**
  //  * Navigate to the previous content item
  //  */
  // goToPrevious() {
  //   if (this.currentItemIndex > 0) {
  //     this.currentItemIndex--;
  //     this.showCurrentItem();
  //     return true;
  //   }
  //   return false;
  // },
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
    this.setupManualFlashcardCreation(); // Add this line for manual flashcard creation
    this.updateReviewQueue();
  },

  /**
   * Initialize all flashcard data
   */
  initializeCards() {
    document.querySelectorAll(".flashcard").forEach((card) => {
      this.registerFlashcard(card);
    });
  },

  /**
   * Register a flashcard in the system
   * @param {HTMLElement} card - The flashcard element
   */
  registerFlashcard(card) {
    const cardId = card.id;
    const question = card.querySelector(".flashcard-question");
    const answer = card.querySelector(".flashcard-answer");
    const controls = card.querySelector(".flashcard-controls");

    this.cards[cardId] = {
      element: card,
      question: question.textContent,
      answer: answer.textContent,
      nextReview: null,
      state: "new", // new, learning, review
    };

    // Setup click to reveal/hide answer
    question.addEventListener("click", () => {
      const isVisible = answer.style.display === "block";
      answer.style.display = isVisible ? "none" : "block";
      controls.style.display = isVisible ? "none" : "block";
    });

    // Update when content changes
    question.addEventListener("blur", () => {
      this.cards[cardId].question = question.textContent;
    });

    answer.addEventListener("blur", () => {
      this.cards[cardId].answer = answer.textContent;
    });
  },

  /**
   * Set up flashcard control buttons
   */
  setupCardControlEvents() {
    document.addEventListener("click", (e) => {
      const button = e.target.closest(".flashcard-button");
      if (!button || !button.hasAttribute("data-card")) return;

      const cardId = button.getAttribute("data-card");
      const difficulty = button.classList.contains("easy")
        ? "easy"
        : button.classList.contains("medium")
        ? "medium"
        : "hard";

      this.gradeCard(cardId, difficulty);
    });
  },

  /**
   * Set up manual flashcard creation functionality
   */
  setupManualFlashcardCreation() {
    // Add manual creation buttons to all extracts
    document.querySelectorAll(".extract").forEach((extract) => {
      const extractId = extract.id;
      const controlsDiv = extract.querySelector(".extract-controls");

      if (!controlsDiv) return;

      // Check if button already exists
      if (!controlsDiv.querySelector(".manual-flashcard-button")) {
        const manualButton = document.createElement("button");
        manualButton.className = "manual-flashcard-button";
        manualButton.innerHTML = '<i class="fas fa-plus"></i> Create Flashcard';
        manualButton.setAttribute("data-extract", extractId);

        controlsDiv.appendChild(manualButton);
      }
    });

    // Add event listener for dynamic extracts
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains("extract")) {
              const extractId = node.id;
              const controlsDiv = node.querySelector(".extract-controls");

              if (!controlsDiv) return;

              // Add manual flashcard button if it doesn't exist
              if (!controlsDiv.querySelector(".manual-flashcard-button")) {
                const manualButton = document.createElement("button");
                manualButton.className = "manual-flashcard-button";
                manualButton.innerHTML =
                  '<i class="fas fa-plus"></i> Create Flashcard';
                manualButton.setAttribute("data-extract", extractId);

                controlsDiv.appendChild(manualButton);
              }
            }
          });
        }
      });
    });

    // Start observing the content container
    observer.observe(document.getElementById("contentContainer"), {
      childList: true,
      subtree: true,
    });

    // Add event listener for manual flashcard creation
    document.addEventListener("click", (e) => {
      const manualButton = e.target.closest(".manual-flashcard-button");
      if (!manualButton) return;

      const extractId = manualButton.getAttribute("data-extract");
      this.showFlashcardCreationForm(extractId);
    });
  },

  /**
   * Show flashcard creation form
   * @param {string} extractId - ID of the parent extract
   */
  showFlashcardCreationForm(extractId) {
    // Get extract info for reference
    const extract = document.getElementById(extractId);
    if (!extract) return;

    const extractText = extract.querySelector("p")?.textContent || "";

    // Create modal for flashcard creation
    const modal = document.createElement("div");
    modal.className = "flashcard-creation-modal";
    modal.innerHTML = `
        <div class="flashcard-creation-content">
          <h3>Create Flashcard</h3>
          <p>Create a flashcard following Piotr Wozniak's principles:</p>
          <ul class="creation-tips">
            <li>Focus on one specific fact per card</li>
            <li>Create cloze deletions (fill-in-the-blank)</li>
            <li>Use imagery where possible</li>
            <li>Keep answers concise (1-7 words)</li>
          </ul>
          <div class="extracted-content">
            <h4>Extract Text (for reference):</h4>
            <div class="reference-text">${extractText}</div>
          </div>
          <div class="form-group">
            <label>Question:</label>
            <textarea id="flashcard-question" rows="3" placeholder="Enter your question..."></textarea>
          </div>
          <div class="form-group">
            <label>Answer:</label>
            <textarea id="flashcard-answer" rows="3" placeholder="Enter the answer..."></textarea>
          </div>
          <div class="button-group">
            <button id="save-flashcard" class="flashcard-button">Save Flashcard</button>
            <button id="cancel-flashcard" class="flashcard-button">Cancel</button>
          </div>
        </div>
      `;

    document.body.appendChild(modal);

    // Add event listeners for the buttons
    document.getElementById("save-flashcard").addEventListener("click", () => {
      const question = document
        .getElementById("flashcard-question")
        .value.trim();
      const answer = document.getElementById("flashcard-answer").value.trim();

      if (question && answer) {
        // Create the flashcard
        const flashcardData = [{ question, answer }];
        this.createFlashcardElements(flashcardData, extractId);

        // Close the modal
        document.body.removeChild(modal);

        // Update content sequence
        ContentManager.buildContentSequence();
        ContentTreeManager.renderContentTree();
      } else {
        alert("Please enter both a question and an answer for your flashcard.");
      }
    });

    document
      .getElementById("cancel-flashcard")
      .addEventListener("click", () => {
        document.body.removeChild(modal);
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

    if (difficulty === "easy") {
      nextReview = new Date(now.getTime() + 3 * 60000); // 3 minutes
    } else if (difficulty === "medium") {
      nextReview = new Date(now.getTime() + 1 * 60000); // 1 minute
    } else {
      nextReview = new Date(now.getTime() + 30000); // 30 seconds
    }

    this.cards[cardId].nextReview = nextReview;
    this.cards[cardId].state = "learning";

    // Hide the answer after rating
    const card = this.cards[cardId].element;
    const answer = card.querySelector(".flashcard-answer");
    const controls = card.querySelector(".flashcard-controls");

    answer.style.display = "none";
    controls.style.display = "none";

    // Move to next item if we're on a flashcard
    if (
      ContentManager.contentItems[ContentManager.currentItemIndex].type ===
        "flashcard" &&
      ContentManager.contentItems[ContentManager.currentItemIndex].id === cardId
    ) {
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
      if (card.state !== "new" && card.nextReview && card.nextReview <= now) {
        this.reviewQueue.push(cardId);
      }
    }

    // Update the review count display
    const reviewCountElement = document.querySelector(".review-count");
    reviewCountElement.textContent = `${this.reviewQueue.length} card${
      this.reviewQueue.length === 1 ? "" : "s"
    } due for review`;

    // Check again in 5 seconds
    setTimeout(() => this.updateReviewQueue(), 5000);
  },

  /**
   * Open the review modal to review due cards
   */
  openReviewModal() {
    if (this.reviewModalActive) return;

    this.reviewModalActive = true;
    document.getElementById("reviewModal").style.display = "flex";
    this.showNextReviewCard();
  },

  /**
   * Close the review modal
   */
  closeReviewModal() {
    this.reviewModalActive = false;
    document.getElementById("reviewModal").style.display = "none";
    document.getElementById("reviewModalContent").innerHTML = "";
  },

  /**
   * Show the next card due for review
   */
  showNextReviewCard() {
    const modalContent = document.getElementById("reviewModalContent");

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
    document.getElementById("showAnswerBtn").addEventListener("click", () => {
      modalContent.querySelector(".flashcard-answer").style.display = "block";
      document.getElementById("showAnswerBtn").style.display = "none";
      modalContent.querySelector(".flashcard-controls").style.display = "block";
    });

    document.getElementById("easyBtn").addEventListener("click", () => {
      this.gradeDueCard(cardId, "easy");
    });

    document.getElementById("mediumBtn").addEventListener("click", () => {
      this.gradeDueCard(cardId, "medium");
    });

    document.getElementById("hardBtn").addEventListener("click", () => {
      this.gradeDueCard(cardId, "hard");
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
  async generateFlashcardsFromExtract(
    extractId,
    extractText,
    extractTitle,
    topicTitle
  ) {
    // Create improved prompt for the LLM with Wozniak principles
    const flashcardPrompt = `
        You are creating flashcards following the 20 rules of formulation by Piotr Wozniak.
        Create 2-3 high-quality flashcards based on this extract about ${topicTitle}, titled "${extractTitle}":
        
        "${extractText}"
        
        Your output must be a valid JSON array of objects with 'question' and 'answer' properties.
        
        FOLLOW THESE WOZNIAK PRINCIPLES:
        1. Apply the minimum information principle - one fact per card
        2. Use cloze deletions for facts/items in context
        3. Ensure semantic organization of knowledge
        4. Be concise - formulate short questions and answers
        5. Use imagery - where relevant, ask for visually memorable items
        6. Use mnemonic techniques where appropriate
        7. Use computational building blocks - divide complex material
        8. NEVER use "What is" or "Define" formats of questions
        9. Avoid enumerations (asking to list multiple items)
        10. Combat interference by making items distinct
        
        Example flashcards following these principles:
        [
          {"question": "The [?] property of light allows it to bend around obstacles", "answer": "wave"},
          {"question": "Light demonstrates _____ duality in quantum physics", "answer": "wave-particle"},
          {"question": "In cellular respiration, what molecule is the primary energy carrier?", "answer": "ATP"}
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
        flashcards = flashcards.filter((card) => {
          // Filter out cards with generic questions like "what is the main topic"
          const lowercaseQuestion = card.question.toLowerCase();
          return !(
            (
              lowercaseQuestion.includes("main topic") ||
              lowercaseQuestion.includes("extract title") ||
              lowercaseQuestion.includes("extract about") ||
              lowercaseQuestion.includes("what is this extract") ||
              card.answer.length < 2
            ) // Extremely short answers are likely not useful
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
        const sentences = extractText
          .split(/[.!?]+/)
          .filter((s) => s.trim().length > 0);

        if (sentences.length > 0) {
          // Use the first sentence as the basis for a flashcard
          const firstSentence = sentences[0].trim();
          // Find a key noun phrase or concept
          const words = firstSentence.split(" ");
          const keyTermIndex =
            words.findIndex(
              (word, i) =>
                word.length > 5 && i > 0 && word[0] === word[0].toUpperCase()
            ) || Math.floor(words.length / 2);

          const keyTerm = words[keyTermIndex] || words[0];
          flashcards = [
            {
              question: `What is the function of ${keyTerm} in ${topicTitle}?`,
              answer: firstSentence.includes(":")
                ? firstSentence.split(":")[1].trim()
                : sentences[Math.min(1, sentences.length - 1)].trim(),
            },
          ];

          // If we have more sentences, add a second flashcard
          if (sentences.length > 1) {
            const secondSentence = sentences[1].trim();
            flashcards.push({
              question: `In ${topicTitle}, ${keyTerm} is related to [?]`,
              answer: secondSentence.split(" ").slice(0, 3).join(" "),
            });
          }
        } else {
          // Last resort fallback if we can't parse sentences
          flashcards = [
            {
              question: `In ${topicTitle}, what is a key concept?`,
              answer: extractTitle,
            },
          ];
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
      const template = document.getElementById("flashcardTemplate");
      const cardElement = template.content
        .cloneNode(true)
        .querySelector(".flashcard");

      // Set attributes
      cardElement.id = cardId;
      cardElement.setAttribute("data-source", extractId);

      // Set content
      cardElement.querySelector(".flashcard-question").textContent =
        fc.question;
      cardElement.querySelector(".flashcard-answer").textContent = fc.answer;

      // Set button data attributes
      cardElement.querySelectorAll(".flashcard-button").forEach((button) => {
        if (
          button.classList.contains("easy") ||
          button.classList.contains("medium") ||
          button.classList.contains("hard")
        ) {
          button.setAttribute("data-card", cardId);
        }
      });

      // Add to DOM
      document.getElementById("contentContainer").appendChild(cardElement);

      // Update data structures
      ContentManager.flashcards = document.querySelectorAll(".flashcard");
      ContentManager.extractFlashcards[extractId].push(cardId);

      // Register flashcard
      this.registerFlashcard(cardElement);

      // Rebuild content sequence to include the new flashcard
      ContentManager.buildContentSequence();
    });
  },
};

// ========================
// Cloze Deletion Module
// ========================

// const ClozeManager = {
//   init() {
//     this.setupClozeHandlers();
//   },

//   setupClozeHandlers() {
//     // Add context menu for cloze deletion
//     document.addEventListener("contextmenu", (e) => {
//       const selection = window.getSelection();
//       const selectedText = selection.toString().trim();

//       // Only activate for non-empty selections within content areas
//       if (selectedText && e.target.closest(".content-section, .extract")) {
//         e.preventDefault();

//         // Create and show the context menu
//         this.showClozeMenu(e.clientX, e.clientY, selectedText, e.target);
//       }
//     });

//     // Add button to toolbars
//     document.querySelectorAll(".extract-controls").forEach((control) => {
//       const clozeButton = document.createElement("button");
//       clozeButton.className = "cloze-button";
//       clozeButton.innerHTML = '<i class="fas fa-square"></i> Create Cloze';
//       clozeButton.addEventListener("click", () => {
//         const container = control.closest(".content-section, .extract");
//         const selection = window.getSelection();
//         const selectedText = selection.toString().trim();

//         if (selectedText) {
//           this.createClozeFromSelection(selectedText, container);
//         } else {
//           alert("Please select text to create a cloze deletion");
//         }
//       });
//       control.appendChild(clozeButton);
//     });

//     // Close context menu on click elsewhere
//     document.addEventListener("click", () => {
//       const menu = document.getElementById("clozeContextMenu");
//       if (menu) menu.remove();
//     });
//   },

//   showClozeMenu(x, y, selectedText, targetElement) {
//     // Remove any existing context menu
//     const existingMenu = document.getElementById("clozeContextMenu");
//     if (existingMenu) existingMenu.remove();

//     // Create context menu
//     const menu = document.createElement("div");
//     menu.id = "clozeContextMenu";
//     menu.className = "context-menu";
//     menu.innerHTML = `
//         <div class="menu-item" id="createCloze">Create Cloze Deletion</div>
//         <div class="menu-item" id="highlightText">Highlight Text</div>
//       `;

//     // Position the menu
//     menu.style.left = `${x}px`;
//     menu.style.top = `${y}px`;
//     document.body.appendChild(menu);

//     // Add event listeners
//     document.getElementById("createCloze").addEventListener("click", () => {
//       const container = targetElement.closest(".content-section, .extract");
//       this.createClozeFromSelection(selectedText, container);
//       menu.remove();
//     });

//     document.getElementById("highlightText").addEventListener("click", () => {
//       this.highlightSelection(selectedText);
//       menu.remove();
//     });
//   },

//   createClozeFromSelection(text, container) {
//     if (!text || !container) return;

//     // Get container paragraph
//     const paragraph = container.querySelector("p");
//     if (!paragraph) return;

//     // Get the current selection
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const fragment = range.extractContents();

//     // Create highlighted span instead of cloze deletion
//     const highlightSpan = document.createElement("span");
//     highlightSpan.className = "highlighted-text";
//     highlightSpan.appendChild(fragment);

//     // Insert back into the document
//     range.insertNode(highlightSpan);
//     selection.removeAllRanges();

//     // Create a flashcard for this cloze
//     this.createClozeFlashcard(text, container.id);
//   },

//   highlightSelection(text) {
//     // Find all text nodes containing the selection
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const fragment = range.extractContents();

//     // Create highlighted span
//     const highlightSpan = document.createElement("span");
//     highlightSpan.className = "highlighted-text";
//     highlightSpan.appendChild(fragment);

//     // Insert back into the document
//     range.insertNode(highlightSpan);
//     selection.removeAllRanges();
//   },

//   createClozeFlashcard(clozeText, containerId) {
//     const flashcardId = `cloze-${Date.now()}`;

//     // Create the question with the cloze deletion
//     const question = `Complete the sentence: "${clozeText.replace(
//       /(.{3,})/g,
//       "[...]"
//     )}"`;
//     const answer = clozeText;

//     // Create flashcard
//     FlashcardManager.createFlashcardElements(
//       [{ question, answer }],
//       containerId
//     );
//   },
// };

// ========================
// Search Module
// ========================

const SearchManager = {
  init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const searchResults = document.getElementById("searchResults");

    // Search on button click
    searchButton.addEventListener("click", () => {
      this.performSearch(searchInput.value.trim());
    });

    // Search on Enter key
    searchInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        this.performSearch(searchInput.value.trim());
      }

      // Hide results when input is cleared
      if (searchInput.value.trim() === "") {
        searchResults.style.display = "none";
      }
    });

    // Hide search results when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !searchInput.contains(e.target) &&
        !searchButton.contains(e.target) &&
        !searchResults.contains(e.target)
      ) {
        searchResults.style.display = "none";
      }
    });
  },

  performSearch(query) {
    if (!query) return;

    const searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = "";

    if (query.length < 2) {
      searchResults.innerHTML =
        '<div class="search-result-item">Type at least 2 characters to search</div>';
      searchResults.style.display = "block";
      return;
    }

    // Search in topics
    const topicResults = this.searchInTopics(query);

    // Search in extracts
    const extractResults = this.searchInExtracts(query);

    // Search in flashcards
    const flashcardResults = this.searchInFlashcards(query);

    // Combine results
    const allResults = [
      ...topicResults,
      ...extractResults,
      ...flashcardResults,
    ];

    if (allResults.length === 0) {
      searchResults.innerHTML =
        '<div class="search-result-item">No results found</div>';
    } else {
      // Sort results by relevance (exact matches first)
      allResults.sort((a, b) => {
        // Exact matches first
        const aExact = a.text.toLowerCase() === query.toLowerCase();
        const bExact = b.text.toLowerCase() === query.toLowerCase();

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then by number of occurrences
        return b.occurrences - a.occurrences;
      });

      // Add results to the search results container
      allResults.forEach((result) => {
        const resultItem = document.createElement("div");
        resultItem.className = "search-result-item";

        // Highlight the query in the result text
        const highlightedText = this.highlightQuery(result.text, query);

        resultItem.innerHTML = `
            <span class="search-result-type">${result.type}:</span>
            ${highlightedText}
          `;

        // Navigate to the item when clicked
        resultItem.addEventListener("click", () => {
          ContentTreeManager.navigateToItem(result.id);
          searchResults.style.display = "none";
        });

        searchResults.appendChild(resultItem);
      });
    }

    searchResults.style.display = "block";
  },

  searchInTopics(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    ContentManager.sections.forEach((section) => {
      const title = section.querySelector("h2")?.textContent || "";
      const content = section.querySelector("p")?.textContent || "";
      const fullText = `${title} ${content}`;

      if (fullText.toLowerCase().includes(lowerQuery)) {
        // Count occurrences
        const occurrences = (
          fullText.toLowerCase().match(new RegExp(lowerQuery, "g")) || []
        ).length;

        results.push({
          id: section.id,
          type: "Topic",
          text: title,
          occurrences: occurrences,
        });
      }
    });

    return results;
  },

  searchInExtracts(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    ContentManager.extracts.forEach((extract) => {
      const content = extract.querySelector("p")?.textContent || "";
      const sourceTitle =
        extract.querySelector(".parent-title")?.textContent || "";

      if (content.toLowerCase().includes(lowerQuery)) {
        // Count occurrences
        const occurrences = (
          content.toLowerCase().match(new RegExp(lowerQuery, "g")) || []
        ).length;

        // Get first sentence or truncate
        const firstSentenceMatch = content.match(/^[^.!?]+[.!?]/);
        let displayText = firstSentenceMatch
          ? firstSentenceMatch[0].trim()
          : content.length > 60
          ? content.substring(0, 60) + "..."
          : content;

        results.push({
          id: extract.id,
          type: "Extract",
          text: `${displayText} (from ${sourceTitle})`,
          occurrences: occurrences,
        });
      }
    });

    return results;
  },

  searchInFlashcards(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    ContentManager.flashcards.forEach((card) => {
      const question =
        card.querySelector(".flashcard-question")?.textContent || "";
      const answer = card.querySelector(".flashcard-answer")?.textContent || "";
      const fullText = `${question} ${answer}`;

      if (fullText.toLowerCase().includes(lowerQuery)) {
        // Count occurrences
        const occurrences = (
          fullText.toLowerCase().match(new RegExp(lowerQuery, "g")) || []
        ).length;

        results.push({
          id: card.id,
          type: "Flashcard",
          text: question,
          occurrences: occurrences,
        });
      }
    });

    return results;
  },

  highlightQuery(text, query) {
    // Create a regex for the query that ignores case
    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );

    // Replace all occurrences with highlighted version
    return text.replace(regex, '<span class="search-highlight">$1</span>');
  },
};

// ========================
// App Initialization
// ========================

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  addTopics();
  // Initialize modules
  ContentManager.init();
  FlashcardManager.init();
  ContentTreeManager.init();
  // ClozeManager.init();
  SearchManager.init();

  // Set up navigation buttons
  document.getElementById("nextButton").addEventListener("click", () => {
    ContentManager.goToNext();
  });

  // document.getElementById("prevButton").addEventListener("click", () => {
  //   ContentManager.goToPrevious();
  // });

  // Set up review button
  document.getElementById("reviewButton").addEventListener("click", () => {
    if (FlashcardManager.reviewQueue.length > 0) {
      FlashcardManager.openReviewModal();
    } else {
      alert("No cards are currently due for review.");
    }
  });

  // Set up close modal button
  document.getElementById("closeModal").addEventListener("click", () => {
    FlashcardManager.closeReviewModal();
  });
});

function addTopics() {
  const contentContainer = document.getElementById("contentContainer");
  const preset = 6;
  Object.keys(TOPICS).forEach((topic, i) => {
    const content = TOPICS[topic];
    const index = i + preset;
    const contentHtml = `<div class="content-section" id="topic${index}" data-topic="${topic}">
                <span class="content-type type-topic">Topic</span>
                <span class="topic-indicator topic-networking">${topic.toUpperCase()}</span>
                <div class="content-header">
                    <h2 contenteditable="true">${content.heading}</h2>
                    <div class="edit-controls">
                        <button class="edit-button"><i class="fas fa-edit"></i></button>
                        <button onclick="renderContent('test${index}')" class="preview-button"><i
                                class="fa fa-refresh"></i></button>
                    </div>
                </div>
                <p id="test${index}" contenteditable="true">${
      content.content
    }</p>
                <div class="extract-controls">
                    <button class="extract-button" data-source="topic1"><i class="fas fa-scissors"></i> Create
                        Extract from Selection</button>
                    <button class="flashcard-generator-button"><i class="fas fa-brain"></i> Generate
                        Flashcards</button>
                </div>
            </div>`;
    contentContainer.insertAdjacentHTML("beforeend", contentHtml);
  });
}

function renderContent(id) {
  var el = document.getElementById(id);
  var map = { amp: "&", lt: "<", gt: ">", quot: '"', "#039": "'" };
  var html = el.innerHTML.replace(/&([^;]+);/g, (m, c) => map[c]);
  el.innerHTML = html;
}
