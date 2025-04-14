// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");
const promptButtons = [
    document.getElementById("prompt-button-1"),
    document.getElementById("prompt-button-2"),
    document.getElementById("prompt-button-3"),
];
const promptModal = document.getElementById("prompt-modal");
const modalInput = document.getElementById("modal-input");
const modalCancel = document.getElementById("modal-cancel");
const modalSave = document.getElementById("modal-save");
const modalTitle = document.getElementById("modal-title");
const resetChatButton = document.getElementById("reset-chat");

let conversationHistory = [];
let currentPromptIndex = 0;
let prompts = [];
let hideNextResponse = false;
let temperature = 1.0; // Default temperature

// Default prompts
const DEFAULT_PROMPTS = [
    "Reply briefly and use gen z slang",
    "Respond like a 5 year old kid",
    "Respond with a detailed technical explanation",
];

// Load prompts from localStorage or set defaults
function loadPrompts() {
    const savedPrompts = localStorage.getItem("aiPrompts");
    if (savedPrompts) {
        prompts = JSON.parse(savedPrompts);
    } else {
        prompts = [...DEFAULT_PROMPTS];
        savePrompts();
    }
    updatePromptButtons();
}

// Save prompts to localStorage
function savePrompts() {
    localStorage.setItem("aiPrompts", JSON.stringify(prompts));
}

// Update the prompt buttons with current prompt text
function updatePromptButtons() {
    promptButtons.forEach((button, index) => {
        button.textContent = prompts[index] || `Prompt ${index + 1}`;
        button.title = prompts[index] || `Prompt ${index + 1}`;
    });
}

// Function to reset the chat history
function resetChatHistory() {
    conversationHistory = [];
    chatMessages.innerHTML = "";
    addMessage(
        "bot",
        "Hello! I'm an AI assistant powered by Cohere. How can I help you today?"
    );
}

// Function to add a message to the chat
function addMessage(role, message) {
    if (hideNextResponse && role === "bot") {
        hideNextResponse = false;
        return;
    }

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}-message`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = message;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message to the server
async function sendMessage(message, isPrompt = false) {
    if (!message && !userInput.value.trim()) return;

    const msg = message || userInput.value.trim();
    if (!msg) return;

    // Set flag to hide response if this is a prompt click
    hideNextResponse = isPrompt;

    // Only add user message to UI if not a prompt
    if (!isPrompt) {
        addMessage("user", msg);
    }

    if (!message) {
        userInput.value = "";
    }

    // Show typing indicator
    typingIndicator.style.display = "block";
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: msg,
                history: conversationHistory,
                temperature: temperature,
                user_message: user_message,
            }),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Add bot response to UI unless this was a prompt
        //if (!isPrompt) {
        addMessage("bot", data.response);
        //}

        // Update conversation history regardless of visibility
        conversationHistory = data.history;
    } catch (error) {
        console.error("Error:", error);
        if (!isPrompt) {
            addMessage("bot", `Sorry, an error occurred: ${error.message}`);
        }
    } finally {
        // Hide typing indicator
        typingIndicator.style.display = "none";
    }
}

// Event listeners
sendButton.addEventListener("click", () => sendMessage());
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// Prompt button event listeners
promptButtons.forEach((button, index) => {
    // Left click to send (hidden)
    button.addEventListener("click", (e) => {
        if (e.button === 0 && prompts[index]) {
            // Left click
            if (index === 0) {
                // If second prompt is clicked
                temperature = 0.7; // Change temperature to 0.3
                user_message =
                    "Forget any prior prompts, From now on respond to me in first person as if you were a Gen z using terms a gen z would use such as but not limited to rizz, gyat, sus, buss etc until further instructed, make your response short and consise, 1-2 lines maximum,  use as few words as possible";
            } else if (index === 1) {
                // If second prompt is clicked
                temperature = 0.3; // Change temperature to 0.3
                user_message =
                    "Forget any prior prompts, From now on respond to me in first person as if you were a 5 year old until further instructed, make your response short and consise, 1-2 lines maximum, and use as few words as possible, don't use proper grammer, don't include any scientific reasoning";
            } else if (index === 2) {
                // If second prompt is clicked
                temperature = 1; // Change temperature to 0.3
                user_message =
                    "Forget any prior prompts, From now on give me a very detailed response to anything I ask in first person until further instructed.";
            }
            sendMessage(prompts[index], true);
        }
    });

    // Right click to edit
    button.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        currentPromptIndex = index;
        modalTitle.textContent = `Edit Prompt ${index + 1}`;
        modalInput.value = prompts[index] || "";
        promptModal.style.display = "flex";
    });
});

// Reset chat button
resetChatButton.addEventListener("click", resetChatHistory);

// Modal event listeners
modalCancel.addEventListener("click", () => {
    promptModal.style.display = "none";
});

modalSave.addEventListener("click", () => {
    prompts[currentPromptIndex] = modalInput.value;
    savePrompts();
    updatePromptButtons();
    promptModal.style.display = "none";
});

// Close modal when clicking outside
promptModal.addEventListener("click", (e) => {
    if (e.target === promptModal) {
        promptModal.style.display = "none";
    }
});

// Initial setup
window.onload = function () {
    loadPrompts();
    addMessage(
        "bot",
        "Hello! I'm an AI assistant powered by Cohere. How can I help you today?"
    );
};
