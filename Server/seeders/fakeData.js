const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Content = require('../models/Content');
const Discussion = require('../models/Discussion');
const Opportunity = require('../models/Opportunity');
const Calendar = require('../models/Calendar');
require('dotenv').config();

// Fake data arrays
const programs = ['B.Tech', 'M.Tech', 'PhD'];
const branches = ['CSE', 'ECE', 'EE', 'ME', 'CE'];
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const contentTypes = ['lecture', 'assignment', 'resource', 'announcement'];
const opportunityTypes = ['internship', 'job', 'research', 'workshop'];
const discussionCategories = ['academic', 'technical', 'general', 'events'];

// Generate random date within last year
const getRandomDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 365));
    return date;
};

// Generate fake users (students)
const generateFakeStudents = async () => {
    const students = [];
    for (let i = 1; i <= 50; i++) {
        const student = {
            name: `Student ${i}`,
            email: `student${i}@nitm.ac.in`,
            password: await bcrypt.hash('password123', 10),
            role: 'student',
            program: programs[Math.floor(Math.random() * programs.length)],
            branch: branches[Math.floor(Math.random() * branches.length)],
            semester: semesters[Math.floor(Math.random() * semesters.length)],
            enrollmentNumber: `2023${String(i).padStart(3, '0')}`,
            createdAt: getRandomDate()
        };
        students.push(student);
    }
    return students;
};

// Generate fake content
const generateFakeContent = (facultyIds) => {
    const content = [];
    for (let i = 1; i <= 15; i++) {
        const type = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        const contentItem = {
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i}`,
            description: `This is a sample ${type} for students.`,
            type,
            program: programs[Math.floor(Math.random() * programs.length)],
            branch: branches[Math.floor(Math.random() * branches.length)],
            semester: semesters[Math.floor(Math.random() * semesters.length)],
            author: facultyIds[Math.floor(Math.random() * facultyIds.length)],
            fileUrl: `/uploads/sample-${type}-${i}.pdf`,
            createdAt: getRandomDate()
        };
        content.push(contentItem);
    }
    return content;
};

// Generate fake discussions
const generateFakeDiscussions = (studentIds) => {
    const discussions = [];
    for (let i = 1; i <= 15; i++) {
        const category = discussionCategories[Math.floor(Math.random() * discussionCategories.length)];
        const discussion = {
            title: `Discussion about ${category} ${i}`,
            content: `This is a sample discussion about ${category}.`,
            category,
            author: studentIds[Math.floor(Math.random() * studentIds.length)],
            tags: [category, 'sample'],
            createdAt: getRandomDate()
        };
        discussions.push(discussion);
    }
    return discussions;
};

// Generate fake opportunities
const generateFakeOpportunities = (facultyIds) => {
    const opportunities = [];
    for (let i = 1; i <= 15; i++) {
        const type = opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)];
        const opportunity = {
            title: `${type.charAt(0).toUpperCase() + type.slice(1)} Opportunity ${i}`,
            description: `This is a sample ${type} opportunity for students.`,
            type,
            company: `Company ${i}`,
            location: `Location ${i}`,
            deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            postedBy: facultyIds[Math.floor(Math.random() * facultyIds.length)],
            eligibility: ['B.Tech', 'M.Tech'],
            createdAt: getRandomDate()
        };
        opportunities.push(opportunity);
    }
    return opportunities;
};

// Generate fake calendar events
const generateFakeEvents = (facultyIds) => {
    const events = [];
    for (let i = 1; i <= 15; i++) {
        const event = {
            title: `Event ${i}`,
            description: `This is a sample event ${i}.`,
            startDate: getRandomDate(),
            endDate: new Date(getRandomDate().getTime() + 2 * 24 * 60 * 60 * 1000),
            location: `Location ${i}`,
            organizer: facultyIds[Math.floor(Math.random() * facultyIds.length)],
            type: ['academic', 'cultural', 'technical'][Math.floor(Math.random() * 3)],
            createdAt: getRandomDate()
        };
        events.push(event);
    }
    return events;
};

// Main seeder function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Content.deleteMany({}),
            Discussion.deleteMany({}),
            Opportunity.deleteMany({}),
            Calendar.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@nitm.ac.in',
            password: await bcrypt.hash('admin123', 10),
            role: 'admin',
            program: 'B.Tech',
            branch: 'CSE',
            enrollmentNumber: '2023000'
        });
        console.log('Created admin user');

        // Create faculty users
        const faculty = await User.create({
            name: 'Faculty User',
            email: 'faculty@nitm.ac.in',
            password: await bcrypt.hash('faculty123', 10),
            role: 'faculty',
            program: 'B.Tech',
            branch: 'CSE',
            enrollmentNumber: '2023001'
        });
        console.log('Created faculty user');

        // Create students
        const students = await User.create(await generateFakeStudents());
        console.log('Created student users');

        // Create content
        const content = await Content.create(generateFakeContent([faculty._id]));
        console.log('Created content');

        // Create discussions
        const discussions = await Discussion.create(generateFakeDiscussions(students.map(s => s._id)));
        console.log('Created discussions');

        // Create opportunities
        const opportunities = await Opportunity.create(generateFakeOpportunities([faculty._id]));
        console.log('Created opportunities');

        // Create calendar events
        const events = await Calendar.create(generateFakeEvents([faculty._id]));
        console.log('Created calendar events');

        console.log('Database seeded successfully!');
        console.log('Admin credentials:');
        console.log('Email: admin@nitm.ac.in');
        console.log('Password: admin123');
        console.log('\nFaculty credentials:');
        console.log('Email: faculty@nitm.ac.in');
        console.log('Password: faculty123');
        console.log('\nStudent credentials:');
        console.log('Email: student1@nitm.ac.in');
        console.log('Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the seeder
seedDatabase(); 