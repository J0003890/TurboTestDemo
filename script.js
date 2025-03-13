// Global variables
let currentLevel = 1;
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let currentUser = null;
const users = {};

// Use the existing database reference from firebase-config.js instead of creating a new one
// const database = firebase.database(); - This was causing the error

// DOM Elements - Welcome Screen
const welcomeScreen = document.getElementById('welcome-screen');
const startMainBtn = document.getElementById('start-main-btn');
const adminBtn = document.getElementById('admin-btn');

// DOM Elements - Registration Screen
const registrationScreen = document.getElementById('registration-screen');
const nationalIdInput = document.getElementById('national-id');
const firstNameInput = document.getElementById('first-name');
const lastNameInput = document.getElementById('last-name');
const nickNameInput = document.getElementById('nick-name');
const readyBtn = document.getElementById('ready-btn');
const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
const idError = document.getElementById('id-error');

// DOM Elements - Start Screen
const startScreen = document.getElementById('start-screen');
const userNameSpan = document.getElementById('user-name');
const userCurrentLevelSpan = document.getElementById('user-current-level');
const startQuizBtn = document.getElementById('start-quiz-btn');
const logoutBtn = document.getElementById('logout-btn');

// DOM Elements - Quiz Screen
const quizScreen = document.getElementById('quiz-screen');
const currentLevelElement = document.getElementById('current-level');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitBtn = document.getElementById('submit-btn');
const questionNumberElement = document.getElementById('question-number');
const totalQuestionsElement = document.getElementById('total-questions');

// DOM Elements - Result Screen
const resultScreen = document.getElementById('result-screen');
const scoreElement = document.getElementById('score');
const levelResultElement = document.getElementById('level-result');
const continueBtn = document.getElementById('continue-btn');

// DOM Elements - Admin Screen
const adminScreen = document.getElementById('admin-screen');
const adminPassword = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');
const adminControls = document.getElementById('admin-controls');
const adminLogin = document.getElementById('admin-login');
const adminBackBtnLogin = document.getElementById('admin-back-btn-login');
const adminBackBtn = document.getElementById('admin-back-btn');

// Admin Tab Elements
const singleQuestionTab = document.getElementById('single-question-tab');
const batchQuestionTab = document.getElementById('batch-question-tab');
const questionBankTab = document.getElementById('question-bank-tab');
const userDataTab = document.getElementById('user-data-tab');

// Single Question Elements
const levelSelect = document.getElementById('level-select');
const questionInput = document.getElementById('question-input');
const optionInputs = document.querySelectorAll('.option-input');
const correctOption = document.getElementById('correct-option');
const addQuestionBtn = document.getElementById('add-question-btn');

// Batch Question Elements
const batchLevelSelect = document.getElementById('batch-level-select');
const loadBatchFormBtn = document.getElementById('load-batch-form-btn');
const batchQuestionsContainer = document.getElementById('batch-questions-container');
const saveBatchBtn = document.getElementById('save-batch-btn');

// Question Bank Elements
const bankLevelSelect = document.getElementById('bank-level-select');
const loadBankBtn = document.getElementById('load-bank-btn');
const deleteSelectedBtn = document.getElementById('delete-selected-btn');
const questionBankContainer = document.getElementById('question-bank-container');

// User Data Elements
const exportUsersBtn = document.getElementById('export-users-btn');
const usersContainer = document.getElementById('users-container');

// Level 10 title mapping based on score
const level10Titles = {
    10: "Ascended Deity",
    9: "Eternal Emperor",
    8: "Celestial Warlord",
    7: "Architect of Destiny",
    6: "Omniscient Strategist",
    5: "Mastermind Sovereign",
    4: "Shadow Overlord",
    3: "Golden Conqueror",
    2: "Warforged Titan",
    1: "Stormborn Tactician",
    0: "Stormborn Tactician" // Fallback for score 0
};

// Debug function to check element existence
function debugElements() {
    console.log("Checking DOM elements:");
    console.log("Welcome screen exists:", !!welcomeScreen);
    console.log("Start button exists:", !!startMainBtn);
    console.log("Admin button exists:", !!adminBtn);
    
    if (!startMainBtn) {
        console.error("Start button not found in DOM");
    }
    
    if (!adminBtn) {
        console.error("Admin button not found in DOM");
    }
}

// Helper functions
function hideAllScreens() {
    console.log("Hiding all screens");
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (registrationScreen) registrationScreen.classList.add('hidden');
    if (startScreen) startScreen.classList.add('hidden');
    if (quizScreen) quizScreen.classList.add('hidden');
    if (resultScreen) resultScreen.classList.add('hidden');
    if (adminScreen) adminScreen.classList.add('hidden');
}

function showScreen(screen) {
    console.log("Showing screen:", screen?.id);
    if (screen) {
        screen.classList.remove('hidden');
    } else {
        console.error("Attempted to show a screen that doesn't exist");
    }
}

// Show registration screen
function showRegistrationScreen() {
    console.log("Showing registration screen");
    hideAllScreens();
    showScreen(registrationScreen);
    
    // Clear form fields
    if (nationalIdInput) nationalIdInput.value = '';
    if (firstNameInput) firstNameInput.value = '';
    if (lastNameInput) lastNameInput.value = '';
    if (nickNameInput) nickNameInput.value = '';
    if (idError) idError.textContent = '';
}

// Show welcome screen
function showWelcomeScreen() {
    console.log("Showing welcome screen");
    hideAllScreens();
    showScreen(welcomeScreen);
}

// Show Admin Screen
function showAdminScreen() {
    console.log("Showing admin screen");
    hideAllScreens();
    showScreen(adminScreen);
    
    // Reset admin form
    if (adminPassword) adminPassword.value = '';
    if (adminControls) adminControls.classList.add('hidden');
    if (adminLogin) adminLogin.classList.remove('hidden');
}

// Check connection status with Firebase
function checkFirebaseConnection() {
    try {
        const connectedRef = firebase.database().ref(".info/connected");
        connectedRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("Connected to Firebase");
            } else {
                console.log("Disconnected from Firebase");
            }
        });
    } catch (error) {
        console.error("Error checking Firebase connection:", error);
    }
}

// Delete selected questions - FIXED THE MISSING BRACKET HERE
function deleteSelectedQuestions() {
    const level = parseInt(bankLevelSelect.value);
    const selectedCheckboxes = document.querySelectorAll('.question-checkbox:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('No questions selected for deletion');
        return;
    } // FIXED: Added the missing closing bracket here
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete ${selectedCheckboxes.length} question(s)?`)) {
        return;
    }
    
    // Get indices to delete (in descending order to avoid index shifting issues)
    const indicesToDelete = Array.from(selectedCheckboxes)
        .map(checkbox => parseInt(checkbox.dataset.index))
        .sort((a, b) => b - a); // Sort in descending order
    
    // Remove questions
    indicesToDelete.forEach(index => {
        allQuestions[level].splice(index, 1);
    });
    
    // Save to Firebase
    saveQuestionsToStorage().then(() => {
        // Reload question bank
        loadQuestionBank();
        
        alert(`${selectedCheckboxes.length} question(s) deleted successfully!`);
    });
}

// Validate National ID
function validateNationalId() {
    const value = nationalIdInput.value.replace(/[^0-9]/g, '');
    
    // Update input field with numbers only
    nationalIdInput.value = value;
    
    // Check length
    if (value.length > 0 && value.length !== 13) {
        idError.textContent = 'National ID must be exactly 13 digits';
    } else {
        idError.textContent = '';
    }
}

// Set active tab
function setActiveTab(tabId) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to selected tab
    const tab = document.getElementById(tabId);
    if (tab) tab.classList.add('active');
}

// Show Admin Section
function showAdminSection(sectionId) {
    // Hide all sections
    const sections = [
        'single-question-section',
        'batch-question-section',
        'question-bank-section',
        'user-data-section'
    ];
    
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) element.classList.add('hidden');
    });
    
    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) selectedSection.classList.remove('hidden');
}

// Handle registration
function handleRegistration() {
    const nationalId = nationalIdInput.value.trim();
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const nickName = nickNameInput.value.trim();
    
    // Validate inputs
    if (nationalId.length !== 13) {
        idError.textContent = 'National ID must be exactly 13 digits';
        return;
    }
    
    if (!firstName || !lastName) {
        alert('Please enter your first name and last name');
        return;
    }
    
    // Create or update user
    const userId = nationalId;
    
    if (!users[userId]) {
        // New user
        users[userId] = {
            nationalId: nationalId,
            firstName: firstName,
            lastName: lastName,
            nickName: nickName,
            level: 1,  // Always start at level 1
            history: [],
            completed: false // New flag to track completion status
        };
    } else {
        // Existing user - update info but keep level
        users[userId].firstName = firstName;
        users[userId].lastName = lastName;
        users[userId].nickName = nickName;
        
        // Check if user has already completed the program
        if (users[userId].completed) {
            alert("You have already completed all tests. Thank you for participating!");
            showWelcomeScreen();
            return;
        }
    }
    
    // Set current user
    currentUser = users[userId];
    
    // Save users to Firebase
    saveUsersToStorage();
    
    // Start the quiz directly
    startQuiz();
}

// Handle user logout
function handleLogout() {
    currentUser = null;
    hideAllScreens();
    showScreen(welcomeScreen);
}

// Load users from Firebase
function loadUsersFromStorage() {
    return database.ref('users').once('value')
        .then((snapshot) => {
            const savedUsers = snapshot.val();
            if (savedUsers) {
                Object.assign(users, savedUsers);
            }
        })
        .catch((error) => {
            console.error("Error loading users:", error);
        });
}

// Save users to Firebase
function saveUsersToStorage() {
    return database.ref('users').set(users)
        .catch((error) => {
            console.error("Error saving users:", error);
            alert("There was an error saving user data. Please try again.");
        });
}

// Load questions from Firebase
function loadQuestionsFromStorage() {
    return database.ref('questions').once('value')
        .then((snapshot) => {
            const savedQuestions = snapshot.val();
            if (savedQuestions) {
                // REPLACE instead of merge
                // Clear all existing questions first
                allQuestions = {}; 
                // Then add Firebase questions
                Object.assign(allQuestions, savedQuestions);
                console.log("Questions loaded from Firebase");
            } else {
                // If no questions in Firebase, ensure we have an empty question bank
                allQuestions = {};
                console.log("No questions found in Firebase");
            }
        })
        .catch((error) => {
            console.error("Error loading questions:", error);
        });
}

// Save questions to Firebase
function saveQuestionsToStorage() {
    return database.ref('questions').set(allQuestions)
        .catch((error) => {
            console.error("Error saving questions:", error);
            alert("There was an error saving questions. Please try again.");
        });
}

// Start the quiz
function startQuiz() {
    if (!currentUser) {
        hideAllScreens();
        showScreen(registrationScreen);
        return;
    }
    
    // Check if user has already completed the program
    if (currentUser.completed) {
        alert("You have already completed all tests. Thank you for participating!");
        showWelcomeScreen();
        return;
    }
    
    // Check if user has already taken 10 tests
    if (currentUser.history && currentUser.history.length >= 10) {
        currentUser.completed = true;
        saveUsersToStorage();
        alert("You have reached the maximum number of tests (10). Thank you for participating!");
        showWelcomeScreen();
        return;
    }
    
    // Use the user's current level instead of always starting at level 1
    currentLevel = currentUser.level;
    
    hideAllScreens();
    showScreen(quizScreen);
    loadQuestionsForCurrentLevel();
    updateQuizUI();
}

// Load questions for the current level
function loadQuestionsForCurrentLevel() {
    if (allQuestions[currentLevel] && allQuestions[currentLevel].length > 0) {
        // Shuffle and get 10 questions (or all if less than 10)
        currentQuestions = [...allQuestions[currentLevel]]
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(10, allQuestions[currentLevel].length));
    } else {
        // If no questions are defined for this level, use default
        currentQuestions = [
            {
                question: "Sample question for level " + currentLevel,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctOptionIndex: 0
            }
        ];
    }
    
    currentQuestionIndex = 0;
    score = 0;
}

// Update the quiz UI with the current question
function updateQuizUI() {
    // Update level display
    currentLevelElement.textContent = currentLevel;
    
    // Update progress
    questionNumberElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // Display current question
    const currentQuestion = currentQuestions[currentQuestionIndex];
    questionText.textContent = currentQuestion.question;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Shuffle options for display
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    
    // Create mapping from shuffled index to original index for correct answer checking
    const optionMapping = shuffledOptions.map(option => 
        currentQuestion.options.indexOf(option)
    );
    
    // Add options to container
    shuffledOptions.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.dataset.originalIndex = optionMapping[index];
        
        optionElement.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option').forEach(opt => {
                opt.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            optionElement.classList.add('selected');
            selectedOption = parseInt(optionElement.dataset.originalIndex);
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset selected option
    selectedOption = null;
}

// Submit answer handler
function submitAnswer() {
    if (selectedOption === null) {
        alert('Please select an option');
        return;
    }
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // Create incorrectAnswers array in the current session if it doesn't exist
    if (!window.currentTestIncorrectAnswers) {
        window.currentTestIncorrectAnswers = [];
    }
    
    // Check if answer is correct
    if (selectedOption === currentQuestion.correctOptionIndex) {
        score++;
    } else {
        // Track incorrect answer
        window.currentTestIncorrectAnswers.push({
            question: currentQuestion.question,
            userAnswer: currentQuestion.options[selectedOption],
            correctAnswer: currentQuestion.options[currentQuestion.correctOptionIndex]
        });
    }
    
    // Move to next question or show results
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuestions.length) {
        updateQuizUI();
    } else {
        showResults();
    }
}

// Show results screen
function showResults() {
    hideAllScreens();
    showScreen(resultScreen);
    
    // Display score
    scoreElement.textContent = score;
    
    // Determine new level based on progression rules
    const nextLevel = determineNextLevel();
    
    // Check if user has completed the program (reached level 10)
    const hasCompletedLevel10 = currentLevel === 10;
    // Count total tests taken (including this one)
    const testsTaken = currentUser.history ? currentUser.history.length + 1 : 1;
    const hasReachedMaxTests = testsTaken >= 10;
    
    // Prepare result message and record history
    let resultMessage;
    let completionTitle = '';
    
    // Set completion status
    if (hasCompletedLevel10 || hasReachedMaxTests) {
        currentUser.completed = true;
    }
    
    // Determine message based on completion status
    if (hasCompletedLevel10) {
        // User has completed level 10
        completionTitle = level10Titles[score] || "Stormborn Tactician";
        resultMessage = `Completed at Level 10 with title: ${completionTitle}`;
        
        // Create a more dramatic title display with custom class for styling
        levelResultElement.innerHTML = `
            <p>Test Completed! You have received the title of</p>
            <div class="title-display">
                <span class="title-effect title-${completionTitle.toLowerCase().replace(/\s+/g, '-')}">${completionTitle}</span>
            </div>
        `;
    } else if (hasReachedMaxTests) {
        // User has reached 10 tests
        resultMessage = `Completed after ${testsTaken} tests at Level ${currentLevel}`;
        levelResultElement.textContent = `Test Completed! You are at Level ${nextLevel}`;
    } else if (nextLevel > currentLevel) {
        resultMessage = `Advanced to Level ${nextLevel}`;
        levelResultElement.textContent = `Great job! You will advance to Level ${nextLevel}.`;
    } else if (nextLevel < currentLevel) {
        resultMessage = `Moved back to Level ${nextLevel}`;
        levelResultElement.textContent = `Based on your score, you will move back to Level ${nextLevel}.`;
    } else {
        resultMessage = `Remained at Level ${nextLevel}`;
        levelResultElement.textContent = `You will remain at Level ${nextLevel}.`;
    }
    
    // Record test history
    if (currentUser) {
        const testDate = new Date().toISOString().split('T')[0];
        
        currentUser.history.push({
            date: testDate,
            level: currentLevel,
            score: score,
            result: resultMessage,
            completionTitle: completionTitle,
            incorrectAnswers: window.currentTestIncorrectAnswers || []
        });
        
        // Reset the tracking for the next test
        window.currentTestIncorrectAnswers = [];
        
        // Update user's level only if not completed
        if (!currentUser.completed) {
            currentUser.level = nextLevel;
        }
        
        // Save users to Firebase
        saveUsersToStorage();
    }
}

// Determine next level based on score and progression rules
function determineNextLevel() {
    const rules = progressionRules[currentLevel];
    
    // Find which score range the current score falls into
    for (const range in rules) {
        const [min, max] = range.split('-').map(num => parseInt(num));
        if (score >= min && score <= max) {
            return rules[range];
        }
    }
    
    return currentLevel; // Default to current level if no rule matches
}

// Continue to next level
function continueToNextLevel() {
    if (currentUser) {
        if (currentUser.completed) {
            // If the user has completed the program, go back to welcome screen
            hideAllScreens();
            showScreen(welcomeScreen);
        } else {
            // Update display with user's info
            userNameSpan.textContent = currentUser.nickName || currentUser.firstName;
            userCurrentLevelSpan.textContent = currentUser.level;
            
            hideAllScreens();
            showScreen(startScreen);
        }
    } else {
        // If somehow there's no current user, go back to welcome
        hideAllScreens();
        showScreen(welcomeScreen);
    }
}

// Admin login handler
function adminLoginHandler() {
    const password = adminPassword.value;
    
    // Simple password check (in a real app, this would be more secure)
    if (password === 'admin123') {
        adminLogin.classList.add('hidden');
        adminControls.classList.remove('hidden');
        
        // Set question bank as default active tab
        setActiveTab('question-bank-tab');
        showAdminSection('question-bank-section');
        
        // Load question bank
        loadQuestionBank();
    } else {
        alert('Incorrect password');
    }
}

// Add new question
function addNewQuestion() {
    const level = parseInt(levelSelect.value);
    const question = questionInput.value.trim();
    
    if (!question) {
        alert('Please enter a question');
        return;
    }
    
    const options = [];
    let allOptionsFilled = true;
    
    optionInputs.forEach(input => {
        const optionText = input.value.trim();
        if (!optionText) {
            allOptionsFilled = false;
        }
        options.push(optionText);
    });
    
    if (!allOptionsFilled) {
        alert('Please fill in all options');
        return;
    }
    
    const correctOptionIndex = parseInt(correctOption.value);
    
    // Initialize level array if it doesn't exist
    if (!allQuestions[level]) {
        allQuestions[level] = [];
    }
    
    // Add the new question
    allQuestions[level].push({
        question,
        options,
        correctOptionIndex
    });
    
    // Save to Firebase
    saveQuestionsToStorage().then(() => {
        // Reset form
        questionInput.value = '';
        optionInputs.forEach(input => {
            input.value = '';
        });
        correctOption.value = '0';
        
        alert('Question added successfully!');
    });
}

// Show batch question input form
function showBatchQuestionInput() {
    // Generate 10 question input rows for the selected level
    batchQuestionsContainer.innerHTML = '';
    
    const level = parseInt(batchLevelSelect.value);
    
    for (let i = 0; i < 10; i++) {
        const questionRow = document.createElement('div');
        questionRow.classList.add('question-row');
        questionRow.innerHTML = `
            <h4>Question ${i + 1}</h4>
            <textarea class="batch-question" placeholder="Enter question"></textarea>
            <div class="batch-options">
                <input type="text" class="batch-option" placeholder="Option 1">
                <input type="text" class="batch-option" placeholder="Option 2">
                <input type="text" class="batch-option" placeholder="Option 3">
                <input type="text" class="batch-option" placeholder="Option 4">
            </div>
            <div class="batch-correct">
                <label>Correct Answer:</label>
                <select class="batch-correct-option">
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                </select>
            </div>
        `;
        batchQuestionsContainer.appendChild(questionRow);
    }
}

// Save batch questions
function saveBatchQuestions() {
    const level = parseInt(batchLevelSelect.value);
    const questionRows = document.querySelectorAll('.question-row');
    let questionsAdded = 0;
    
    // Initialize level array if it doesn't exist
    if (!allQuestions[level]) {
        allQuestions[level] = [];
    }
    
    questionRows.forEach(row => {
        const questionText = row.querySelector('.batch-question').value.trim();
        if (!questionText) return; // Skip empty questions
        
        const options = [];
        let allOptionsFilled = true;
        
        row.querySelectorAll('.batch-option').forEach(input => {
            const optionText = input.value.trim();
            if (!optionText) {
                allOptionsFilled = false;
            }
            options.push(optionText);
        });
        
        if (!allOptionsFilled) return; // Skip if options aren't filled
        
        const correctOptionIndex = parseInt(row.querySelector('.batch-correct-option').value);
        
        // Add the question
        allQuestions[level].push({
            question: questionText,
            options: options,
            correctOptionIndex: correctOptionIndex
        });
        
        questionsAdded++;
    });
    
    // Save to Firebase
    saveQuestionsToStorage().then(() => {
        alert(`${questionsAdded} questions added successfully to Level ${level}!`);
    });
}

// Load question bank for selected level
function loadQuestionBank() {
    const level = parseInt(bankLevelSelect.value);
    questionBankContainer.innerHTML = '';
    
    // If no questions for this level
    if (!allQuestions[level] || allQuestions[level].length === 0) {
        questionBankContainer.innerHTML = `
            <div class="no-questions-message">
                No questions found for Level ${level}
            </div>
        `;
        return;
    }
    
    // Create table for questions
    const table = document.createElement('table');
    table.classList.add('question-table');
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th class="select-column">
                <input type="checkbox" id="select-all-checkbox">
            </th>
            <th>Question</th>
            <th>Options</th>
            <th>Correct Answer</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Add each user to the table
    userIds.forEach(userId => {
        const user = users[userId];
        const tr = document.createElement('tr');
        
        // Format National ID for display
        let formattedId = user.nationalId;
        if (formattedId.length === 13) {
            formattedId = formattedId.substring(0, 1) + '-' +
                        formattedId.substring(1, 5) + '-' +
                        formattedId.substring(5, 10) + '-' +
                        formattedId.substring(10, 12) + '-' +
                        formattedId.substring(12);
        }
        
        // Check if the user has a completion title (from level 10)
        let completionTitle = '';
        if (user.history && user.history.length > 0) {
            // Get the last test
            const lastTest = user.history[user.history.length - 1];
            if (lastTest.completionTitle) {
                completionTitle = lastTest.completionTitle;
            }
        }
        
        tr.innerHTML = `
            <td>${formattedId}</td>
            <td>${user.firstName}</td>
            <td>${user.lastName}</td>
            <td>${user.nickName || '-'}</td>
            <td>${user.level}</td>
            <td>${user.history.length ? user.history.length + ' tests' : 'No tests taken'}</td>
            <td>${user.completed ? (completionTitle ? 'Completed: ' + completionTitle : 'Completed') : 'In progress'}</td>
        `;
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    usersContainer.appendChild(table);
}

// Export user data to Excel
function exportUserData() {
    const userIds = Object.keys(users);
    
    if (userIds.length === 0) {
        alert('No user data available to export');
        return;
    }
    
    // Create data for export
    const exportData = [
        ['National ID', 'First Name', 'Last Name', 'Nickname', 'Current Level', 'Test History', 'Status', 'Completion Title']
    ];
    
    userIds.forEach(userId => {
        const user = users[userId];
        
        // Format National ID for export
        let formattedId = user.nationalId;
        if (formattedId.length === 13) {
            formattedId = formattedId.substring(0, 1) + '-' +
                        formattedId.substring(1, 5) + '-' +
                        formattedId.substring(5, 10) + '-' +
                        formattedId.substring(10, 12) + '-' +
                        formattedId.substring(12);
        }
        
        // Get completion title if available
        let completionTitle = '';
        if (user.history && user.history.length > 0) {
            // Get the last test
            const lastTest = user.history[user.history.length - 1];
            if (lastTest.completionTitle) {
                completionTitle = lastTest.completionTitle;
            }
        }
        
        // Basic user row
        const userRow = [
            formattedId,
            user.firstName,
            user.lastName,
            user.nickName || '',
            user.level,
            user.history.length || 0,
            user.completed ? 'Completed' : 'In progress',
            completionTitle
        ];
        
        exportData.push(userRow);
    });
    
    // Create detailed history sheet
    const historyData = [
        ['National ID', 'Name', 'Date', 'Level', 'Score', 'Result', 'Completion Title']
    ];
    
    userIds.forEach(userId => {
        const user = users[userId];
        
        if (user.history) {
            user.history.forEach(entry => {
                historyData.push([
                    user.nationalId,
                    `${user.firstName} ${user.lastName}`,
                    entry.date,
                    entry.level,
                    entry.score,
                    entry.result,
                    entry.completionTitle || ''
                ]);
            });
        }
    });
    
    // Create incorrect answers sheet
    const incorrectAnswersData = [
        ['National ID', 'Name', 'Date', 'Level', 'Question', 'User Answer', 'Correct Answer']
    ];
    
    userIds.forEach(userId => {
        const user = users[userId];
        
        // Only add if the user has incorrectAnswers data
        if (user.history) {
            user.history.forEach(historyEntry => {
                // Check if this history entry has incorrectAnswers
                if (historyEntry.incorrectAnswers && historyEntry.incorrectAnswers.length > 0) {
                    historyEntry.incorrectAnswers.forEach(answer => {
                        incorrectAnswersData.push([
                            user.nationalId,
                            `${user.firstName} ${user.lastName}`,
                            historyEntry.date,
                            historyEntry.level,
                            answer.question,
                            answer.userAnswer,
                            answer.correctAnswer
                        ]);
                    });
                }
            });
        }
    });
    
    // Create workbook with three sheets
    const wb = XLSX.utils.book_new();
    
    // Add users sheet
    const usersWs = XLSX.utils.aoa_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, usersWs, 'Users');
    
    // Add history sheet if there's history data
    if (historyData.length > 1) {
        const historyWs = XLSX.utils.aoa_to_sheet(historyData);
        XLSX.utils.book_append_sheet(wb, historyWs, 'Test History');
    }
    
    // Add incorrect answers sheet if there's data
    if (incorrectAnswersData.length > 1) {
        const incorrectWs = XLSX.utils.aoa_to_sheet(incorrectAnswersData);
        XLSX.utils.book_append_sheet(wb, incorrectWs, 'Incorrect Answers');
    }
    
    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'quiz_user_data.xlsx');
}

// Initialize the application
function init() {
    console.log("Initializing application...");
    debugElements();
    
    // Add event listeners - Welcome Screen
    if (startMainBtn) {
        startMainBtn.addEventListener('click', function() {
            console.log("Start button clicked");
            showRegistrationScreen();
        });
    }
    
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            console.log("Admin button clicked");
            showAdminScreen();
        });
    }
    
    // Add event listeners - Registration Screen
    if (readyBtn) {
        readyBtn.addEventListener('click', handleRegistration);
    }
    
    if (backToWelcomeBtn) {
        backToWelcomeBtn.addEventListener('click', showWelcomeScreen);
    }
    
    if (nationalIdInput) {
        nationalIdInput.addEventListener('input', validateNationalId);
    }
    
    // Add event listeners - Start Screen
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', startQuiz);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add event listeners - Quiz Screen
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    // Add event listeners - Result Screen
    if (continueBtn) {
        continueBtn.addEventListener('click', continueToNextLevel);
    }
    
    // Add event listeners - Admin Screen
    if (loginBtn) {
        loginBtn.addEventListener('click', adminLoginHandler);
    }
    
    if (adminBackBtnLogin) {
        adminBackBtnLogin.addEventListener('click', showWelcomeScreen);
    }
    
    if (adminBackBtn) {
        adminBackBtn.addEventListener('click', showWelcomeScreen);
    }
    
    // Add event listeners - Admin Tabs
    if (singleQuestionTab) {
        singleQuestionTab.addEventListener('click', () => {
            setActiveTab('single-question-tab');
            showAdminSection('single-question-section');
        });
    }
    
    if (batchQuestionTab) {
        batchQuestionTab.addEventListener('click', () => {
            setActiveTab('batch-question-tab');
            showAdminSection('batch-question-section');
        });
    }
    
    if (questionBankTab) {
        questionBankTab.addEventListener('click', () => {
            setActiveTab('question-bank-tab');
            showAdminSection('question-bank-section');
        });
    }
    
    if (userDataTab) {
        userDataTab.addEventListener('click', () => {
            setActiveTab('user-data-tab');
            showAdminSection('user-data-section');
            loadUserData();
        });
    }
    
    // Add event listeners - Question Management
    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addNewQuestion);
    }
    
    if (loadBatchFormBtn) {
        loadBatchFormBtn.addEventListener('click', () => {
            showBatchQuestionInput();
            if (saveBatchBtn) saveBatchBtn.classList.remove('hidden');
        });
    }
    
    if (saveBatchBtn) {
        saveBatchBtn.addEventListener('click', saveBatchQuestions);
    }
    
    if (loadBankBtn) {
        loadBankBtn.addEventListener('click', loadQuestionBank);
    }
    
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedQuestions);
    }
    
    // Add event listeners - User Data
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUserData);
    }
    
    try {
        // Load questions and users from Firebase
        Promise.all([
            loadQuestionsFromStorage(),
            loadUsersFromStorage()
        ]).then(() => {
            console.log("Data loaded successfully");
            // Show welcome screen by default
            hideAllScreens();
            showScreen(welcomeScreen);
        }).catch(error => {
            console.error("Error initializing app:", error);
            // Still show welcome screen even if there's an error
            hideAllScreens();
            showScreen(welcomeScreen);
        });
    } catch (error) {
        console.error("Error during app initialization:", error);
        // Show welcome screen as fallback
        hideAllScreens();
        showScreen(welcomeScreen);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    debugElements();
    
    try {
        checkFirebaseConnection();
        init();
    } catch (e) {
        console.error("Error during initialization:", e);
    }
});
    allQuestions[level].forEach((question, index) => {
        const tr = document.createElement('tr');
        
        // Checkbox column
        const tdCheck = document.createElement('td');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('question-checkbox');
        checkbox.dataset.index = index;
        tdCheck.appendChild(checkbox);
        
        // Question column
        const tdQuestion = document.createElement('td');
        tdQuestion.textContent = question.question;
        
        // Options column
        const tdOptions = document.createElement('td');
        tdOptions.innerHTML = question.options.map((opt, i) => {
            return `<div>${i + 1}. ${opt}</div>`;
        }).join('');
        
        // Correct answer column
        const tdCorrect = document.createElement('td');
        tdCorrect.textContent = `Option ${question.correctOptionIndex + 1}`;
        
        // Add cells to the row
        tr.appendChild(tdCheck);
        tr.appendChild(tdQuestion);
        tr.appendChild(tdOptions);
        tr.appendChild(tdCorrect);
        
        // Add row to table body
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    questionBankContainer.appendChild(table);
    
    // Add event listener to "select all" checkbox
    const selectAllCheckbox = document.getElementById('select-all-checkbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = document.querySelectorAll('.question-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });
    }

// Load user data in admin panel
function loadUserData() {
    usersContainer.innerHTML = '';
    
    const userIds = Object.keys(users);
    
    if (userIds.length === 0) {
        usersContainer.innerHTML = `
            <div class="no-users-message">
                No user data available
            </div>
        `;
        return;
    }
    
    // Create table for users
    const table = document.createElement('table');
    table.classList.add('users-table');
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>National ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Nickname</th>
            <th>Current Level</th>
            <th>Test History</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                `;
                usersContainer.appendChild(table);
            }