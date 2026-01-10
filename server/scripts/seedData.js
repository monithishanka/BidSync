/**
 * Seed script to create demo data for BidSync platform
 * Run with: node scripts/seedData.js
 * 
 * Creates:
 * - 4 Vendor accounts
 * - 3 Buyer accounts  
 * - 22 RFQs with various statuses
 * - 21 Bids with various statuses
 * - Ratings and Notifications
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Import models
const User = require('../models/User');
const RFQ = require('../models/RFQ');
const Bid = require('../models/Bid');
const Rating = require('../models/Rating');
const Notification = require('../models/Notification');

// Strong passwords for demo accounts
const PASSWORDS = {
  vendor1: 'Vendor@1Demo2026!',
  vendor2: 'Vendor@2Demo2026!',
  vendor3: 'Vendor@3Demo2026!',
  vendor4: 'Vendor@4Demo2026!',
  buyer1: 'Buyer@1Demo2026!',
  buyer2: 'Buyer@2Demo2026!',
  buyer3: 'Buyer@3Demo2026!'
};

// Vendor data
const vendorsData = [
  {
    email: 'vendor1@demo.bidsync.online',
    password: PASSWORDS.vendor1,
    role: 'vendor',
    companyName: 'TechSolutions Lanka Pvt Ltd',
    contactPerson: 'Kasun Perera',
    phone: '+94 77 234 5678',
    address: {
      street: '45 Galle Road',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00300'
    },
    businessCategory: ['IT & Electronics', 'Consulting Services'],
    businessRegistrationNumber: 'PV00012345',
    vatNumber: 'VAT123456789',
    isVATRegistered: true,
    isVerified: true,
    verifiedBadge: true,
    isApproved: true,
    isActive: true,
    rating: { average: 4.5, count: 3 }
  },
  {
    email: 'vendor2@demo.bidsync.online',
    password: PASSWORDS.vendor2,
    role: 'vendor',
    companyName: 'BuildRight Construction Co.',
    contactPerson: 'Nuwan Silva',
    phone: '+94 71 345 6789',
    address: {
      street: '123 Kandy Road',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000'
    },
    businessCategory: ['Construction & Raw Materials', 'Furniture'],
    businessRegistrationNumber: 'PV00023456',
    vatNumber: 'VAT234567890',
    isVATRegistered: true,
    isVerified: true,
    verifiedBadge: true,
    isApproved: true,
    isActive: true,
    rating: { average: 4.2, count: 2 }
  },
  {
    email: 'vendor3@demo.bidsync.online',
    password: PASSWORDS.vendor3,
    role: 'vendor',
    companyName: 'OfficeHub Supplies',
    contactPerson: 'Malini Fernando',
    phone: '+94 76 456 7890',
    address: {
      street: '78 Main Street',
      city: 'Negombo',
      district: 'Gampaha',
      postalCode: '11500'
    },
    businessCategory: ['Office Stationery', 'Printing & Publishing'],
    businessRegistrationNumber: 'PV00034567',
    isVATRegistered: false,
    isVerified: false,
    verifiedBadge: false,
    isApproved: true,
    isActive: true,
    rating: { average: 3.8, count: 1 }
  },
  {
    email: 'vendor4@demo.bidsync.online',
    password: PASSWORDS.vendor4,
    role: 'vendor',
    companyName: 'MediCare Equipment Ltd',
    contactPerson: 'Dr. Chaminda Jayawardena',
    phone: '+94 72 567 8901',
    address: {
      street: '200 Hospital Road',
      city: 'Galle',
      district: 'Galle',
      postalCode: '80000'
    },
    businessCategory: ['Medical Equipment', 'Catering & Food'],
    businessRegistrationNumber: 'PV00045678',
    vatNumber: 'VAT345678901',
    isVATRegistered: true,
    isVerified: false,
    verifiedBadge: false,
    isApproved: true,
    isActive: true,
    rating: { average: 4.0, count: 1 }
  }
];

// Buyer data
const buyersData = [
  {
    email: 'buyer1@demo.bidsync.online',
    password: PASSWORDS.buyer1,
    role: 'buyer',
    companyName: 'Ministry of Education',
    contactPerson: 'Saman Kumara',
    phone: '+94 11 278 9012',
    address: {
      street: 'Isurupaya, Battaramulla',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '10120'
    },
    isApproved: true,
    isActive: true
  },
  {
    email: 'buyer2@demo.bidsync.online',
    password: PASSWORDS.buyer2,
    role: 'buyer',
    companyName: 'Colombo Municipal Council',
    contactPerson: 'Nirmala Wijesekara',
    phone: '+94 11 268 1234',
    address: {
      street: 'Town Hall, Colombo 07',
      city: 'Colombo',
      district: 'Colombo',
      postalCode: '00700'
    },
    isApproved: true,
    isActive: true
  },
  {
    email: 'buyer3@demo.bidsync.online',
    password: PASSWORDS.buyer3,
    role: 'buyer',
    companyName: 'National Hospital Kandy',
    contactPerson: 'Dr. Ranjith Bandara',
    phone: '+94 81 222 3456',
    address: {
      street: 'William Gopallawa Mawatha',
      city: 'Kandy',
      district: 'Kandy',
      postalCode: '20000'
    },
    isApproved: true,
    isActive: true
  }
];

// Helper to get dates
const today = new Date();
const daysAgo = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
const daysFromNow = (days) => new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

// RFQ Templates
const createRFQs = (buyers, vendors) => [
  // ============ OPEN RFQs (8) ============
  {
    title: 'Supply of Desktop Computers for Schools',
    description: 'Procurement of 100 desktop computers with monitors for government schools in Western Province. Computers must meet minimum specifications: Intel i5 or equivalent, 8GB RAM, 256GB SSD, 21.5" monitor.',
    items: [
      { name: 'Desktop Computer with Monitor', quantity: 100, unit: 'units', specifications: 'Intel i5, 8GB RAM, 256GB SSD' },
      { name: 'Wireless Mouse', quantity: 100, unit: 'units' },
      { name: 'Keyboard', quantity: 100, unit: 'units' }
    ],
    category: 'IT & Electronics',
    budgetPrice: 5000000,
    showBudget: true,
    closingDate: daysFromNow(15),
    status: 'open',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Colombo District Schools',
    deliveryDeadline: daysFromNow(45),
    termsAndConditions: 'Vendor must provide 2-year warranty. Installation and training included.'
  },
  {
    title: 'Office Furniture - Conference Room Setup',
    description: 'Complete conference room furniture set for new municipal building. Modern design preferred.',
    items: [
      { name: 'Conference Table (20-seater)', quantity: 2, unit: 'units', specifications: 'Solid wood, modern design' },
      { name: 'Executive Chairs', quantity: 40, unit: 'units', specifications: 'Ergonomic, leather finish' },
      { name: 'Presentation Screen', quantity: 2, unit: 'units' }
    ],
    category: 'Furniture',
    budgetPrice: 2500000,
    showBudget: false,
    closingDate: daysFromNow(10),
    status: 'open',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'Town Hall, Colombo 07',
    deliveryDeadline: daysFromNow(30),
    termsAndConditions: 'Installation included. 5-year warranty required.'
  },
  {
    title: 'Medical Supplies - Surgical Equipment',
    description: 'Procurement of essential surgical equipment for operation theaters.',
    items: [
      { name: 'Surgical Light (LED)', quantity: 5, unit: 'units', specifications: 'Dual dome, 160,000 lux' },
      { name: 'Operating Table', quantity: 3, unit: 'units', specifications: 'Electric, multi-position' },
      { name: 'Anesthesia Machine', quantity: 2, unit: 'units' }
    ],
    category: 'Medical Equipment',
    budgetPrice: 15000000,
    showBudget: true,
    closingDate: daysFromNow(20),
    status: 'open',
    isSealed: true,
    isPrivate: true,
    invitedVendors: [vendors[3]._id],
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'National Hospital, Kandy',
    deliveryDeadline: daysFromNow(60),
    termsAndConditions: 'Must include installation, training, and 3-year warranty. FDA/CE certified equipment only.'
  },
  {
    title: 'Printing Services - Annual Reports',
    description: 'Printing of 2000 copies of annual reports in full color, hardbound.',
    items: [
      { name: 'Annual Report Printing', quantity: 2000, unit: 'copies', specifications: 'A4, 100 pages, full color, hardbound' },
      { name: 'Executive Summary Booklet', quantity: 500, unit: 'copies', specifications: 'A5, 20 pages' }
    ],
    category: 'Printing & Publishing',
    budgetPrice: 400000,
    showBudget: true,
    closingDate: daysFromNow(7),
    status: 'open',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Ministry of Education, Battaramulla',
    deliveryDeadline: daysFromNow(25),
    termsAndConditions: 'Proof approval required before final printing.'
  },
  {
    title: 'Construction Materials - Building Renovation',
    description: 'Supply of construction materials for municipal building renovation project.',
    items: [
      { name: 'Cement (50kg bags)', quantity: 500, unit: 'bags' },
      { name: 'Steel Bars (12mm)', quantity: 1000, unit: 'bars' },
      { name: 'Paint (White, Interior)', quantity: 100, unit: 'gallons' },
      { name: 'Tiles (Floor, 2x2 ft)', quantity: 500, unit: 'pieces' }
    ],
    category: 'Construction & Raw Materials',
    budgetPrice: 3000000,
    showBudget: false,
    closingDate: daysFromNow(12),
    status: 'open',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'CMC Warehouse, Maradana',
    deliveryDeadline: daysFromNow(35),
    termsAndConditions: 'Materials must meet SLS standards. Phased delivery acceptable.'
  },
  {
    title: 'Office Stationery - Quarterly Supply',
    description: 'Regular quarterly supply of office stationery items for administrative offices.',
    items: [
      { name: 'A4 Paper (Ream)', quantity: 500, unit: 'reams' },
      { name: 'Ball Point Pens (Blue)', quantity: 1000, unit: 'pieces' },
      { name: 'File Folders', quantity: 300, unit: 'pieces' },
      { name: 'Stapler with Pins', quantity: 50, unit: 'sets' }
    ],
    category: 'Office Stationery',
    budgetPrice: 250000,
    showBudget: true,
    closingDate: daysFromNow(5),
    status: 'open',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'Administrative Building, National Hospital',
    deliveryDeadline: daysFromNow(20),
    termsAndConditions: 'Quarterly delivery schedule. Quality brands only.'
  },
  {
    title: 'IT Consulting - Digital Transformation',
    description: 'Consulting services for digital transformation of education management system.',
    items: [
      { name: 'System Analysis', quantity: 1, unit: 'project', specifications: 'Current state assessment' },
      { name: 'Solution Design', quantity: 1, unit: 'project', specifications: 'Future state architecture' },
      { name: 'Implementation Support', quantity: 6, unit: 'months' }
    ],
    category: 'Consulting Services',
    budgetPrice: 8000000,
    showBudget: false,
    closingDate: daysFromNow(25),
    status: 'open',
    isSealed: true,
    isPrivate: true,
    invitedVendors: [vendors[0]._id],
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Ministry of Education HQ',
    deliveryDeadline: daysFromNow(180),
    termsAndConditions: 'Vendor must have ISO 27001 certification. References required.'
  },
  {
    title: 'Catering Services - Staff Cafeteria',
    description: 'Daily catering services for hospital staff cafeteria, serving approximately 500 meals per day.',
    items: [
      { name: 'Breakfast Service', quantity: 200, unit: 'meals/day' },
      { name: 'Lunch Service', quantity: 500, unit: 'meals/day' },
      { name: 'Dinner Service', quantity: 200, unit: 'meals/day' }
    ],
    category: 'Catering & Food',
    budgetPrice: 1500000,
    showBudget: true,
    closingDate: daysFromNow(18),
    status: 'open',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'Hospital Cafeteria',
    deliveryDeadline: daysFromNow(30),
    termsAndConditions: 'Monthly contract. Food safety certification required. Vegetarian options mandatory.'
  },

  // ============ CLOSED RFQs (6) - Ready for awarding ============
  {
    title: 'Network Equipment - Campus WiFi',
    description: 'Supply and installation of campus-wide WiFi network equipment.',
    items: [
      { name: 'Enterprise WiFi Access Points', quantity: 50, unit: 'units' },
      { name: 'Network Switch (48-port)', quantity: 10, unit: 'units' },
      { name: 'Firewall Appliance', quantity: 2, unit: 'units' }
    ],
    category: 'IT & Electronics',
    budgetPrice: 4500000,
    showBudget: true,
    closingDate: daysAgo(2),
    status: 'closed',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Education Campus, Maharagama',
    deliveryDeadline: daysFromNow(30),
    termsAndConditions: 'Installation and 2-year warranty included.',
    createdAt: daysAgo(17)
  },
  {
    title: 'Security Services - Building Guard',
    description: 'Security guard services for municipal buildings - 24/7 coverage.',
    items: [
      { name: 'Security Guards (Day Shift)', quantity: 10, unit: 'personnel' },
      { name: 'Security Guards (Night Shift)', quantity: 10, unit: 'personnel' },
      { name: 'Supervisors', quantity: 2, unit: 'personnel' }
    ],
    category: 'Security Services',
    budgetPrice: 2000000,
    showBudget: false,
    closingDate: daysAgo(1),
    status: 'closed',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'Multiple CMC Buildings',
    deliveryDeadline: daysFromNow(15),
    termsAndConditions: 'Annual contract. Guards must be trained and uniformed.',
    createdAt: daysAgo(16)
  },
  {
    title: 'Hospital Beds - Ward Upgrade',
    description: 'Procurement of modern hospital beds for ward upgrade project.',
    items: [
      { name: 'Electric Hospital Beds', quantity: 30, unit: 'units', specifications: 'Multi-function, with side rails' },
      { name: 'Bedside Cabinets', quantity: 30, unit: 'units' },
      { name: 'Over-bed Tables', quantity: 30, unit: 'units' }
    ],
    category: 'Medical Equipment',
    budgetPrice: 6000000,
    showBudget: true,
    closingDate: daysAgo(3),
    status: 'closed',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'Ward Complex, National Hospital',
    deliveryDeadline: daysFromNow(45),
    termsAndConditions: '3-year warranty. Installation and training included.',
    createdAt: daysAgo(18)
  },
  {
    title: 'Vehicle Spare Parts - Fleet Maintenance',
    description: 'Spare parts for government vehicle fleet maintenance.',
    items: [
      { name: 'Brake Pads Set', quantity: 50, unit: 'sets' },
      { name: 'Engine Oil (5L)', quantity: 100, unit: 'cans' },
      { name: 'Air Filters', quantity: 50, unit: 'pieces' },
      { name: 'Battery (12V)', quantity: 20, unit: 'units' }
    ],
    category: 'Vehicles & Spare Parts',
    budgetPrice: 800000,
    showBudget: true,
    closingDate: daysAgo(4),
    status: 'closed',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Ministry Vehicle Pool',
    deliveryDeadline: daysFromNow(20),
    termsAndConditions: 'Genuine parts only. Warranty certificates required.',
    createdAt: daysAgo(19)
  },
  {
    title: 'Cleaning Services - Monthly Contract',
    description: 'Professional cleaning services for administrative buildings.',
    items: [
      { name: 'Daily Cleaning', quantity: 1, unit: 'contract', specifications: '5 buildings' },
      { name: 'Deep Cleaning (Weekly)', quantity: 4, unit: 'sessions/month' },
      { name: 'Window Cleaning (Monthly)', quantity: 1, unit: 'session/month' }
    ],
    category: 'Cleaning & Maintenance',
    budgetPrice: 350000,
    showBudget: false,
    closingDate: daysAgo(5),
    status: 'closed',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'CMC Administrative Buildings',
    deliveryDeadline: daysFromNow(10),
    termsAndConditions: '12-month contract. All cleaning supplies by vendor.',
    createdAt: daysAgo(20)
  },
  {
    title: 'Laboratory Equipment - Science Labs',
    description: 'Scientific equipment for school laboratory upgrades.',
    items: [
      { name: 'Microscopes (Binocular)', quantity: 20, unit: 'units' },
      { name: 'Laboratory Workbenches', quantity: 10, unit: 'units' },
      { name: 'Chemical Storage Cabinets', quantity: 5, unit: 'units' }
    ],
    category: 'Other',
    budgetPrice: 2200000,
    showBudget: true,
    closingDate: daysAgo(6),
    status: 'closed',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Central School District',
    deliveryDeadline: daysFromNow(40),
    termsAndConditions: 'Installation and training required. 2-year warranty.',
    createdAt: daysAgo(21)
  },

  // ============ AWARDED RFQs (5) ============
  {
    title: 'Laptop Computers - Teacher Training',
    description: 'Supply of laptops for teacher digital literacy program.',
    items: [
      { name: 'Laptop (14" Display)', quantity: 50, unit: 'units', specifications: 'Core i5, 8GB RAM, 256GB SSD' },
      { name: 'Laptop Bags', quantity: 50, unit: 'units' },
      { name: 'Wireless Mouse', quantity: 50, unit: 'units' }
    ],
    category: 'IT & Electronics',
    budgetPrice: 3500000,
    showBudget: true,
    closingDate: daysAgo(15),
    status: 'awarded',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Teacher Training Institute',
    deliveryDeadline: daysAgo(5),
    termsAndConditions: '2-year warranty. Training sessions included.',
    awardedAt: daysAgo(12),
    awardRemarks: 'Best value for money with excellent warranty terms.',
    createdAt: daysAgo(30)
  },
  {
    title: 'Office Chairs - Bulk Purchase',
    description: 'Ergonomic office chairs for new administrative wing.',
    items: [
      { name: 'Ergonomic Office Chairs', quantity: 100, unit: 'units', specifications: 'Mesh back, adjustable' },
      { name: 'Chair Mats', quantity: 100, unit: 'units' }
    ],
    category: 'Furniture',
    budgetPrice: 1500000,
    showBudget: true,
    closingDate: daysAgo(20),
    status: 'awarded',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'CMC New Wing',
    deliveryDeadline: daysAgo(10),
    termsAndConditions: 'Delivery and assembly included.',
    awardedAt: daysAgo(18),
    awardRemarks: 'Superior quality demonstrated in samples provided.',
    createdAt: daysAgo(35)
  },
  {
    title: 'Surgical Gloves - Annual Supply',
    description: 'Supply of disposable surgical gloves for hospital use.',
    items: [
      { name: 'Surgical Gloves (Sterile)', quantity: 50000, unit: 'pairs', specifications: 'Latex-free, sizes S/M/L' },
      { name: 'Examination Gloves', quantity: 100000, unit: 'pairs' }
    ],
    category: 'Medical Equipment',
    budgetPrice: 2500000,
    showBudget: false,
    closingDate: daysAgo(25),
    status: 'awarded',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'Central Medical Stores',
    deliveryDeadline: daysAgo(15),
    termsAndConditions: 'Monthly delivery schedule. Quality certificates required.',
    awardedAt: daysAgo(22),
    awardRemarks: 'Competitive pricing with quality certification.',
    createdAt: daysAgo(40)
  },
  {
    title: 'Stationery Supply - Annual Contract',
    description: 'Annual supply contract for office stationery items.',
    items: [
      { name: 'A4 Paper (80gsm)', quantity: 2000, unit: 'reams' },
      { name: 'Writing Pads', quantity: 500, unit: 'pieces' },
      { name: 'Files and Folders Set', quantity: 500, unit: 'sets' }
    ],
    category: 'Office Stationery',
    budgetPrice: 600000,
    showBudget: true,
    closingDate: daysAgo(30),
    status: 'awarded',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Ministry Stores',
    deliveryDeadline: daysAgo(20),
    termsAndConditions: 'Quarterly delivery. Quality brands only.',
    awardedAt: daysAgo(28),
    awardRemarks: 'Lowest compliant bid with proven track record.',
    createdAt: daysAgo(45)
  },
  {
    title: 'Construction Work - Boundary Wall',
    description: 'Construction of boundary wall and gate for school premises.',
    items: [
      { name: 'Boundary Wall Construction', quantity: 200, unit: 'meters', specifications: '6ft height, brick and cement' },
      { name: 'Main Gate', quantity: 1, unit: 'unit', specifications: 'Steel, motorized' },
      { name: 'Security Booth', quantity: 1, unit: 'unit' }
    ],
    category: 'Construction & Raw Materials',
    budgetPrice: 4500000,
    showBudget: true,
    closingDate: daysAgo(35),
    status: 'awarded',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Model School, Nugegoda',
    deliveryDeadline: daysAgo(5),
    termsAndConditions: 'All materials by contractor. 5-year structural warranty.',
    awardedAt: daysAgo(32),
    awardRemarks: 'Excellent past performance and competitive pricing.',
    createdAt: daysAgo(50)
  },

  // ============ CANCELLED RFQs (2) ============
  {
    title: 'Air Conditioning Units - Office',
    description: 'Supply and installation of split AC units.',
    items: [
      { name: 'Split AC (18000 BTU)', quantity: 20, unit: 'units' },
      { name: 'Installation Service', quantity: 20, unit: 'units' }
    ],
    category: 'Other',
    budgetPrice: 3000000,
    showBudget: true,
    closingDate: daysAgo(10),
    status: 'cancelled',
    isSealed: false,
    isPrivate: false,
    createdBy: buyers[1]._id,
    organization: 'Colombo Municipal Council',
    deliveryLocation: 'CMC Buildings',
    termsAndConditions: 'Installation and 2-year warranty required.',
    createdAt: daysAgo(25)
  },
  {
    title: 'Vehicle Purchase - Ambulances',
    description: 'Procurement of fully equipped ambulances.',
    items: [
      { name: 'Type B Ambulance', quantity: 3, unit: 'vehicles', specifications: 'Fully equipped, life support systems' }
    ],
    category: 'Vehicles & Spare Parts',
    budgetPrice: 25000000,
    showBudget: false,
    closingDate: daysAgo(8),
    status: 'cancelled',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[2]._id,
    organization: 'National Hospital Kandy',
    deliveryLocation: 'National Hospital',
    termsAndConditions: 'Complete documentation and training required.',
    createdAt: daysAgo(23)
  },

  // ============ DRAFT RFQ (1) ============
  {
    title: 'CCTV System - Campus Security',
    description: 'Installation of CCTV surveillance system for campus security.',
    items: [
      { name: 'IP Camera (4MP)', quantity: 30, unit: 'units' },
      { name: 'NVR (32 Channel)', quantity: 2, unit: 'units' },
      { name: 'Monitoring Station', quantity: 1, unit: 'unit' }
    ],
    category: 'IT & Electronics',
    budgetPrice: 2000000,
    showBudget: true,
    closingDate: daysFromNow(30),
    status: 'draft',
    isSealed: true,
    isPrivate: false,
    createdBy: buyers[0]._id,
    organization: 'Ministry of Education',
    deliveryLocation: 'Education Campus',
    termsAndConditions: 'Installation and 2-year warranty required.'
  }
];

// Create bids for RFQs
const createBids = (rfqs, vendors) => {
  const bids = [];
  
  // Helper to get random delivery days
  const randomDays = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // RFQ 0: Desktop Computers (Open) - 3 bids
  bids.push({
    rfq: rfqs[0]._id,
    vendor: vendors[0]._id, // TechSolutions
    unitPrice: 48000,
    quantity: 100,
    isVATRegistered: true,
    deliveryTimeline: 30,
    warrantyPeriod: 24,
    remarks: 'Brand new Dell/HP computers. Includes on-site installation and training.',
    technicalSpecifications: 'Intel Core i5-12400, 8GB DDR4, 256GB NVMe SSD, 21.5" IPS Monitor',
    status: 'pending'
  });
  bids.push({
    rfq: rfqs[0]._id,
    vendor: vendors[2]._id, // OfficeHub
    unitPrice: 46500,
    quantity: 100,
    isVATRegistered: false,
    deliveryTimeline: 35,
    warrantyPeriod: 12,
    remarks: 'Quality refurbished computers available at lower cost.',
    status: 'pending'
  });

  // RFQ 1: Office Furniture (Open) - 2 bids
  bids.push({
    rfq: rfqs[1]._id,
    vendor: vendors[1]._id, // BuildRight
    unitPrice: 50000,
    quantity: 44, // Combined items
    isVATRegistered: true,
    deliveryTimeline: 21,
    warrantyPeriod: 60,
    remarks: 'Premium teak wood conference tables with ergonomic chairs.',
    status: 'pending'
  });

  // RFQ 2: Medical Supplies (Private, Open) - 2 bids from invited vendor
  bids.push({
    rfq: rfqs[2]._id,
    vendor: vendors[3]._id, // MediCare
    unitPrice: 1400000,
    quantity: 10, // Combined surgical equipment
    isVATRegistered: true,
    deliveryTimeline: 45,
    warrantyPeriod: 36,
    remarks: 'CE certified equipment from leading German manufacturers.',
    technicalSpecifications: 'Surgical lights: STERIS Harmony LED. Tables: Maquet Alphamaxx.',
    status: 'pending'
  });

  // RFQ 3: Printing Services (Open, Unsealed) - 2 bids
  bids.push({
    rfq: rfqs[3]._id,
    vendor: vendors[2]._id, // OfficeHub
    unitPrice: 180,
    quantity: 2500,
    isVATRegistered: false,
    deliveryTimeline: 18,
    warrantyPeriod: 0,
    remarks: 'Full color offset printing with premium binding.',
    status: 'pending'
  });

  // RFQ 4: Construction Materials (Open) - 2 bids
  bids.push({
    rfq: rfqs[4]._id,
    vendor: vendors[1]._id, // BuildRight
    unitPrice: 2800,
    quantity: 1100,
    isVATRegistered: true,
    deliveryTimeline: 14,
    warrantyPeriod: 0,
    remarks: 'All materials SLS certified. Phased delivery available.',
    status: 'pending'
  });

  // RFQ 5: Office Stationery (Open, Unsealed) - 2 bids
  bids.push({
    rfq: rfqs[5]._id,
    vendor: vendors[2]._id, // OfficeHub
    unitPrice: 120,
    quantity: 1850,
    isVATRegistered: false,
    deliveryTimeline: 7,
    warrantyPeriod: 0,
    remarks: 'Premium quality branded stationery items.',
    status: 'pending'
  });

  // RFQ 6: IT Consulting (Private, Open) - 1 bid
  bids.push({
    rfq: rfqs[6]._id,
    vendor: vendors[0]._id, // TechSolutions
    unitPrice: 1200000,
    quantity: 1,
    isVATRegistered: true,
    deliveryTimeline: 180,
    warrantyPeriod: 12,
    remarks: 'Comprehensive digital transformation with agile methodology.',
    technicalSpecifications: 'Using Microsoft Azure cloud platform. Includes training for 50 staff.',
    status: 'pending'
  });

  // RFQ 7: Catering Services (Open) - 2 bids
  bids.push({
    rfq: rfqs[7]._id,
    vendor: vendors[3]._id, // MediCare
    unitPrice: 1600,
    quantity: 900,
    isVATRegistered: true,
    deliveryTimeline: 30,
    warrantyPeriod: 0,
    remarks: '12-month catering contract with fresh menu options daily.',
    status: 'pending'
  });

  // RFQ 8: Network Equipment (Closed) - 3 bids
  bids.push({
    rfq: rfqs[8]._id,
    vendor: vendors[0]._id, // TechSolutions
    unitPrice: 70000,
    quantity: 62,
    isVATRegistered: true,
    deliveryTimeline: 21,
    warrantyPeriod: 24,
    remarks: 'Cisco enterprise-grade equipment with professional installation.',
    status: 'pending',
    isRevealed: true
  });
  bids.push({
    rfq: rfqs[8]._id,
    vendor: vendors[2]._id, // OfficeHub
    unitPrice: 65000,
    quantity: 62,
    isVATRegistered: false,
    deliveryTimeline: 28,
    warrantyPeriod: 12,
    remarks: 'TP-Link enterprise series. Cost-effective solution.',
    status: 'pending',
    isRevealed: true
  });

  // RFQ 11: Vehicle Spare Parts (Closed) - 2 bids
  bids.push({
    rfq: rfqs[11]._id,
    vendor: vendors[1]._id,
    unitPrice: 3500,
    quantity: 220,
    isVATRegistered: true,
    deliveryTimeline: 10,
    warrantyPeriod: 12,
    remarks: 'Genuine parts with warranty certificates.',
    status: 'pending',
    isRevealed: true
  });

  // RFQ 14: Laptop Computers (Awarded) - winning bid
  bids.push({
    rfq: rfqs[14]._id,
    vendor: vendors[0]._id, // TechSolutions - WINNER
    unitPrice: 68000,
    quantity: 50,
    isVATRegistered: true,
    deliveryTimeline: 21,
    warrantyPeriod: 24,
    remarks: 'Dell Latitude series with pre-installed software.',
    technicalSpecifications: 'Dell Latitude 3520, Core i5-1135G7, 8GB, 256GB SSD',
    status: 'won',
    isRevealed: true
  });
  bids.push({
    rfq: rfqs[14]._id,
    vendor: vendors[2]._id, // OfficeHub - lost
    unitPrice: 65000,
    quantity: 50,
    isVATRegistered: false,
    deliveryTimeline: 28,
    warrantyPeriod: 12,
    remarks: 'Lenovo ideapad series.',
    status: 'lost',
    isRevealed: true
  });

  // RFQ 15: Office Chairs (Awarded) - winning bid
  bids.push({
    rfq: rfqs[15]._id,
    vendor: vendors[1]._id, // BuildRight - WINNER
    unitPrice: 13500,
    quantity: 100,
    isVATRegistered: true,
    deliveryTimeline: 14,
    warrantyPeriod: 36,
    remarks: 'Ergonomic mesh chairs with lumbar support.',
    status: 'won',
    isRevealed: true
  });

  // RFQ 16: Surgical Gloves (Awarded) - winning bid
  bids.push({
    rfq: rfqs[16]._id,
    vendor: vendors[3]._id, // MediCare - WINNER
    unitPrice: 15,
    quantity: 150000,
    isVATRegistered: true,
    deliveryTimeline: 7,
    warrantyPeriod: 0,
    remarks: 'ISO certified, latex-free gloves. Monthly delivery schedule.',
    status: 'won',
    isRevealed: true
  });

  // RFQ 17: Stationery Supply (Awarded) - winning bid
  bids.push({
    rfq: rfqs[17]._id,
    vendor: vendors[2]._id, // OfficeHub - WINNER
    unitPrice: 180,
    quantity: 3000,
    isVATRegistered: false,
    deliveryTimeline: 10,
    warrantyPeriod: 0,
    remarks: 'Premium quality paper and branded stationery.',
    status: 'won',
    isRevealed: true
  });
  bids.push({
    rfq: rfqs[17]._id,
    vendor: vendors[0]._id, // TechSolutions - lost
    unitPrice: 195,
    quantity: 3000,
    isVATRegistered: true,
    deliveryTimeline: 7,
    warrantyPeriod: 0,
    remarks: 'Express delivery available.',
    status: 'lost',
    isRevealed: true
  });

  // RFQ 18: Construction Work (Awarded) - winning bid
  bids.push({
    rfq: rfqs[18]._id,
    vendor: vendors[1]._id, // BuildRight - WINNER
    unitPrice: 20000,
    quantity: 202,
    isVATRegistered: true,
    deliveryTimeline: 60,
    warrantyPeriod: 60,
    remarks: 'Complete construction with quality materials. Experienced team.',
    status: 'won',
    isRevealed: true
  });

  // Withdrawn bids
  bids.push({
    rfq: rfqs[4]._id, // Construction Materials
    vendor: vendors[0]._id,
    unitPrice: 3000,
    quantity: 1100,
    isVATRegistered: true,
    deliveryTimeline: 20,
    remarks: 'Initial quotation - withdrawn due to supplier issues.',
    status: 'withdrawn',
    isWithdrawn: true,
    withdrawnAt: daysAgo(5),
    withdrawalReason: 'Unable to secure materials from supplier at quoted prices.'
  });

  return bids;
};

// Create ratings for awarded tenders
const createRatings = (rfqs, bids, vendors, buyers) => {
  return [
    {
      vendor: vendors[0]._id, // TechSolutions - Laptops
      buyer: buyers[0]._id,
      rfq: rfqs[14]._id,
      bid: bids.find(b => b.rfq.equals(rfqs[14]._id) && b.vendor.equals(vendors[0]._id))._id,
      overallRating: 5,
      qualityRating: 5,
      deliveryRating: 4,
      communicationRating: 5,
      valueRating: 4,
      review: 'Excellent service! Laptops delivered on time with comprehensive training provided. Very professional team.',
      isPublic: true
    },
    {
      vendor: vendors[1]._id, // BuildRight - Chairs
      buyer: buyers[1]._id,
      rfq: rfqs[15]._id,
      bid: bids.find(b => b.rfq.equals(rfqs[15]._id) && b.vendor.equals(vendors[1]._id))._id,
      overallRating: 4,
      qualityRating: 4,
      deliveryRating: 4,
      communicationRating: 5,
      valueRating: 4,
      review: 'Good quality chairs delivered as promised. Minor delay in assembly but overall satisfied.',
      isPublic: true
    },
    {
      vendor: vendors[3]._id, // MediCare - Gloves
      buyer: buyers[2]._id,
      rfq: rfqs[16]._id,
      bid: bids.find(b => b.rfq.equals(rfqs[16]._id) && b.vendor.equals(vendors[3]._id))._id,
      overallRating: 4,
      qualityRating: 5,
      deliveryRating: 4,
      communicationRating: 4,
      valueRating: 3,
      review: 'High-quality medical supplies with proper certifications. Pricing could be more competitive.',
      isPublic: true
    },
    {
      vendor: vendors[2]._id, // OfficeHub - Stationery
      buyer: buyers[0]._id,
      rfq: rfqs[17]._id,
      bid: bids.find(b => b.rfq.equals(rfqs[17]._id) && b.vendor.equals(vendors[2]._id))._id,
      overallRating: 4,
      qualityRating: 4,
      deliveryRating: 5,
      communicationRating: 3,
      valueRating: 4,
      review: 'Good value for money. Fast delivery. Communication could be improved.',
      isPublic: true
    },
    {
      vendor: vendors[1]._id, // BuildRight - Construction
      buyer: buyers[0]._id,
      rfq: rfqs[18]._id,
      bid: bids.find(b => b.rfq.equals(rfqs[18]._id) && b.vendor.equals(vendors[1]._id))._id,
      overallRating: 5,
      qualityRating: 5,
      deliveryRating: 5,
      communicationRating: 5,
      valueRating: 4,
      review: 'Outstanding construction work. Completed ahead of schedule with excellent workmanship.',
      isPublic: true
    }
  ];
};

// Main seed function
async function seedData() {
  try {
    console.log('\n🌱 Starting seed process...\n');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    
    // Create vendors
    console.log('👥 Creating vendor accounts...');
    const vendors = [];
    for (const vendorData of vendorsData) {
      const hashedPassword = await bcrypt.hash(vendorData.password, salt);
      const vendor = new User({ ...vendorData, password: hashedPassword });
      await vendor.save();
      vendors.push(vendor);
      console.log(`   ✅ ${vendor.companyName} (${vendor.email})`);
    }

    // Create buyers
    console.log('\n👥 Creating buyer accounts...');
    const buyers = [];
    for (const buyerData of buyersData) {
      const hashedPassword = await bcrypt.hash(buyerData.password, salt);
      const buyer = new User({ ...buyerData, password: hashedPassword });
      await buyer.save();
      buyers.push(buyer);
      console.log(`   ✅ ${buyer.companyName} (${buyer.email})`);
    }

    // Create RFQs
    console.log('\n📋 Creating RFQs...');
    const rfqsData = createRFQs(buyers, vendors);
    const rfqs = [];
    for (const rfqData of rfqsData) {
      const rfq = new RFQ(rfqData);
      await rfq.save();
      rfqs.push(rfq);
      console.log(`   ✅ ${rfq.referenceId}: ${rfq.title} [${rfq.status.toUpperCase()}]`);
    }

    // Create bids
    console.log('\n💰 Creating bids...');
    const bidsData = createBids(rfqs, vendors);
    const bids = [];
    for (const bidData of bidsData) {
      const bid = new Bid(bidData);
      await bid.save();
      bids.push(bid);
      
      // Update RFQ bid count
      await RFQ.findByIdAndUpdate(bidData.rfq, { $inc: { bidCount: 1 } });
      
      const rfq = rfqs.find(r => r._id.equals(bidData.rfq));
      const vendor = vendors.find(v => v._id.equals(bidData.vendor));
      console.log(`   ✅ Bid on ${rfq.referenceId} by ${vendor.companyName} [${bid.status.toUpperCase()}]`);
    }

    // Link awarded bids to RFQs
    console.log('\n🏆 Linking awarded bids...');
    for (const rfq of rfqs.filter(r => r.status === 'awarded')) {
      const winningBid = bids.find(b => b.rfq.equals(rfq._id) && b.status === 'won');
      if (winningBid) {
        await RFQ.findByIdAndUpdate(rfq._id, {
          awardedTo: winningBid.vendor,
          awardedBid: winningBid._id
        });
        console.log(`   ✅ Linked ${rfq.referenceId} to winning bid`);
      }
    }

    // Create ratings
    console.log('\n⭐ Creating ratings...');
    const ratingsData = createRatings(rfqs, bids, vendors, buyers);
    for (const ratingData of ratingsData) {
      try {
        const rating = new Rating(ratingData);
        await rating.save();
        const vendor = vendors.find(v => v._id.equals(ratingData.vendor));
        console.log(`   ✅ Rating for ${vendor.companyName}: ${ratingData.overallRating}★`);
      } catch (err) {
        console.log(`   ⚠️ Rating skipped (may already exist)`);
      }
    }

    // Create sample notifications
    console.log('\n🔔 Creating notifications...');
    const notifications = [
      // For vendors
      { user: vendors[0]._id, type: 'tender_awarded', title: 'Tender Won!', message: 'Congratulations! You won the tender for Laptop Computers - Teacher Training.', relatedRFQ: rfqs[14]._id, isRead: true },
      { user: vendors[0]._id, type: 'new_rfq', title: 'New RFQ in Your Category', message: 'A new RFQ for Desktop Computers has been posted.', relatedRFQ: rfqs[0]._id, isRead: false },
      { user: vendors[1]._id, type: 'tender_awarded', title: 'Tender Won!', message: 'You won the construction work tender for Boundary Wall.', relatedRFQ: rfqs[18]._id, isRead: true },
      { user: vendors[1]._id, type: 'new_rfq', title: 'New RFQ in Your Category', message: 'A new RFQ for Office Furniture has been posted.', relatedRFQ: rfqs[1]._id, isRead: false },
      { user: vendors[2]._id, type: 'tender_awarded', title: 'Tender Won!', message: 'You won the stationery supply tender.', relatedRFQ: rfqs[17]._id, isRead: false },
      { user: vendors[3]._id, type: 'private_invite', title: 'Private Tender Invitation', message: 'You have been invited to bid on Medical Supplies - Surgical Equipment.', relatedRFQ: rfqs[2]._id, isRead: false },
      { user: vendors[3]._id, type: 'tender_awarded', title: 'Tender Won!', message: 'You won the surgical gloves tender.', relatedRFQ: rfqs[16]._id, isRead: true },
      // For buyers
      { user: buyers[0]._id, type: 'bid_received', title: 'New Bid Received', message: 'TechSolutions Lanka submitted a bid on Desktop Computers RFQ.', relatedRFQ: rfqs[0]._id, isRead: false },
      { user: buyers[0]._id, type: 'bid_received', title: 'New Bid Received', message: 'OfficeHub Supplies submitted a bid on Desktop Computers RFQ.', relatedRFQ: rfqs[0]._id, isRead: false },
      { user: buyers[1]._id, type: 'bid_received', title: 'New Bid Received', message: 'BuildRight Construction submitted a bid on Office Furniture RFQ.', relatedRFQ: rfqs[1]._id, isRead: true },
      { user: buyers[2]._id, type: 'bid_received', title: 'New Bid Received', message: 'MediCare Equipment submitted a bid on Medical Supplies RFQ.', relatedRFQ: rfqs[2]._id, isRead: false }
    ];
    
    for (const notifData of notifications) {
      const notification = new Notification(notifData);
      await notification.save();
    }
    console.log(`   ✅ Created ${notifications.length} notifications`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📊 Summary:');
    console.log(`   • Vendors: ${vendors.length}`);
    console.log(`   • Buyers: ${buyers.length}`);
    console.log(`   • RFQs: ${rfqs.length}`);
    console.log(`   • Bids: ${bids.length}`);
    console.log(`   • Ratings: ${ratingsData.length}`);
    console.log(`   • Notifications: ${notifications.length}`);
    
    console.log('\n📧 LOGIN CREDENTIALS:');
    console.log('\n   VENDORS:');
    vendors.forEach((v, i) => {
      console.log(`   ${v.email}`);
      console.log(`   Password: ${PASSWORDS[`vendor${i+1}`]}\n`);
    });
    console.log('   BUYERS:');
    buyers.forEach((b, i) => {
      console.log(`   ${b.email}`);
      console.log(`   Password: ${PASSWORDS[`buyer${i+1}`]}\n`);
    });

    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: Save these passwords securely!');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
