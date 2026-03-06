import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
        required: true,
    },
    extractedText: {
        type: String,
        default: '',
    },
    chunks: [
        {
            content: {
                type: String,
                required: true,
            },
            pageNumber: {
                type: Number,
                default: 0
            },
            chunkIndex: {
                type: Number,
                required: true
            }
        }
    ],
    lastAccessed: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: [ 'processing', 'processed', 'failed' ],
        default: 'processing'
    },
}, { timestamps: true });

// index for faster retrieval of documents by userId
DocumentSchema.index({ userId: 1, uploadDate: -1 });

export default mongoose.model('Document', DocumentSchema);


