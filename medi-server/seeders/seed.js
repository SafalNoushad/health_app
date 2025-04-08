const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db.config');
const User = require('../models/user.model');
const Hospital = require('../models/hospital.model');
const Appointment = require('../models/appointment.model');
const HealthCondition = require('../models/health.model');

// Load environment variables
dotenv.config();

// Sample data
const hospitals = [
  {
    name: 'General Hospital',
    address: '123 Main Street, Cityville',
    phone: '555-123-4567',
    email: 'info@generalhospital.com',
    website: 'www.generalhospital.com'
  },
  {
    name: 'Community Medical Center',
    address: '456 Oak Avenue, Townsburg',
    phone: '555-987-6543',
    email: 'contact@communitymedical.com',
    website: 'www.communitymedical.com'
  },
  {
    name: 'Riverside Health Clinic',
    address: '789 River Road, Villageton',
    phone: '555-456-7890',
    email: 'info@riversidehealth.com',
    website: 'www.riversidehealth.com'
  }
];

const specialities = [
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Obstetrics',
  'Oncology',
  'Ophthalmology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Urology'
];

// Function to seed hospitals
async function seedHospitals() {
  try {
    // Clear existing data
    await Hospital.deleteMany({});
    console.log('Deleted existing hospitals');
    
    // Insert new data
    const createdHospitals = await Hospital.insertMany(hospitals);
    console.log(`Seeded ${createdHospitals.length} hospitals`);
    return createdHospitals;
  } catch (error) {
    console.error('Error seeding hospitals:', error.message);
    throw error;
  }
}

// Function to seed users
async function seedUsers(hospitals) {
  try {
    // Clear existing data
    await User.deleteMany({});
    console.log('Deleted existing users');
    
    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      phone: '555-111-2222',
      address: 'Admin Address'
    });
    await admin.save();
    console.log('Seeded admin user');
    
    // Create doctors (3 per hospital with different specialities)
    const doctors = [];
    for (const hospital of hospitals) {
      for (let i = 0; i < 3; i++) {
        const specialityIndex = Math.floor(Math.random() * specialities.length);
        const doctor = new User({
          name: `Dr. ${specialities[specialityIndex].substring(0, 3)} ${i + 1}`,
          email: `doctor${doctors.length + 1}@example.com`,
          password: 'password123',
          role: 'doctor',
          phone: `555-${100 + doctors.length}`,
          address: `${hospital.address.split(',')[0]}, Suite ${100 + i}`,
          speciality: specialities[specialityIndex],
          hospitalId: hospital._id
        });
        await doctor.save();
        doctors.push(doctor);
      }
    }
    console.log(`Seeded ${doctors.length} doctors`);
    
    // Create patients
    const patients = [];
    for (let i = 0; i < 10; i++) {
      const patient = new User({
        name: `Patient ${i + 1}`,
        email: `patient${i + 1}@example.com`,
        password: 'password123',
        role: 'patient',
        phone: `555-${200 + i}`,
        address: `${i + 1} Patient Street, Patientville`
      });
      await patient.save();
      patients.push(patient);
    }
    console.log(`Seeded ${patients.length} patients`);
    
    return { admin, doctors, patients };
  } catch (error) {
    console.error('Error seeding users:', error.message);
    throw error;
  }
}

// Function to seed appointments
async function seedAppointments(doctors, patients, hospitals) {
  try {
    // Clear existing data
    await Appointment.deleteMany({});
    console.log('Deleted existing appointments');
    
    const appointments = [];
    const statuses = ['pending', 'approved', 'completed', 'rejected', 'rescheduled'];
    const today = new Date();
    
    // Create 2 appointments per patient with random doctors
    for (const patient of patients) {
      for (let i = 0; i < 2; i++) {
        const doctorIndex = Math.floor(Math.random() * doctors.length);
        const doctor = doctors[doctorIndex];
        const hospital = hospitals.find(h => h._id.toString() === doctor.hospitalId.toString());
        
        // Generate a date within the next 30 days
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        const formattedDate = appointmentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Generate a random time between 9 AM and 5 PM
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
        const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        const statusIndex = Math.floor(Math.random() * statuses.length);
        
        const appointment = new Appointment({
          doctorId: doctor._id,
          doctorName: doctor.name,
          patientId: patient._id,
          speciality: doctor.speciality,
          date: formattedDate,
          time: formattedTime,
          status: statuses[statusIndex],
          hospitalId: hospital._id,
          notes: `Appointment notes for ${patient.name} with ${doctor.name}`
        });
        
        await appointment.save();
        appointments.push(appointment);
      }
    }
    
    console.log(`Seeded ${appointments.length} appointments`);
    return appointments;
  } catch (error) {
    console.error('Error seeding appointments:', error.message);
    throw error;
  }
}

// Function to seed health conditions
async function seedHealthConditions(patients) {
  try {
    // Clear existing data
    await HealthCondition.deleteMany({});
    console.log('Deleted existing health conditions');
    
    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const healthConditions = [];
    const conditions = ['diabetes', 'hypertension', 'asthma', 'heartDisease', 'arthritis', 'chronicKidneyDisease', 'thyroidDisorders'];
    const documentDescriptions = [
      'Medical Report',
      'Lab Results',
      'Doctor Notes',
      'Prescription',
      'Specialist Referral',
      'Treatment Plan',
      'Medical History'
    ];
    
    // Create health conditions for each patient
    for (const patient of patients) {
      // Randomly assign 0-3 health conditions to each patient
      const patientConditions = {};
      const numConditions = Math.floor(Math.random() * 4); // 0 to 3 conditions
      
      // Shuffle conditions array to pick random conditions
      const shuffledConditions = [...conditions].sort(() => 0.5 - Math.random());
      
      // Set selected conditions to true
      for (let i = 0; i < numConditions; i++) {
        patientConditions[shuffledConditions[i]] = true;
      }
      
      // Create 0-2 sample document entries (without actually creating files)
      const documents = [];
      const numDocuments = Math.floor(Math.random() * 3); // 0 to 2 documents
      
      for (let i = 0; i < numDocuments; i++) {
        const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000); // Random date within last 30 days
        const filename = `${timestamp}-Sample_Medical_Document_${i+1}.pdf`;
        const descIndex = Math.floor(Math.random() * documentDescriptions.length);
        
        documents.push({
          filename: filename,
          path: `uploads/${filename}`,
          uploadDate: new Date(timestamp),
          description: documentDescriptions[descIndex]
        });
      }
      
      // Create health condition record
      const healthCondition = new HealthCondition({
        userId: patient._id,
        ...patientConditions,
        documents: documents
      });
      
      await healthCondition.save();
      healthConditions.push(healthCondition);
    }
    
    console.log(`Seeded ${healthConditions.length} health condition records`);
    return healthConditions;
  } catch (error) {
    console.error('Error seeding health conditions:', error.message);
    throw error;
  }
}

// Main seeding function
async function seedDatabase() {
  try {
    // Connect to the database
    await connectDB();
    console.log('Connected to the database');
    
    // Seed data in sequence (to maintain relationships)
    const seededHospitals = await seedHospitals();
    const { admin, doctors, patients } = await seedUsers(seededHospitals);
    const appointments = await seedAppointments(doctors, patients, seededHospitals);
    const healthConditions = await seedHealthConditions(patients);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--all') {
  // Seed all collections
  seedDatabase();
} else {
  // Connect to database first
  connectDB().then(async () => {
    console.log('Connected to the database');
    
    try {
      if (args.includes('--hospitals')) {
        await seedHospitals();
      }
      
      if (args.includes('--users')) {
        const hospitals = await Hospital.find();
        if (hospitals.length === 0) {
          console.log('No hospitals found. Please seed hospitals first or use --all');
        } else {
          await seedUsers(hospitals);
        }
      }
      
      if (args.includes('--appointments')) {
        const doctors = await User.find({ role: 'doctor' });
        const patients = await User.find({ role: 'patient' });
        const hospitals = await Hospital.find();
        
        if (doctors.length === 0 || patients.length === 0) {
          console.log('No doctors or patients found. Please seed users first or use --all');
        } else {
          await seedAppointments(doctors, patients, hospitals);
        }
      }
      
      if (args.includes('--health')) {
        const patients = await User.find({ role: 'patient' });
        
        if (patients.length === 0) {
          console.log('No patients found. Please seed users first or use --all');
        } else {
          await seedHealthConditions(patients);
        }
      }
      
      console.log('Seeding completed for specified collections');
      process.exit(0);
    } catch (error) {
      console.error('Error during selective seeding:', error.message);
      process.exit(1);
    }
  }).catch(err => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
}