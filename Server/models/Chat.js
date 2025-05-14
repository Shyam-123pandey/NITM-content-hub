const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'insightful', 'helpful', 'motivating'],
        required: true
    }
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'achievement', 'resource'],
        default: 'text'
    },
    fileUrl: String,
    tags: [String],
    reactions: [reactionSchema],
    isPinned: {
        type: Boolean,
        default: false
    },
    isAnnouncement: {
        type: Boolean,
        default: false
    },
    stats: {
        views: {
            type: Number,
            default: 0
        },
        shares: {
            type: Number,
            default: 0
        },
        saves: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'moderator', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['general', 'academic', 'project', 'achievement', 'resource', 'mentorship'],
        required: true
    },
    category: {
        type: String,
        enum: ['all', 'program', 'branch', 'semester', 'faculty'],
        required: true
    },
    description: String,
    rules: [{
        title: String,
        description: String
    }],
    program: String,
    branch: String,
    semester: String,
    members: [memberSchema],
    messages: [messageSchema],
    pinnedMessages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    stats: {
        totalMessages: {
            type: Number,
            default: 0
        },
        activeMembers: {
            type: Number,
            default: 0
        },
        totalReactions: {
            type: Number,
            default: 0
        },
        totalShares: {
            type: Number,
            default: 0
        }
    }
}, { timestamps: true });

// Indexes for better query performance
chatSchema.index({ type: 1, category: 1 });
chatSchema.index({ program: 1, branch: 1, semester: 1 });
chatSchema.index({ 'members.user': 1 });

// Methods
chatSchema.methods.addMember = async function(userId) {
    if (!this.members.some(m => m.user.toString() === userId)) {
        this.members.push({ user: userId });
        this.stats.activeMembers = this.members.length;
        await this.save();
    }
};

chatSchema.methods.removeMember = async function(userId) {
    this.members = this.members.filter(m => m.user.toString() !== userId);
    this.stats.activeMembers = this.members.length;
    await this.save();
};

chatSchema.methods.pinMessage = async function(messageId) {
    if (!this.pinnedMessages.includes(messageId)) {
        this.pinnedMessages.push(messageId);
        await this.save();
    }
};

chatSchema.methods.unpinMessage = async function(messageId) {
    this.pinnedMessages = this.pinnedMessages.filter(id => id.toString() !== messageId.toString());
    await this.save();
};

// Pre-save middleware
chatSchema.pre('save', function(next) {
    if (this.isModified('messages')) {
        this.stats.totalMessages = this.messages.length;
        this.stats.totalReactions = this.messages.reduce((sum, msg) => sum + msg.reactions.length, 0);
    }
    next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 