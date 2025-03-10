# Serendipity-web: Absolute spagheti supermemo demo

### How to run:
    1. Make sure you have ollama installed and running
    2. Run 'ollama pull mistral' if you don't have the model downloaded
    3. Put all 3 files - index.html, script.js and styles.css in one folder
    4. Open index.html in browser

### Implemented Features: 
    1. Clickable simple content tree for navigation
    2. Creates nesting extracts and flashcards
    3. Editable topics, extracts and flashcard questions
    4. Grading using shorter intervals -- modification of anki SM 2
    5. Subject title, tag for each topic, flashcard and extracts page to differentiate
    6. Review cards 
    7. Flashcard generation button with ollama local LLM as backend
    8. Search functionality implemented

### TODOs: 
    - [ ] Host the app @Michael
    - [ ] Add Markdown functionality
    - [ ] Add new topics manually (needs better content for demo)
    - [ ] Add images
        - [ ] Also think about extracts and flashcards when images are present
    - [ ] Import feature --> copy, paste text
    - [ ] Import web pages to add new topics --> when a link is added, scrape the web page and add content to as new topic
    - [ ] Flashcard generation using LLM
        - [ ] Need to fix (ollama) local LLM API integration in script.js --> doesn't generate intelligent flashcards.
        - [ ] If ollama is slow or doesn't work properly, implement commercial API integration
    - [ ] Remove previous button, the next button just goes through the learning queue
    - [ ] Show message that all cards are done at the end.
    - [ ] The progress bar is buggy
    - [ ] Remove previous button, Next button is enough
    - [x] Add search functionality
    - [ ] Add learning queue
    - [ ] Add icons to content tree
    - [ ] The parent text must be highlighted once extract is done
    - [ ] Implement cloze
    - [ ] Implement automated extracts and flashcards (only if high quality questions and extracts can be generated by AI)
    - [ ] Rearrange content tree feature
    - [ ] Extract and ask questions on the extracted part! LLM chat UI with content tree (maybe a separate demo)
    
