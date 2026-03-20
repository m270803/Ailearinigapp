import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import ChatHistory from '../models/ChatHistory.js';
import * as geminiService from '../utils/geminiService.js';
import { findRelevantChunks } from '../utils/textChunker.js';

// @desc    Generate flashcards for a document
// @route   POST /api/ai/generate-flashcards
// @access  Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId, count = 10 } = req.body;

        if (!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400,
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'processed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found or not processed yet',
                statusCode: 404,
            });
        }

        //genrate flashcards using gemini
        const flashcards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );
        //save flashcards to db
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: flashcards.map((card) => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                reviewCount: 0,
                isStarred: false
            })),
        });
        res.status(200).json({
            success: true,
            message: 'Flashcards generated successfully',
            data: flashcardSet
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Generate quiz for a document
// @route   POST /api/ai/generate-quiz
// @access  Private
export const generateQuiz = async (req, res, next) => {
    try {
        const { documentId, numQuestions = 5, title } = req.body;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required',
                statusCode: 400,
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'processed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found or not processed yet',
                statusCode: 404,
            });
        }
        //genrate quiz using gemini
        const questions = await geminiService.generateQuizQuestions(
            document.extractedText,
            parseInt(numQuestions)
        );
        //save quiz to db
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `Quiz for ${document.title}`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswers: [],
            score: 0,
        });
        res.status(200).json({
            success: true,
            message: 'Quiz generated successfully',
            data: quiz
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Generate summary for a document
// @route   POST /api/ai/generate-summary
// @access  Private
export const generateSummary = async (req, res, next) => {
    try {
        const { documentId } = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Document ID is required',
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'processed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            });
        }
        //generate summary using gemini
        const summary = await geminiService.generateSummary(document.extractedText);
        res.status(200).json({
            success: true,
            message: 'Summary generated successfully',
            data: {
                documentId: document._id,
                title: document.title,
                summary
            }
        });
    }    catch (error) {
        next(error);
    }
};

// @desc    Chat with AI about a document
// @route   POST /api/ai/chat
// @access  Private
export const chat = async (req, res, next) => {
    try {
        const { documentId, question } = req.body;
        if(!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: 'Document ID and question are required',
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }
        if (document.status !== 'processed') {
            return res.status(400).json({
                success: false,
                error: document.status === 'failed' 
                    ? 'Document processing failed. Please try re-uploading the document.' 
                    : 'Document is still being processed. Please wait a moment and try again.',
                statusCode: 400
            });
        }
        //find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, question, 3);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);

        //get previous chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });
        if(!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }
        //generate answer using gemini
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        //save chat to history
        chatHistory.messages.push(
            {
                role: 'user',
                content: question,
                timestamp: new Date(),
                relevantChunks: []
            },
            {
                role: 'assistant',
                content: answer,
                timestamp: new Date(),
                relevantChunks: chunkIndices
            }
        );
        await chatHistory.save();
        res.status(200).json({
            success: true,
            message: 'Answer generated successfully',
            data: {
                answer,
                relevantChunks: chunkIndices
            }
    }) }    catch (error) {
        next(error);
    }
};

// @desc    Explain a concept from a document
// @route   POST /api/ai/explain-concept
// @access  Private
export const explainConcept = async (req, res, next) => {
    try {
        const { documentId, concept } = req.body;
        if(!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: 'Document ID and concept are required',
                statusCode: 400
            });
        }
        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'processed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found or not processed yet',
                statusCode: 404
            });
        }
        //find relevant chunks
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n');

        //generate explanation using gemini
        const explanation = await geminiService.explainConcept(concept, context);
        res.status(200).json({
            success: true,
            message: 'Concept explained successfully',
            data: {
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            }
        });
    }    catch (error) {
        next(error);
    }
};

// @desc    Get chat history for a document
// @route   GET /api/ai/chat/history/:documentId
// @access  Private
export const getChatHistory = async (req, res, next) => {

    try {
        const { documentId } = req.params;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: 'Document ID is required',
                statusCode: 400
            });
        }
        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        });
        if(!chatHistory) {
            return res.status(200).json({
                success: true,
                message: 'No chat history yet',
                data: { messages: [] }
            });
        }
        res.status(200).json({
            success: true,
            message: 'Chat history retrieved successfully',
            data: chatHistory
        });

    }    catch (error) {
        next(error);
    }
};