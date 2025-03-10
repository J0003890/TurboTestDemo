// Sample questions for each level
const allQuestions = {
    1: [ // Level 1
        {
            question: "What is 5 + 7?",
            options: ["10", "12", "13", "14"],
            correctOptionIndex: 1 // Index of correct answer (0-based)
        },
        {
            question: "Name the planet closest to the sun.",
            options: ["Venus", "Mercury", "Earth", "Mars"],
            correctOptionIndex: 1
        },
        {
            question: "What is the capital of France?",
            options: ["London", "Paris", "Berlin", "Rome"],
            correctOptionIndex: 1
        }
        // Add more questions for level 1 as needed
    ],
    2: [ // Level 2
        {
            question: "What is the square root of 144?",
            options: ["10", "12", "14", "16"],
            correctOptionIndex: 1
        },
        {
            question: "Name the largest ocean on Earth.",
            options: ["Atlantic", "Pacific", "Indian", "Arctic"],
            correctOptionIndex: 1
        }
        // Add more questions for level 2 as needed
    ],
    // Continue for all 10 levels
};

// Progression rules
const progressionRules = {
    1: { // Level 1
        "0-3": 1,   // Scores 0-3: Stay at Level 1
        "4-6": 2,   // Scores 4-6: Go to Level 2
        "7-8": 3,   // Scores 7-8: Go to Level 3
        "9-10": 4   // Scores 9-10: Go to Level 4
    },
    2: { // Level 2
        "0-3": 1,
        "4-6": 2,
        "7-8": 3,
        "9-10": 4
    },
    3: { // Level 3
        "0-3": 2,
        "4-6": 3,
        "7-8": 4,
        "9-10": 5
    },
    4: { // Level 4
        "0-3": 3,
        "4-6": 4,
        "7-8": 5,
        "9-10": 6
    },
    5: { // Level 5
        "0-3": 4,
        "4-6": 5,
        "7-8": 6,
        "9-10": 7
    },
    6: { // Level 6
        "0-3": 5,
        "4-6": 6,
        "7-8": 7,
        "9-10": 8
    },
    7: { // Level 7
        "0-3": 6,
        "4-6": 7,
        "7-8": 8,
        "9-10": 9
    },
    8: { // Level 8
        "0-3": 7,
        "4-6": 8,
        "7-8": 9,
        "9-10": 10
    },
    9: { // Level 9
        "0-3": 8,
        "4-7": 9,
        "8-10": 10,

    },
    10: { // Level 10
        "0-5": 9,
        "6-7": "ไม่เลว ไม่เลวเลยจริง ๆ",
        "8-9": "ผู้ใกล้รู้ ใกล้ตื่น ใกล้เบิกบาน",
        "10": "หนึ่งในใต้หล้า ท้องฟ้าสีชมพูวว"
    }
};