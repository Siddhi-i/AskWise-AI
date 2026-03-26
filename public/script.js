document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const faqBtns = document.querySelectorAll('.faq-btn');
    const startChatBtn = document.getElementById('start-chat-btn');

    // Storage Key
    const CHAT_HISTORY_KEY = 'askwise_chat_history';

    // State
    let isTyping = false;
    let memStorage = {};

    // ----- Safe Storage Wrappers -----
    function safeGetItem(key) {
        try { return localStorage.getItem(key); }
        catch(e) { return memStorage[key] || null; }
    }
    function safeSetItem(key, value) {
        try { localStorage.setItem(key, value); }
        catch(e) { memStorage[key] = value; }
    }
    function safeRemoveItem(key) {
        try { localStorage.removeItem(key); }
        catch(e) { delete memStorage[key]; }
    }

    // ----- Initialization -----
    try {
        initTheme();
        loadChatHistory();
    } catch(e) {
        console.error("Initialization error:", e);
    }

    // ----- Event Listeners -----
    
    // Theme Toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Input Input event (for send button state)
    if (chatInput && sendBtn) {
        chatInput.addEventListener('input', () => {
            sendBtn.disabled = chatInput.value.trim().length === 0;
        });
    }

    // Chat Form Submit
    if (chatForm) {
        chatForm.addEventListener('submit', handleSend);
    }

    // Clear Chat
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the chat history?')) {
                safeRemoveItem(CHAT_HISTORY_KEY);
                chatMessages.innerHTML = '';
                showWelcomeMessage();
            }
        });
    }

    // FAQ Buttons initial load
    if (faqBtns) {
        faqBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.textContent;
                processUserMessage(question);
            });
        });
    }

    // Start Chat Button
    if (startChatBtn) {
        startChatBtn.addEventListener('click', () => {
            document.getElementById('chat-section').scrollIntoView({ behavior: 'smooth' });
            if (chatInput) chatInput.focus();
        });
    }

    // ----- Functions -----

    function initTheme() {
        const savedTheme = safeGetItem('askwise_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            if (themeIcon) themeIcon.textContent = 'light_mode';
        } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            if (themeIcon) themeIcon.textContent = 'light_mode';
        }
    }

    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        if (themeIcon) themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
        safeSetItem('askwise_theme', isDark ? 'dark' : 'light');
    }

    window.triggerFaqBtn = function(text) {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        if (input && sendBtn) {
            input.value = text;
            sendBtn.disabled = false;
            sendBtn.click();
        }
    }

    function showWelcomeMessage() {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <span class="material-symbols-outlined welcome-icon">waving_hand</span>
                <h3>Hi there! 👋</h3>
                <p>I'm AskWise AI. How can I help you today?</p>
                
                <div class="faq-suggestions">
                    <button class="faq-btn" onclick="triggerFaqBtn(this.textContent)">What is this app?</button>
                    <button class="faq-btn" onclick="triggerFaqBtn(this.textContent)">How does it work?</button>
                    <button class="faq-btn" onclick="triggerFaqBtn(this.textContent)">Contact support</button>
                </div>
            </div>
        `;
    }

    function handleSend(e) {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || isTyping) return;
        processUserMessage(text);
    }

    function processUserMessage(text) {
        const welcomeMsg = chatMessages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageId = Date.now().toString();
        addMessageToChat('user', text, messageId);
        saveMessage('user', text, messageId);

        chatInput.value = '';
        sendBtn.disabled = true;

        simulateAIResponse(text);
    }

    function addMessageToChat(sender, text, id, animate = true) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}`;
        messageEl.dataset.id = id;
        
        if (!animate) {
            messageEl.style.animation = 'none';
        }

        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let innerHTML = `
            <div class="message-content">${escapeHTML(text)}</div>
            <div class="message-meta">
                <span class="time">${timeString}</span>
        `;

        if (sender === 'bot') {
            const feedbackState = getFeedbackForMessage(id);
            const isUpActive = feedbackState === 'up' ? 'active' : '';
            const isDownActive = feedbackState === 'down' ? 'active' : '';

            innerHTML += `
                <div class="feedback-actions">
                    <button class="feedback-btn up ${isUpActive}" aria-label="Helpful" onclick="handleFeedback('${id}', 'up', this)">
                        <span class="material-symbols-outlined">thumb_up</span>
                    </button>
                    <button class="feedback-btn down ${isDownActive}" aria-label="Not Helpful" onclick="handleFeedback('${id}', 'down', this)">
                        <span class="material-symbols-outlined">thumb_down</span>
                    </button>
                </div>
            `;
        }

        innerHTML += `</div>`;
        messageEl.innerHTML = innerHTML;
        chatMessages.appendChild(messageEl);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function simulateAIResponse(userText) {
        isTyping = true;
        typingIndicator.classList.remove('hidden');
        scrollToBottom();

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userText })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json();
            const responseText = data.reply;
            const messageId = Date.now().toString();
            
            addMessageToChat('bot', responseText, messageId);
            saveMessage('bot', responseText, messageId);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            const errorMessage = `⚠️ Backend Error: ${error.message}`;
            const messageId = Date.now().toString();
            addMessageToChat('bot', errorMessage, messageId);
            saveMessage('bot', errorMessage, messageId);
        } finally {
            isTyping = false;
            typingIndicator.classList.add('hidden');
            scrollToBottom();
        }
    }

    function saveMessage(sender, text, id) {
        const history = getChatHistory();
        history.push({ sender, text, id, timestamp: Date.now() });
        safeSetItem(CHAT_HISTORY_KEY, JSON.stringify(history));
    }

    function getChatHistory() {
        const history = safeGetItem(CHAT_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    function loadChatHistory() {
        const history = getChatHistory();
        if (history.length > 0) {
            chatMessages.innerHTML = '';
            history.forEach(msg => {
                addMessageToChat(msg.sender, msg.text, msg.id, false);
            });
        }
    }

    window.handleFeedback = function(messageId, type, btnElement) {
        const parent = btnElement.parentElement;
        const upBtn = parent.querySelector('.up');
        const downBtn = parent.querySelector('.down');
        let currentState = 'none';
        
        if (btnElement.classList.contains('active')) {
            btnElement.classList.remove('active');
        } else {
            upBtn.classList.remove('active');
            downBtn.classList.remove('active');
            btnElement.classList.add('active');
            currentState = type;
        }
        saveFeedback(messageId, currentState);
    };

    function saveFeedback(messageId, state) {
        const feedbacks = JSON.parse(safeGetItem('askwise_feedback') || '{}');
        feedbacks[messageId] = state;
        safeSetItem('askwise_feedback', JSON.stringify(feedbacks));
    }

    function getFeedbackForMessage(messageId) {
        const feedbacks = JSON.parse(safeGetItem('askwise_feedback') || '{}');
        return feedbacks[messageId] || 'none';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({'&': '&amp;','<': '&lt;','>': '&gt;',"'": '&#39;','"': '&quot;'}[tag] || tag)
        );
    }
});
