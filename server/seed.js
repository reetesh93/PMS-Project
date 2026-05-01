const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const admin = await User.create({
      name: 'Reetesh Kumar',
      email: 'admin@projectflow.com',
      password: 'admin123',
      role: 'admin',
    });

    const member1 = await User.create({
      name: 'Aman Sharma',
      email: 'aman@projectflow.com',
      password: 'member123',
      role: 'member',
    });

    const member2 = await User.create({
      name: 'Rahul Singh',
      email: 'rahul@projectflow.com',
      password: 'member123',
      role: 'member',
    });

    console.log('👥 Users created');

    // Create projects
    const projectColors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b'];

    const project1 = await Project.create({
      name: 'E-commerce Website',
      description: 'Building a full-featured online store with payment integration.',
      createdBy: admin._id,
      members: [admin._id, member1._id, member2._id],
      color: projectColors[0],
    });

    const project2 = await Project.create({
      name: 'Mobile Banking App',
      description: 'React Native app for secure digital banking.',
      createdBy: admin._id,
      members: [admin._id, member1._id],
      color: projectColors[1],
    });

    const project3 = await Project.create({
      name: 'HR Management System',
      description: 'Internal tool for employee tracking and payroll.',
      createdBy: admin._id,
      members: [admin._id, member2._id],
      color: projectColors[2],
    });

    console.log('📁 Projects created');

    const now = new Date();
    const future = (days) => new Date(now.getTime() + days * 86400000);
    const past = (days) => new Date(now.getTime() - days * 86400000);

    // Create tasks
    await Task.create([
      // E-commerce tasks
      { title: 'Design Homepage UI', projectId: project1._id, assignedTo: member1._id, status: 'Done', priority: 'High', dueDate: past(3), createdBy: admin._id, description: 'Create wireframes and high-fidelity mockups for the homepage.' },
      { title: 'Setup Product Catalog API', projectId: project1._id, assignedTo: member2._id, status: 'In Progress', priority: 'High', dueDate: future(2), createdBy: admin._id, description: 'Build REST endpoints for product CRUD operations.' },
      { title: 'Implement Cart Functionality', projectId: project1._id, assignedTo: member1._id, status: 'Pending', priority: 'Medium', dueDate: future(7), createdBy: admin._id, description: 'Add to cart, remove, update quantity features.' },
      { title: 'Payment Gateway Integration', projectId: project1._id, assignedTo: member2._id, status: 'Pending', priority: 'High', dueDate: future(10), createdBy: admin._id, description: 'Integrate Stripe for payment processing.' },
      { title: 'Write Unit Tests', projectId: project1._id, assignedTo: member1._id, status: 'Pending', priority: 'Low', dueDate: past(1), createdBy: admin._id, description: 'Cover all API endpoints with Jest tests.' },
      // Banking app tasks
      { title: 'Authentication Flow', projectId: project2._id, assignedTo: member1._id, status: 'Done', priority: 'High', dueDate: past(5), createdBy: admin._id, description: 'Biometric and PIN-based auth for mobile app.' },
      { title: 'Transaction Dashboard', projectId: project2._id, assignedTo: member1._id, status: 'In Progress', priority: 'High', dueDate: future(3), createdBy: admin._id, description: 'Charts and filters for transaction history.' },
      { title: 'Push Notifications', projectId: project2._id, assignedTo: member1._id, status: 'Pending', priority: 'Medium', dueDate: future(8), createdBy: admin._id, description: 'Firebase Cloud Messaging integration.' },
      // HR tasks
      { title: 'Employee Onboarding Module', projectId: project3._id, assignedTo: member2._id, status: 'In Progress', priority: 'Medium', dueDate: future(5), createdBy: admin._id, description: 'Digital onboarding workflow for new hires.' },
      { title: 'Payroll Calculation Engine', projectId: project3._id, assignedTo: member2._id, status: 'Pending', priority: 'High', dueDate: past(2), createdBy: admin._id, description: 'Automated salary and tax computation.' },
      { title: 'Leave Management System', projectId: project3._id, assignedTo: member2._id, status: 'Done', priority: 'Low', dueDate: past(7), createdBy: admin._id, description: 'Apply, approve, and track employee leaves.' },
    ]);

    console.log('✅ Tasks created');
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('📧 Login credentials:');
    console.log('   Admin:   admin@projectflow.com  / admin123');
    console.log('   Member1: aman@projectflow.com   / member123');
    console.log('   Member2: rahul@projectflow.com  / member123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
