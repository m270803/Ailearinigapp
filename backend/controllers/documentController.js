import Document  from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';
import { extractTextFromPDF} from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
     if (!req.file) {
        return res.status(400).json({
            success: false,
            error: 'No file uploaded',
            statusCode: 400
        });
     }
     const {title } = req.body;
     if (!title) {
        await fs.unlink(req.file.path);
        return res.status(400).json({
            success: false,
            error: 'Title is required',
            statusCode: 400
        });
     }

     // construct the url for the uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        //create document record in database
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl,
            fileSize: req.file.size,
            status: 'processing'
        });

        // process pdf in background
        processPDF(document._id, req.file.path).catch(err => {
            console.error('Error processing PDF:', err);
        });
        res.status(201).json({
            success: true,
            data: document,
            message: 'Document uploaded successfully and is being processed'
        });
    }
    catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

// helper function to process PDF
const processPDF = async (documentId, filePath) => {
    try {
        const { text } = await extractTextFromPDF(filePath);
        const chunks = chunkText(text, 500, 50);
        //update document with extracted text and status
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: 'processed'
        });
        console.log(`Document ${documentId} processed successfully`);
    }
    catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
        await Document.findByIdAndUpdate(documentId, {
            status: 'error'
        });
    }
};

// @desc    Get all documents for the authenticated user
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
     const documents = await Document.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
        {
            $lookup: {
                from: 'flashcards',
                localField: '_id',
                foreignField: 'documentId',
                as: 'flashcards'
            }
    },
    {
        $lookup: {
            from: 'quizzes',
            localField: '_id',
            foreignField: 'documentId',
            as: 'quizzes'
        }
    },
    {
        $addFields: {
            flashcardCount: { $size: '$flashcards' },
            quizCount: { $size: '$quizzes' }
    }
    },
    {
        $project: {
            extractedText: 0,
            chunks: 0,
            flashcardSets: 0,
            quizzes: 0
        }
    },
    { $sort: { uploadDate: -1 } }
        ]);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    }
    catch (error) {

        next(error);
    }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found',
                statusCode: 404
            });
        }

        // get associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({ documentId: document._id, userId: req.user._id });
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id });

        //updated last accessed
        document.lastAccessed = Date.now();
        await document.save();

        //combine document data with flashcard and quiz counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount;
        documentData.quizCount = quizCount;

        res.status(200).json({
            success: true,
            data: documentData
        });
    }
    catch (error) {
        next(error);
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
     const document = await Document.findOne({ _id: req.params.id, userId: req.user._id });
     if (!document) {
        return res.status(404).json({
            success: false,
            error: 'Document not found',
            statusCode: 404
        });
     }

     // dlete files from filesystem
     await fs.unlink(document.filePath).catch(() => {});

     // delete document record from database
    await Document.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
    });
    }
    catch (error) {

        next(error);
    }
};

// @desc    Update a document
// @route   PUT /api/documents/:id
// @access  Private
// export const updateDocument = async (req, res, next) => {
//     try {
     
//     }
//     catch (error) {

//         next(error);
//     }
// };
