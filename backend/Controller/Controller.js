const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const User = require('../models/Schema');
const Video = require('../models/Schema').Video;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');


const createUser = async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available. Please check MongoDB Atlas IP whitelist settings.',
                error: 'MongoDB not connected'
            });
        }

        const { name, email, password, height, weight, age, gender, activityLevel, goal, healthConditions, medications, allergies, birthDate, bioData, location, id } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Normalize email (trim and lowercase)
        const normalizedEmail = email.trim().toLowerCase();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user already exists (case-insensitive)
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user with hashed password
        console.log('Creating user with email:', normalizedEmail);
        const user = await User.create({ 
            name, 
            email: normalizedEmail, 
            password: hashedPassword, 
            height, 
            weight, 
            age, 
            gender, 
            activityLevel, 
            goal, 
            healthConditions, 
            medications, 
            allergies, 
            birthDate, 
            bioData, 
            location, 
            id 
        });
        
        console.log('User created successfully:', {
            id: user._id,
            email: user.email,
            name: user.name
        });
        
        res.status(201).json({ 
            message: 'User created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
}
const loginUser = async (req, res) => {
    try {
        console.log('\n=== LOGIN REQUEST RECEIVED ===');
        console.log('Raw request body:', JSON.stringify(req.body));
        console.log('Request headers:', JSON.stringify(req.headers));
        console.log('MongoDB connection state:', mongoose.connection.readyState);
        
        const { email, password } = req.body;
        
        console.log('Extracted email (raw):', `"${email}"`);
        console.log('Extracted password (raw):', password ? `"${password.substring(0, 2)}***"` : 'null');
        console.log('Email type:', typeof email);
        console.log('Password type:', typeof password);
        console.log('Email length:', email?.length);
        console.log('Password length:', password?.length);
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            console.log('Email exists:', !!email);
            console.log('Password exists:', !!password);
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Normalize email (trim and lowercase) for consistent lookup
        const normalizedEmail = email.trim().toLowerCase();
        
        console.log('Email after trim:', `"${email.trim()}"`);
        console.log('Normalized email:', `"${normalizedEmail}"`);
        console.log('Password provided (length):', password ? password.length : 0);
        console.log('Password first 2 chars:', password ? password.substring(0, 2) : 'N/A');

        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            console.error('MongoDB not connected! Connection state:', mongoose.connection.readyState);
            return res.status(503).json({ 
                message: 'Database connection not available. Please check MongoDB Atlas IP whitelist settings.',
                error: 'MongoDB not connected'
            });
        }

        console.log('Searching for user with email:', `"${normalizedEmail}"`);
        const user = await User.findOne({ email: normalizedEmail });
        
        if (user) {
            console.log('✅ User found in database');
            console.log('User email in DB:', `"${user.email}"`);
            console.log('User name:', user.name);
            console.log('Stored password hash exists:', !!user.password);
            console.log('Stored password hash length:', user.password?.length || 0);
        } else {
            console.log('❌ User not found for email:', `"${normalizedEmail}"`);
            // Also check if any users exist in database
            const userCount = await User.countDocuments();
            console.log('Total users in database:', userCount);
            
            // Try to find user with different case
            const allUsers = await User.find({}, 'email').limit(5);
            console.log('Sample emails in database:', allUsers.map(u => u.email));
            
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        console.log('Comparing password...');
        console.log('Input password:', password ? `"${password.substring(0, 2)}***"` : 'null');
        console.log('Stored hash:', user.password ? `"${user.password.substring(0, 20)}..."` : 'null');
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isPasswordCorrect);
        
        if (!isPasswordCorrect) {
            console.log('❌ Password incorrect');
            console.log('Input password length:', password?.length);
            console.log('Stored hash length:', user.password?.length);
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        console.log('✅✅✅ Login successful for email:', normalizedEmail);
        
        // Update login streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streakCount = user.streakCount || 0;
        const lastLoginDate = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
        
        if (lastLoginDate) {
            lastLoginDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today - lastLoginDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0) {
                // Same day login, no change
            } else if (daysDiff === 1) {
                // Consecutive day, increment streak
                streakCount += 1;
            } else {
                // Streak broken, reset to 1
                streakCount = 1;
            }
        } else {
            // First login
            streakCount = 1;
        }
        
        // Add today's date to loginDates if not already present
        const todayStr = today.toISOString().split('T')[0];
        const loginDates = user.loginDates || [];
        const todayExists = loginDates.some(date => {
            const dateStr = new Date(date).toISOString().split('T')[0];
            return dateStr === todayStr;
        });
        
        if (!todayExists) {
            loginDates.push(today);
        }
        
        // Update user with new streak and login date
        user.streakCount = streakCount;
        user.lastLoginDate = today;
        user.loginDates = loginDates;
        await user.save();
        
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.status(200).json({ 
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                firstName: user.firstName,
                streakCount: user.streakCount
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
}

// Update user profile
const updateProfile = async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available. Please check MongoDB Atlas IP whitelist settings.',
                error: 'MongoDB not connected'
            });
        }

        const { email, firstName, surname, sex, birthDate, height, weight, 
                heartSurgery, withinSixMonths, heartSurgeryComment, 
                fractures, withinSixMonthsFracture, fracturesComment } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Normalize email (trim and lowercase) for consistent lookup
        const normalizedEmail = email.trim().toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // If user doesn't exist, create a new user with minimal data
            // This handles the case where user logs in but hasn't registered yet
            const saltRounds = 10;
            const tempPassword = 'temp_password_' + Date.now();
            const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
            
            user = await User.create({
                email: normalizedEmail,
                name: firstName || 'User',
                password: hashedPassword, // Hashed temporary password
                firstName: firstName,
                surname: surname,
            });
            console.log('Created new user for profile setup:', normalizedEmail);
        }

        // Update profile fields
        if (firstName !== undefined) user.firstName = firstName;
        if (surname !== undefined) user.surname = surname;
        if (sex !== undefined) user.gender = sex;
        if (birthDate !== undefined) user.birthDate = new Date(birthDate);
        if (height !== undefined) user.height = height;
        if (weight !== undefined) user.weight = weight;
        if (heartSurgery !== undefined) user.heartSurgery = heartSurgery;
        if (withinSixMonths !== undefined) user.withinSixMonths = withinSixMonths;
        if (heartSurgeryComment !== undefined) user.heartSurgeryComment = heartSurgeryComment;
        if (fractures !== undefined) user.fractures = fractures;
        if (withinSixMonthsFracture !== undefined) user.withinSixMonthsFracture = withinSixMonthsFracture;
        if (fracturesComment !== undefined) user.fracturesComment = fracturesComment;
        
        // Update name if firstName is provided
        if (firstName) {
            user.name = firstName;
        }

        await user.save();
        
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                firstName: user.firstName,
                surname: user.surname,
                name: user.name,
                email: user.email,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                birthDate: user.birthDate
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available. Please check MongoDB Atlas IP whitelist settings.',
                error: 'MongoDB not connected'
            });
        }

        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Normalize email (trim and lowercase) for consistent lookup
        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            user: {
                id: user._id,
                firstName: user.firstName,
                surname: user.surname,
                name: user.name,
                email: user.email,
                height: user.height,
                weight: user.weight,
                gender: user.gender,
                birthDate: user.birthDate,
                streakCount: user.streakCount || 0,
                lastLoginDate: user.lastLoginDate,
                loginDates: user.loginDates || [],
                heartSurgery: user.heartSurgery,
                withinSixMonths: user.withinSixMonths,
                heartSurgeryComment: user.heartSurgeryComment,
                fractures: user.fractures,
                withinSixMonthsFracture: user.withinSixMonthsFracture,
                fracturesComment: user.fracturesComment,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: 'Error getting user profile', error: error.message });
    }
}

// ==================== VIDEO CONTROLLERS ====================

// Configure multer for file uploads (memory storage for GridFS)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('Multer fileFilter called:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype
        });
        
        // Accept video files for 'video' field
        if (file.fieldname === 'video') {
            // Be more lenient with mimetype - React Native might not send it correctly
            if (file.mimetype && file.mimetype.startsWith('video/')) {
                console.log('✅ Video file accepted by fileFilter');
                cb(null, true);
            } else if (!file.mimetype || file.mimetype === 'application/octet-stream') {
                // Accept if no mimetype or generic type (React Native sometimes sends this)
                console.log('✅ File accepted (no/unknown mimetype, assuming video)');
                cb(null, true);
            } else {
                console.log('❌ File rejected - not a video mimetype:', file.mimetype);
                cb(new Error('Only video files are allowed for video field'), false);
            }
        } 
        // Accept image files for 'thumbnail' field
        else if (file.fieldname === 'thumbnail') {
            if (file.mimetype && file.mimetype.startsWith('image/')) {
                cb(null, true);
            } else {
                cb(new Error('Only image files are allowed for thumbnail field'), false);
            }
        } else {
            cb(null, true);
        }
    }
});

// Upload video using multipart/form-data (for Postman file uploads)
const uploadVideoFile = async (req, res) => {
    try {
        // Debug logging
        console.log('\n=== VIDEO UPLOAD REQUEST ===');
        console.log('Method:', req.method);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('Is multipart/form-data?', req.headers['content-type']?.includes('multipart/form-data'));
        console.log('req.file:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : null);
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        console.log('Request keys:', {
            file: !!req.file,
            files: !!req.files,
            bodyKeys: Object.keys(req.body || {})
        });
        
        // Check if Content-Type is correct
        if (!req.headers['content-type'] || !req.headers['content-type'].includes('multipart/form-data')) {
            console.error('❌ ERROR: Request is NOT multipart/form-data!');
            console.error('Content-Type received:', req.headers['content-type']);
            return res.status(400).json({ 
                message: 'Request must be multipart/form-data. Content-Type: ' + (req.headers['content-type'] || 'missing')
            });
        }
        
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        // Check if file was uploaded
        // Using upload.single() so file is in req.file
        if (!req.file) {
            console.log('❌ No file received!');
            console.log('req.file:', req.file);
            console.log('req.files:', req.files);
            console.log('Request headers:', JSON.stringify(req.headers, null, 2));
            console.log('Request body:', JSON.stringify(req.body, null, 2));
            return res.status(400).json({ 
                message: 'Video file is required. Please upload a video file using multipart/form-data.' 
            });
        }
        
        console.log('✅ File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        
        const videoFile = req.file;

        const { 
            title, 
            description, 
            userEmail, 
            category, 
            tags, 
            isPublic,
            duration
        } = req.body;

        // Validate required fields
        if (!title || !userEmail) {
            return res.status(400).json({ 
                message: 'Title and userEmail are required' 
            });
        }

        // Normalize email
        const normalizedEmail = userEmail.trim().toLowerCase();

        // Find user to get user ID
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const videoBuffer = videoFile.buffer;
        const fileName = videoFile.originalname || `video_${Date.now()}.mp4`;
        const contentType = videoFile.mimetype || 'video/mp4';
        const fileSize = videoFile.size;

        // Initialize GridFS bucket
        const db = mongoose.connection.db;
        const videoBucket = new GridFSBucket(db, { bucketName: 'videos' });

        // Upload video to GridFS
        const videoUploadStream = videoBucket.openUploadStream(fileName, {
            contentType: contentType,
            metadata: {
                title: title.trim(),
                userEmail: normalizedEmail,
                userId: user._id.toString()
            }
        });

        let gridFSVideoId = null;

        // Write buffer to GridFS stream
        await new Promise((resolve, reject) => {
            videoUploadStream.on('finish', () => {
                gridFSVideoId = videoUploadStream.id;
                resolve();
            });
            videoUploadStream.on('error', reject);
            videoUploadStream.write(videoBuffer);
            videoUploadStream.end();
        });

        // Handle thumbnail if provided (would need to be sent as base64 in body or separate request)
        let gridFSThumbnailId = null;
        let thumbnailContentType = 'image/jpeg';
        
        // Note: Thumbnail handling removed for now since we're using upload.single()
        // Can be added later if needed via base64 in request body

        // Parse tags if provided as string
        let parsedTags = [];
        if (tags) {
            if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
            } else if (Array.isArray(tags)) {
                parsedTags = tags;
            }
        }

        // Create video document with GridFS IDs
        const video = new Video({
            title: title.trim(),
            description: description ? description.trim() : '',
            fileName,
            gridFSVideoId,
            contentType: contentType,
            fileSize: fileSize,
            duration: duration ? parseFloat(duration) : 0,
            gridFSThumbnailId,
            thumbnailContentType: thumbnailContentType,
            user: user._id,
            userEmail: normalizedEmail,
            category: category || 'other',
            tags: parsedTags,
            isPublic: true, // Always make videos public so all users can see them
            status: 'ready'
        });

        await video.save();

        res.status(201).json({
            message: 'Video uploaded successfully',
            video: {
                id: video._id,
                title: video.title,
                fileName: video.fileName,
                contentType: video.contentType,
                fileSize: video.fileSize,
                duration: video.duration,
                category: video.category,
                tags: video.tags,
                uploadedAt: video.uploadedAt
            }
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ 
            message: 'Error uploading video', 
            error: error.message 
        });
    }
};

// Upload video and store in MongoDB using GridFS (original - accepts base64)
const uploadVideo = async (req, res) => {
    try {
        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { 
            title, 
            description, 
            fileName, 
            videoData, // Base64 encoded video or Buffer
            contentType,
            fileSize, 
            duration, 
            userEmail, 
            category, 
            tags, 
            isPublic,
            thumbnailData, // Base64 encoded thumbnail or Buffer
            thumbnailContentType
        } = req.body;

        // Validate required fields
        if (!title || !fileName || !videoData || !userEmail) {
            return res.status(400).json({ 
                message: 'Title, fileName, videoData (base64 or buffer), and userEmail are required' 
            });
        }

        // Normalize email
        const normalizedEmail = userEmail.trim().toLowerCase();

        // Find user to get user ID
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert base64 to Buffer if needed
        let videoBuffer;
        if (Buffer.isBuffer(videoData)) {
            videoBuffer = videoData;
        } else if (typeof videoData === 'string') {
            // Assume base64 encoded string
            videoBuffer = Buffer.from(videoData, 'base64');
        } else {
            return res.status(400).json({ 
                message: 'videoData must be a Buffer or base64 encoded string' 
            });
        }

        // Calculate file size if not provided
        const calculatedFileSize = fileSize || videoBuffer.length;

        // Initialize GridFS bucket
        const db = mongoose.connection.db;
        const videoBucket = new GridFSBucket(db, { bucketName: 'videos' });

        // Upload video to GridFS
        const videoUploadStream = videoBucket.openUploadStream(fileName, {
            contentType: contentType || 'video/mp4',
            metadata: {
                title: title.trim(),
                userEmail: normalizedEmail,
                userId: user._id.toString()
            }
        });

        let gridFSVideoId = null;
        let gridFSThumbnailId = null;

        // Write buffer to GridFS stream
        await new Promise((resolve, reject) => {
            videoUploadStream.on('finish', () => {
                gridFSVideoId = videoUploadStream.id;
                resolve();
            });
            videoUploadStream.on('error', reject);
            // Write buffer and end stream
            videoUploadStream.write(videoBuffer);
            videoUploadStream.end();
        });

        // Upload thumbnail to GridFS if provided
        if (thumbnailData) {
            let thumbnailBuffer;
            if (Buffer.isBuffer(thumbnailData)) {
                thumbnailBuffer = thumbnailData;
            } else if (typeof thumbnailData === 'string') {
                thumbnailBuffer = Buffer.from(thumbnailData, 'base64');
            }

            if (thumbnailBuffer) {
                const thumbnailBucket = new GridFSBucket(db, { bucketName: 'thumbnails' });
                const thumbnailUploadStream = thumbnailBucket.openUploadStream(`${fileName}_thumb`, {
                    contentType: thumbnailContentType || 'image/jpeg',
                    metadata: {
                        videoId: gridFSVideoId.toString(),
                        userEmail: normalizedEmail
                    }
                });

                await new Promise((resolve, reject) => {
                    thumbnailUploadStream.on('finish', () => {
                        gridFSThumbnailId = thumbnailUploadStream.id;
                        resolve();
                    });
                    thumbnailUploadStream.on('error', reject);
                    // Write buffer and end stream
                    thumbnailUploadStream.write(thumbnailBuffer);
                    thumbnailUploadStream.end();
                });
            }
        }

        // Create video document with GridFS IDs
        const video = new Video({
            title: title.trim(),
            description: description ? description.trim() : '',
            fileName,
            gridFSVideoId,
            contentType: contentType || 'video/mp4',
            fileSize: calculatedFileSize,
            duration: duration || 0,
            gridFSThumbnailId,
            thumbnailContentType: thumbnailContentType || 'image/jpeg',
            user: user._id,
            userEmail: normalizedEmail,
            category: category || 'other',
            tags: tags || [],
            isPublic: true, // Always make videos public so all users can see them
            status: 'ready'
        });

        await video.save();

        res.status(201).json({
            message: 'Video uploaded successfully to GridFS',
            video: {
                id: video._id,
                title: video.title,
                fileName: video.fileName,
                contentType: video.contentType,
                fileSize: video.fileSize,
                duration: video.duration,
                category: video.category,
                uploadedAt: video.uploadedAt
            }
        });
    } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ 
            message: 'Error uploading video', 
            error: error.message 
        });
    }
};

// Get all public videos (shared across all users)
const getAllVideos = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        // Get all public videos, sorted by upload date
        const videos = await Video.find({ isPublic: true, status: 'ready' })
            .sort({ uploadedAt: -1 })
            .select('-__v')
            .lean();

        res.status(200).json({
            message: 'Videos retrieved successfully',
            count: videos.length,
            videos: videos
        });
    } catch (error) {
        console.error('Error getting all videos:', error);
        res.status(500).json({ 
            message: 'Error getting videos', 
            error: error.message 
        });
    }
};

// Get videos by routine name (for Quick Relief routines)
const getVideosByRoutine = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { routineName } = req.params;
        
        if (!routineName) {
            return res.status(400).json({ message: 'Routine name is required' });
        }

        // Search for videos by routine name in title or tags
        // Convert routine name to searchable format (e.g., "Cat Cow" -> "cat-cow" or "cat cow")
        const searchPattern = routineName.toLowerCase().replace(/\s+/g, '-');
        const searchPattern2 = routineName.toLowerCase();

        // Find videos where:
        // 1. Title contains the routine name
        // 2. Tags contain the routine name (in various formats)
        // 3. Is public and ready
        const videos = await Video.find({
            isPublic: true,
            status: 'ready',
            $or: [
                { title: { $regex: routineName, $options: 'i' } },
                { tags: { $in: [searchPattern, searchPattern2, routineName] } },
                { tags: { $regex: routineName, $options: 'i' } }
            ]
        })
            .sort({ uploadedAt: -1 })
            .select('-__v')
            .lean();

        res.status(200).json({
            message: 'Videos retrieved successfully',
            routineName: routineName,
            count: videos.length,
            videos: videos
        });
    } catch (error) {
        console.error('Error getting videos by routine:', error);
        res.status(500).json({ 
            message: 'Error getting videos', 
            error: error.message 
        });
    }
};

// Get all videos for a user (metadata only, no GridFS data)
const getUserVideos = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Get video metadata (GridFS IDs are included but not the actual files)
        const videos = await Video.find({ userEmail: normalizedEmail })
            .sort({ uploadedAt: -1 })
            .select('-__v')
            .lean();

        res.status(200).json({
            message: 'Videos retrieved successfully',
            count: videos.length,
            videos: videos
        });
    } catch (error) {
        console.error('Error getting user videos:', error);
        res.status(500).json({ 
            message: 'Error getting videos', 
            error: error.message 
        });
    }
};

// Get single video by ID (metadata only)
const getVideoById = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { videoId } = req.params;
        
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'Valid video ID is required' });
        }

        const video = await Video.findById(videoId).select('-__v').lean();

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Increment views
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

        res.status(200).json({
            message: 'Video retrieved successfully',
            video: video
        });
    } catch (error) {
        console.error('Error getting video:', error);
        res.status(500).json({ 
            message: 'Error getting video', 
            error: error.message 
        });
    }
};

// Stream video file directly from GridFS (for video playback)
const streamVideo = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { videoId } = req.params;
        
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'Valid video ID is required' });
        }

        const video = await Video.findById(videoId).select('gridFSVideoId contentType fileName');

        if (!video || !video.gridFSVideoId) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Initialize GridFS bucket
        const db = mongoose.connection.db;
        const videoBucket = new GridFSBucket(db, { bucketName: 'videos' });

        // Check if file exists in GridFS
        const files = await videoBucket.find({ _id: video.gridFSVideoId }).toArray();
        if (files.length === 0) {
            return res.status(404).json({ message: 'Video file not found in GridFS' });
        }

        const file = files[0];

        // Set headers for video streaming
        res.setHeader('Content-Type', video.contentType || file.contentType || 'video/mp4');
        res.setHeader('Content-Length', file.length);
        res.setHeader('Content-Disposition', `inline; filename="${video.fileName}"`);
        res.setHeader('Accept-Ranges', 'bytes');

        // Handle range requests for video seeking
        const range = req.headers.range;
        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : file.length - 1;
            const chunksize = (end - start) + 1;

            res.status(206);
            res.setHeader('Content-Range', `bytes ${start}-${end}/${file.length}`);
            res.setHeader('Content-Length', chunksize);

            const downloadStream = videoBucket.openDownloadStream(video.gridFSVideoId, { start, end });
            downloadStream.pipe(res);
        } else {
            // Stream entire file
            const downloadStream = videoBucket.openDownloadStream(video.gridFSVideoId);
            downloadStream.pipe(res);
        }

        // Increment views
        await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
    } catch (error) {
        console.error('Error streaming video:', error);
        res.status(500).json({ 
            message: 'Error streaming video', 
            error: error.message 
        });
    }
};

// Get video thumbnail from GridFS
const getVideoThumbnail = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { videoId } = req.params;
        
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'Valid video ID is required' });
        }

        const video = await Video.findById(videoId).select('gridFSThumbnailId thumbnailContentType');

        if (!video || !video.gridFSThumbnailId) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }

        // Initialize GridFS bucket for thumbnails
        const db = mongoose.connection.db;
        const thumbnailBucket = new GridFSBucket(db, { bucketName: 'thumbnails' });

        // Check if thumbnail exists in GridFS
        const files = await thumbnailBucket.find({ _id: video.gridFSThumbnailId }).toArray();
        if (files.length === 0) {
            return res.status(404).json({ message: 'Thumbnail file not found in GridFS' });
        }

        const file = files[0];

        // Set headers for image
        res.setHeader('Content-Type', video.thumbnailContentType || file.contentType || 'image/jpeg');
        res.setHeader('Content-Length', file.length);

        // Stream thumbnail from GridFS
        const downloadStream = thumbnailBucket.openDownloadStream(video.gridFSThumbnailId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error getting thumbnail:', error);
        res.status(500).json({ 
            message: 'Error getting thumbnail', 
            error: error.message 
        });
    }
};

// Update video metadata
const updateVideo = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { videoId } = req.params;
        const { 
            title, 
            description, 
            category, 
            tags, 
            isPublic,
            thumbnailData,
            thumbnailContentType
        } = req.body;

        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'Valid video ID is required' });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Update fields if provided
        if (title !== undefined) video.title = title.trim();
        if (description !== undefined) video.description = description.trim();
        if (category !== undefined) video.category = category;
        if (tags !== undefined) video.tags = tags;
        if (isPublic !== undefined) video.isPublic = isPublic;
        
        // Update thumbnail in GridFS if provided
        if (thumbnailData !== undefined) {
            const db = mongoose.connection.db;
            const thumbnailBucket = new GridFSBucket(db, { bucketName: 'thumbnails' });

            // Delete old thumbnail if exists
            if (video.gridFSThumbnailId) {
                try {
                    await thumbnailBucket.delete(video.gridFSThumbnailId);
                } catch (error) {
                    console.warn('Error deleting old thumbnail:', error);
                }
            }

            // Upload new thumbnail
            let thumbnailBuffer;
            if (Buffer.isBuffer(thumbnailData)) {
                thumbnailBuffer = thumbnailData;
            } else if (typeof thumbnailData === 'string') {
                thumbnailBuffer = Buffer.from(thumbnailData, 'base64');
            }

            if (thumbnailBuffer) {
                const thumbnailUploadStream = thumbnailBucket.openUploadStream(`${video.fileName}_thumb`, {
                    contentType: thumbnailContentType || 'image/jpeg',
                    metadata: {
                        videoId: video._id.toString(),
                        userEmail: video.userEmail
                    }
                });

                thumbnailBuffer.pipe(thumbnailUploadStream);

                await new Promise((resolve, reject) => {
                    thumbnailUploadStream.on('finish', () => {
                        video.gridFSThumbnailId = thumbnailUploadStream.id;
                        resolve();
                    });
                    thumbnailUploadStream.on('error', reject);
                });
            }
        }
        if (thumbnailContentType !== undefined) {
            video.thumbnailContentType = thumbnailContentType;
        }
        
        video.updatedAt = new Date();

        await video.save();

        res.status(200).json({
            message: 'Video updated successfully',
            video: {
                id: video._id,
                title: video.title,
                description: video.description,
                category: video.category,
                tags: video.tags,
                isPublic: video.isPublic,
                updatedAt: video.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating video:', error);
        res.status(500).json({ 
            message: 'Error updating video', 
            error: error.message 
        });
    }
};

// Delete video (removes from MongoDB and GridFS)
const deleteVideo = async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ 
                message: 'Database connection not available.',
                error: 'MongoDB not connected'
            });
        }

        const { videoId } = req.params;
        
        if (!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(400).json({ message: 'Valid video ID is required' });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const db = mongoose.connection.db;
        
        // Delete video from GridFS
        if (video.gridFSVideoId) {
            const videoBucket = new GridFSBucket(db, { bucketName: 'videos' });
            try {
                await videoBucket.delete(video.gridFSVideoId);
                console.log('Deleted video from GridFS:', video.gridFSVideoId);
            } catch (error) {
                console.error('Error deleting video from GridFS:', error);
            }
        }

        // Delete thumbnail from GridFS
        if (video.gridFSThumbnailId) {
            const thumbnailBucket = new GridFSBucket(db, { bucketName: 'thumbnails' });
            try {
                await thumbnailBucket.delete(video.gridFSThumbnailId);
                console.log('Deleted thumbnail from GridFS:', video.gridFSThumbnailId);
            } catch (error) {
                console.error('Error deleting thumbnail from GridFS:', error);
            }
        }

        // Delete video document from database
        await Video.findByIdAndDelete(videoId);

        res.status(200).json({
            message: 'Video deleted successfully from MongoDB and GridFS'
        });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ 
            message: 'Error deleting video', 
            error: error.message 
        });
    }
};

module.exports = { 
    createUser, 
    loginUser, 
    updateProfile, 
    getUserProfile,
    uploadVideo,
    uploadVideoFile,
    upload, // Export multer middleware
    getAllVideos,
    getVideosByRoutine,
    getUserVideos,
    getVideoById,
    streamVideo,
    getVideoThumbnail,
    updateVideo,
    deleteVideo
};