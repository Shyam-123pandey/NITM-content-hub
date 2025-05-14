const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const { auth } = require('../middleware/auth');
const Content = require('../models/Content');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// Get all content
router.get('/', async (req, res) => {
    try {
        console.log('Fetching all content...');
        const content = await Content.find()
            .populate('author', 'name email')
            .sort({ createdAt: -1 });
        
        console.log('Content found:', content);
        res.json(Array.isArray(content) ? content : []);
    } catch (error) {
        console.error('Error in GET /content:', error);
        res.status(500).json([]);
    }
});

// Download content
router.get('/:id/download', async (req, res) => {
    try {
        console.log('Downloading content...');
        console.log('Content ID:', req.params.id);

        const content = await Content.findById(req.params.id);
        
        if (!content) {
            console.log('Content not found');
            return res.status(404).json({ 
                success: false,
                message: 'Content not found' 
            });
        }

        if (!content.fileUrl) {
            console.log('No file associated with content');
            return res.status(404).json({ 
                success: false,
                message: 'No file associated with this content' 
            });
        }

        const filePath = path.join(__dirname, '..', content.fileUrl);
        
        if (!fs.existsSync(filePath)) {
            console.log('File not found on server');
            return res.status(404).json({ 
                success: false,
                message: 'File not found on server' 
            });
        }

        // Increment download count
        content.downloads += 1;
        await content.save();

        // Send file
        res.download(filePath, content.title + path.extname(content.fileUrl));
    } catch (error) {
        console.error('Error downloading content:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error downloading content',
            error: error.message 
        });
    }
});

// Get content by ID
router.get('/:id', async (req, res) => {
    try {
        console.log('=== Fetching Content by ID ===');
        console.log('Content ID:', req.params.id);

        const content = await Content.findById(req.params.id)
            .populate('author', 'name email role');
        
        if (!content) {
            console.log('Content not found');
            return res.status(404).json({ 
                success: false,
                message: 'Content not found' 
            });
        }
        
        console.log('Content found:', content.title);
        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        console.error('Error fetching content by ID:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

// Create content
router.post('/', auth, upload.single('file'), handleUploadError, async (req, res) => {
    try {
        console.log('Creating new content...');
        console.log('Request body:', req.body);
        console.log('File:', req.file);
        console.log('User:', req.user);

        const { title, description, type, category, tags } = req.body;
        let fileUrl = null;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        }

        const content = new Content({
            title,
            description,
            type,
            category,
            tags: tags ? JSON.parse(tags) : [],
            fileUrl,
            author: req.user._id
        });

        await content.save();
        console.log('Content created successfully:', content);
        res.status(201).json(content);
    } catch (error) {
        console.error('Error creating content:', error);
        // If there's a file uploaded but content creation failed, delete the file
        if (req.file) {
            const filePath = path.join(__dirname, '..', req.file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
});

// Update content with file upload
router.put('/:id',
    upload.single('file'),
    async (req, res) => {
        try {
            console.log('=== Updating Content ===');
            console.log('Content ID:', req.params.id);
            console.log('Request body:', req.body);
            console.log('File:', req.file);

            const content = await Content.findById(req.params.id);
            
            if (!content) {
                console.log('Content not found');
                return res.status(404).json({ 
                    success: false,
                    message: 'Content not found' 
                });
            }

            const { title, description, type, program, branch, semester } = req.body;
            const updateData = {};

            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (type) updateData.type = type;
            if (program) updateData.program = program;
            if (branch) updateData.branch = branch;
            if (semester) updateData.semester = semester;

            // Handle file upload
            if (req.file) {
                // Delete old file if exists
                if (content.fileUrl) {
                    const oldFilePath = path.join(__dirname, '..', content.fileUrl);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
                updateData.fileUrl = `/uploads/${req.file.filename}`;
            }

            const updatedContent = await Content.findByIdAndUpdate(
                req.params.id,
                { $set: updateData },
                { new: true, runValidators: true }
            ).populate('author', 'name email role');

            console.log('Content updated successfully');
            res.json({
                success: true,
                data: updatedContent
            });
        } catch (error) {
            console.error('Error updating content:', error);
            res.status(500).json({ 
                success: false,
                message: 'Error updating content',
                error: error.message
            });
        }
    }
);

// Delete content
router.delete('/:id', async (req, res) => {
    try {
        console.log('=== Deleting Content ===');
        console.log('Content ID:', req.params.id);

        const content = await Content.findById(req.params.id);
        
        if (!content) {
            console.log('Content not found');
            return res.status(404).json({ 
                success: false,
                message: 'Content not found' 
            });
        }

        // Delete associated file if exists
        if (content.fileUrl) {
            const filePath = path.join(__dirname, '..', content.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await content.deleteOne();
        console.log('Content deleted successfully');
        
        res.json({ 
            success: true,
            message: 'Content deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error deleting content',
            error: error.message
        });
    }
});

module.exports = router; 