import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true
    },
    messages: [
        {
            role: {
                type: String,
                enum: ['user', 'assistant'],
                required: true
            },
            content: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            },
            relevantChunks: {
                type: [Number], // Array of chunk indices
                default: []
            }
        }
    ]
}, { timestamps: true });

// index for faster retrieval of chat history by userId and documentId
chatHistorySchema.index({ userId: 1, documentId: 1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
