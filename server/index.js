import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration - allow Vite frontend (usually port 5173 or others)
app.use(cors({
  origin: '*', // For development simplicity, allow all. In production, restrict to frontend URL.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Initialize Groq API
const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured. Please create a server/.env file with a valid API key.');
  }
  return new Groq({ apiKey });
};

// Robust JSON parser helper
function parseAndCleanJSON(rawText) {
  const trimmed = rawText.trim();
  
  // Try normal parse
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    console.warn("Standard JSON parsing failed. Attempting cleanup...", e);
  }

  // Attempt to extract JSON block using regex (matches { ... } or [ ... ])
  try {
    const jsonMatch = trimmed.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Regex JSON extraction failed.", e);
  }

  throw new Error("Could not parse AI output as JSON.");
}

// Data healing for Flashcards
function repairFlashcards(data, originalPrompt) {
  let cards = [];
  if (Array.isArray(data)) {
    cards = data;
  } else if (data && Array.isArray(data.cards)) {
    cards = data.cards;
  } else if (data && typeof data === 'object') {
    const arrays = Object.values(data).filter(Array.isArray);
    if (arrays.length > 0) {
      cards = arrays[0];
    }
  }

  // Ensure we have cards
  if (cards.length === 0) {
    cards = [{
      front: `Topic: ${originalPrompt || 'Study Guide'}`,
      back: 'No cards generated. Please try refining or changing the topic.',
      hint: 'Try a different input text.'
    }];
  }

  const cleanCards = cards.map((c, i) => {
    const front = String(c.front || c.question || c.term || `Concept ${i + 1}`).trim();
    const back = String(c.back || c.answer || c.definition || 'Details to be added.').trim();
    const hint = c.hint ? String(c.hint).trim() : undefined;
    
    return { front, back, hint };
  }).filter(c => c.front.length > 0);

  return {
    type: 'flashcards',
    title: String(data?.title || `Study Deck: ${originalPrompt ? originalPrompt.substring(0, 30) + '...' : 'Untitled'}`).trim(),
    cards: cleanCards
  };
}

// Data healing for Quiz
function repairQuiz(data, originalPrompt) {
  let questions = [];
  if (Array.isArray(data)) {
    questions = data;
  } else if (data && Array.isArray(data.questions)) {
    questions = data.questions;
  } else if (data && typeof data === 'object') {
    const arrays = Object.values(data).filter(Array.isArray);
    if (arrays.length > 0) {
      questions = arrays[0];
    }
  }

  if (questions.length === 0) {
    questions = [{
      question: `No quiz questions were generated for "${originalPrompt || 'this topic'}". Would you like to retry?`,
      options: ['Yes, let\'s try again', 'No, change topic', 'Try simpler language', 'No preference'],
      correctAnswer: 'Yes, let\'s try again',
      explanation: 'No questions were successfully compiled from the AI response.'
    }];
  }

  const cleanQuestions = questions.map((q, i) => {
    const question = String(q.question || q.prompt || `Question ${i + 1}`).trim();
    
    // Extract options
    let options = [];
    if (Array.isArray(q.options)) {
      options = q.options.map(o => String(o).trim());
    } else if (Array.isArray(q.answers)) {
      options = q.answers.map(o => String(o).trim());
    } else if (q.choices && Array.isArray(q.choices)) {
      options = q.choices.map(o => String(o).trim());
    }

    // Clean options and remove empty strings/duplicates
    options = [...new Set(options)].filter(o => o.length > 0);

    // Fallback options if missing
    if (options.length < 2) {
      options = [...options, 'True', 'False', 'Not enough info', 'None of the above'].slice(0, 4);
    }

    // Ensure we have exactly 4 choices
    while (options.length < 4) {
      options.push(`Option ${String.fromCharCode(65 + options.length)}`);
    }
    if (options.length > 4) {
      options = options.slice(0, 4);
    }

    // Determine correct answer
    let correctAnswer = String(q.correctAnswer || q.answer || q.correct || options[0]).trim();
    if (!options.includes(correctAnswer)) {
      // Check if correct answer is an index or character (0-3 or A-D)
      const index = parseInt(correctAnswer, 10);
      if (!isNaN(index) && index >= 0 && index < options.length) {
        correctAnswer = options[index];
      } else {
        const charMap = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 };
        const charIdx = charMap[correctAnswer.toLowerCase()];
        if (charIdx !== undefined) {
          correctAnswer = options[charIdx];
        } else {
          // If correct answer doesn't match any option, force the first option to be the correct answer
          options[0] = correctAnswer;
        }
      }
    }

    const explanation = q.explanation ? String(q.explanation).trim() : 'Correct!';

    return { question, options, correctAnswer, explanation };
  });

  return {
    type: 'quiz',
    title: String(data?.title || `Quiz: ${originalPrompt ? originalPrompt.substring(0, 30) + '...' : 'Untitled'}`).trim(),
    questions: cleanQuestions
  };
}

// Route to generate flashcards or quiz
app.post('/api/generate', async (req, res) => {
  const { notes, type, count } = req.body;

  if (!notes || !notes.trim()) {
    return res.status(400).json({ error: 'Please provide some notes or a topic to study.' });
  }

  const requestedType = type || 'flashcards'; // 'flashcards' or 'quiz'
  const itemCount = parseInt(count, 10) || 5;

  try {
    const groq = getGroqClient();
    
    let systemPrompt = '';
    let responseSchemaPrompt = '';

    if (requestedType === 'flashcards') {
      systemPrompt = `You are a helpful study assistant. Create a set of exactly ${itemCount} flashcards based on the user's provided notes or topic.
Return your response in structured JSON. Do not include markdown code blocks or comments.`;

      responseSchemaPrompt = `The JSON object must have this exact structure:
{
  "title": "A short, engaging title for the flashcards deck",
  "cards": [
    {
      "front": "A concise question, concept, or term to study",
      "back": "The answer, explanation, or definition",
      "hint": "An optional short hint to help the user recall"
    }
  ]
}`;
    } else {
      systemPrompt = `You are an expert educator. Design a multiple-choice quiz with exactly ${itemCount} questions based on the user's provided notes or topic.
Return your response in structured JSON. Do not include markdown code blocks or comments.`;

      responseSchemaPrompt = `The JSON object must have this exact structure:
{
  "title": "A short, engaging title for the quiz",
  "questions": [
    {
      "question": "The clear multiple-choice question prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Must contain exactly 4 unique options
      "correctAnswer": "Option A", // Must match one of the strings inside options EXACTLY
      "explanation": "A helpful explanation of why this answer is correct"
    }
  ]
}`;
    }

    const prompt = `User notes/topic: "${notes}"

JSON Schema Requirement:
${responseSchemaPrompt}`;

    console.log(`Generating ${itemCount} ${requestedType} via Groq for: "${notes.substring(0, 50)}..."`);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const responseText = completion.choices[0].message.content;
    console.log("Raw Groq JSON response received.");
    
    const parsedData = parseAndCleanJSON(responseText);

    // Validate and heal data
    let finalizedData;
    if (requestedType === 'flashcards') {
      finalizedData = repairFlashcards(parsedData, notes);
    } else {
      finalizedData = repairQuiz(parsedData, notes);
    }

    res.json(finalizedData);

  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ 
      error: error.message || 'An unexpected error occurred while communicating with Groq. Please verify your API key.' 
    });
  }
});

// Route to refine the generated cards/quiz (refinement loop)
app.post('/api/refine', async (req, res) => {
  const { currentData, instruction } = req.body;

  if (!currentData || !instruction || !instruction.trim()) {
    return res.status(400).json({ error: 'Missing current data or refinement instruction.' });
  }

  const type = currentData.type; // 'flashcards' or 'quiz'

  try {
    const groq = getGroqClient();

    let systemPrompt = `You are a study assistant editor. You will receive a JSON structure containing study items (either flashcards or quiz questions) and an instruction from the user on how to edit, modify, extend, or refine it.
Your job is to apply the instruction to the current data and return the FULL updated study deck matching the original JSON schema.
Return ONLY a valid JSON object. Do not include markdown code blocks or comments.`;

    const prompt = `Current Study Data:
${JSON.stringify(currentData, null, 2)}

User Instruction for refinement:
"${instruction}"

Output the updated, complete JSON structure containing the modifications. Make sure it has the same type ('${type}'), title, and items list (either 'cards' or 'questions') conforming to the original schema structure.`;

    console.log(`Refining ${type} via Groq with instruction: "${instruction}"`);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    const responseText = completion.choices[0].message.content;
    const parsedData = parseAndCleanJSON(responseText);

    let finalizedData;
    if (type === 'flashcards') {
      finalizedData = repairFlashcards(parsedData, currentData.title);
    } else {
      finalizedData = repairQuiz(parsedData, currentData.title);
    }

    res.json(finalizedData);

  } catch (error) {
    console.error('Error refining content:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to apply refinement instructions. Please check your API configuration.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
