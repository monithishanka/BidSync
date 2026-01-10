/**
 * Seed script to create initial admin account
 * Run with: node scripts/seedAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// User Schema (inline for seeding)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'vendor', 'admin'], required: true },
  companyName: String,
  contactPerson: String,
  phone: String,
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin account already exists:');
      console.log(`  Email: ${existingAdmin.email}`);
      process.exit(0);
    }

    // Create admin account
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      email: 'admin@bidsync.online',
      password: hashedPassword,
      role: 'admin',
      companyName: 'BidSync Administration',
      contactPerson: 'System Admin',
      phone: '+94 11 234 5678',
      isApproved: true,
      isActive: true
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!\n');
    console.log('  Email:    admin@bidsync.online');
    console.log('  Password: admin123');
    console.log('\n⚠️  Please change this password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();
