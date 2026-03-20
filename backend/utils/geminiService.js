import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });

if (!process.env.GOOGLE_GENAI_API_KEY) {
    console.warn('Warning: GOOGLE_GENAI_API_KEY is not set. GeminiService will not work without it.');
    // In some environments, we might not want to exit 1 immediately, 
    // but for this app it's a hard dependency.
}

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

/**
 * generate flashcards from text using Gemini API
 * @param {string} text - the input text to generate flashcards from
 * @param {number} count - the number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string,difficulty: string}>} - an array of generated flashcards
 */
export const generateFlashcards = async (text, count = 10) => {
    const prompt = `Generate ${count} flashcards from the following text. 
    format each flashcard as :
    Q: [clear, specific question]
    A: [concise , accurate answer]
    D: [difficulty level: easy, medium, hard]

    seprate each flashcard with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const generatedText = response.text;

        // Parse the response
        const flashcards = [];
        const cards = generatedText.split('---').filter(c => c.trim());

        for (const card of cards) {
            const lines = card.trim().split('\n');
            let question = '', answer = '', difficulty = 'medium';

            for (const line of lines) {
                if (line.startsWith('Q:')) {
                    question = line.substring(2).trim();
                } else if (line.startsWith('A:')) {
                    answer = line.substring(2).trim();
                } else if (line.startsWith('D:')) {
                    const diff = line.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }

            if (question && answer) {
                flashcards.push({ question, answer, difficulty });
            }
        }

        return flashcards;
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw error;
    }
};

/**
 * generate quiz questions from text using Gemini API
 * @param {string} text - the input text to generate quiz questions from
 * @param {number} numQuestions - the number of quiz questions to generate
 * @return {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string,difficulty: string}>>} - an array of generated quiz questions
 */
export const generateQuizQuestions = async (text, numQuestions = 5) => {
    const prompt = `Generate ${numQuestions} multiple-choice quiz questions from the following text. 
    format each question as :
    Q: [Question]
    01: [Option 1]
    02: [Option 2]
    03: [Option 3]
    04: [Option 4]
    C: [Correct Answer]
    E: [Explanation]
    D: [Difficulty Level: easy, medium, hard]

    seprate each question with "---"

    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const generatedText = response.text;

        const questions = [];
        const questionBlocks = generatedText.split('---').filter(q => q.trim());

        for (const block of questionBlocks) {
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('Q:')) {
                    question = trimmedLine.substring(2).trim();
                } else if (trimmedLine.match(/^0[1-4]:/)) {
                    options.push(trimmedLine.substring(3).trim());
                } else if (trimmedLine.startsWith('C:')) {
                    correctAnswer = trimmedLine.substring(2).trim();
                } else if (trimmedLine.startsWith('E:')) {
                    explanation = trimmedLine.substring(2).trim();
                } else if (trimmedLine.startsWith('D:')) {
                    const diff = trimmedLine.substring(2).trim().toLowerCase();
                    if (['easy', 'medium', 'hard'].includes(diff)) {
                        difficulty = diff;
                    }
                }
            }
            if (question && options.length === 4 && correctAnswer) {
                questions.push({ question, options, correctAnswer, explanation, difficulty });
            }
        }

        return questions.slice(0, numQuestions);
    } catch (error) {
        console.error('Error generating quiz questions:', error);
        throw error;
    }
};

/**
 * generate summary from text using Gemini API
 * @param {string} text - the input text to generate summary from
 * @returns {Promise<string>} - the generated summary
 */
export const generateSummary = async (text) => {
    const prompt = `Summarize the following text in a concise and clear manner. 
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });
        const genratedText = response.text;
        return genratedText.trim();
    } catch (error) {
        console.error('Error generating summary:', error);
        throw error;
    }
};

/**
 * chat with document using Gemini API
 * @param {string} question - the text of the document to chat about
 * @param {Array<Object>} chunks - the chunks of the document to use as context for the chat
 * @returns {Promise<string>} - the generated response from the AI
 */
export const chatWithContext = async (question, chunks) => {
    const context = chunks.map((chunk, index) => `Chunk ${index + 1}:\n${chunk.content}`).join('\n\n');
    const prompt = `You are an AI assistant that helps users understand a document. 
    Use the following chunks of the document as context to answer the user's question. 
    If the answer is not in the provided chunks, say you don't know.

    Context:
    ${context}

    Question: ${question}

    Answer:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const generatedText = response.text;
        return generatedText.trim();
    } catch (error) {
        console.error('Error in chatWithContext:', error);
        throw error;
    }
};

/**\
 * explain a concept from the document using Gemini API
 * @param {string} concept - the concept to explain
 * @param {string} context - the context to use for explaining the concept
 * @return {Promise<string>} - the generated explanation from the AI
 */
export const explainConcept = async (concept, context) => {
    const prompt = `You are an AI assistant that explains concepts from a document. 
    Use the following context to explain the concept in a clear and concise manner. 
    If the concept is not in the provided context, say you don't know.  

    Context:
    ${context.substring(0, 10000)}`;

    try {  
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const generatedText = response.text;
        return generatedText.trim();
    } catch (error) {
        console.error('Error in explainConcept:', error);
        throw error;
    }
};
