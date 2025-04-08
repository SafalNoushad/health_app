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
const RFID = require('../models/rfid.model');

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
    await Hospital.deleteMany({});
    console.log('Deleted existing hospitals');
    
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
    await User.deleteMany({});
    console.log('Deleted existing users');
    
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
    
    const doctors = [];
    for (const hospital of hospitals) {
      for (let i = 0; i < 3; i++) {
        const specialityIndex = Math.floor(Math.random() * specialities.length);
        const doctor = new User({
          name: `Dr. ${specialities[specialityIndex].substring(0, 3)} ${i + 1}`,
          email: `doctor${doctors.length + 1}@example.com`,
          password:  'password123',
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
    await Appointment.deleteMany({});
    console.log('Deleted existing appointments');
    
    const appointments = [];
    const statuses = ['pending', 'approved', 'completed', 'rejected', 'rescheduled'];
    const today = new Date();
    
    for (const patient of patients) {
      for (let i = 0; i < 2; i++) {
        const doctorIndex = Math.floor(Math.random() * doctors.length);
        const doctor = doctors[doctorIndex];
        const hospital = hospitals.find(h => h._id.toString() === doctor.hospitalId.toString());
        
        if (!hospital) continue;
        
        const appointmentDate = new Date(today);
        appointmentDate.setDate(today.getDate() + Math.floor(Math.random() * 30));
        const formattedDate = appointmentDate.toISOString().split('T')[0];
        
        const hour = 9 + Math.floor(Math.random() * 8);
        const minute = Math.floor(Math.random() * 4) * 15;
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
    await HealthCondition.deleteMany({});
    console.log('Deleted existing health conditions');
    
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
    
    for (const patient of patients) {
      const patientConditions = {};
      const numConditions = Math.floor(Math.random() * 4);
      
      const shuffledConditions = [...conditions].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numConditions; i++) {
        patientConditions[shuffledConditions[i]] = true;
      }
      
      const documents = [];
      const numDocuments = Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numDocuments; i++) {
        const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
        const filename = `${timestamp}-Sample_Medical_Document_${i+1}.pdf`;
        const descIndex = Math.floor(Math.random() * documentDescriptions.length);
        
        documents.push({
          filename,
          path: `uploads/${filename}`,
          uploadDate: new Date(timestamp),
          description: documentDescriptions[descIndex]
        });
      }
      
      const healthCondition = new HealthCondition({
        userId: patient._id,
        ...patientConditions,
        documents
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

// Function to seed RFID cards
async function seedRFIDCards(patients, admin) {
  try {
    await RFID.deleteMany({});
    console.log('Deleted existing RFID cards');
    
    const rfidCards = [];
    
    // Assign RFID cards to half of the patients
    const patientsToAssign = patients.slice(0, Math.ceil(patients.length / 2));
    
    for (const [index, patient] of patientsToAssign.entries()) {
      // Generate a unique RFID number (for testing purposes)
      const rfidNumber = `RFID-${100000 + index}`;
      
      const rfidCard = new RFID({
        rfidNumber,
        userId: patient._id,
        isActive: true,
        assignedBy: admin._id
      });
      
      await rfidCard.save();
      rfidCards.push(rfidCard);
    }
    
    console.log(`Seeded ${rfidCards.length} RFID cards`);
    return rfidCards;
  } catch (error) {
    console.error('Error seeding RFID cards:', error.message);
    throw error;
  }
}

// Function to seed conversations
async function seedConversations(patients) {
  try {
    const Conversation = require('../models/conversation.model');
    
    await Conversation.deleteMany({});
    console.log('Deleted existing conversations');
    
    const conversations = [];
    
    const sampleConversations = [
      {
        title: 'Headache Symptoms',
        messages: [
          {
            role: 'user',
            content: 'I\'ve been having frequent headaches for the past week. What could be causing this?'
          },
          {
            role: 'assistant',
            content: 'I\'m sorry to hear you\'ve been experiencing headaches. There are many possible causes including stress, dehydration, lack of sleep, eye strain, or tension. If your headaches are severe, sudden, or accompanied by other symptoms like fever, confusion, or stiff neck, you should seek immediate medical attention. Would you like to tell me more about your symptoms?'
          },
          {
            role: 'user',
            content: 'The pain is usually on one side of my head and gets worse with bright lights.'
          },
          {
            role: 'assistant',
            content: 'Those symptoms could be consistent with migraine headaches. Migraines often cause pain on one side of the head and sensitivity to light and sound. I recommend consulting with your doctor who can provide a proper diagnosis and treatment plan. In the meantime, resting in a dark, quiet room and staying hydrated may help. Would you like me to help you schedule an appointment with a neurologist?'
          }
        ]
      },
      {
        title: 'Diet Recommendations',
        messages: [
          {
            role: 'user',
            content: 'I was recently diagnosed with type 2 diabetes. What foods should I avoid?'
          },
          {
            role: 'assistant',
            content: 'With type 2 diabetes, it\'s important to manage your carbohydrate intake and choose foods with a low glycemic index. Foods to limit include: sugary drinks, refined carbohydrates (white bread, pasta, rice), processed snacks, sweetened cereals, and high-sugar fruits. Instead, focus on vegetables, whole grains, lean proteins, healthy fats, and moderate amounts of low-glycemic fruits. Would you like some specific meal suggestions?'
          },
          {
            role: 'user',
            content: 'Yes, what would be a good breakfast option?'
          },
          {
            role: 'assistant',
            content: 'Great question! Some diabetes-friendly breakfast options include: Greek yogurt with berries and a sprinkle of nuts; a vegetable omelet with a slice of whole grain toast; overnight oats made with steel-cut oats, chia seeds, and cinnamon; or a protein smoothie with spinach, unsweetened almond milk, and a small amount of berries. Remember to monitor your blood sugar to see how different foods affect you personally.'
          }
        ]
      },
      {
        title: 'Blood Pressure Concerns',
        messages: [
          {
            role: 'user',
            content: 'My blood pressure reading was 145/95. Is that concerning?'
          },
          {
            role: 'assistant',
            content: 'A blood pressure reading of 145/95 is considered stage 2 hypertension (high blood pressure). Normal blood pressure is typically around 120/80 or lower. Consistently elevated blood pressure can increase your risk of heart disease and stroke. I recommend discussing this with your healthcare provider, who may suggest lifestyle changes or medication. Would you like some tips for naturally lowering blood pressure?'
          },
          {
            role: 'user',
            content: 'Yes, what lifestyle changes can help lower blood pressure?'
          },
          {
            role: 'assistant',
            content: 'Several lifestyle changes can help lower blood pressure: 1) Reduce sodium intake (aim for less than 2,300mg daily), 2) Follow the DASH diet (rich in fruits, vegetables, whole grains, and low-fat dairy), 3) Regular physical activity (aim for 150 minutes per week), 4) Maintain a healthy weight, 5) Limit alcohol consumption, 6) Quit smoking, 7) Manage stress through meditation, deep breathing, or yoga, 8) Ensure adequate sleep. It\'s important to monitor your blood pressure regularly and continue working with your healthcare provider.'
          }
        ]
      }
    ];
    
    for (const patient of patients) {
      const numConversations = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numConversations; i++) {
        const templateIndex = Math.floor(Math.random() * sampleConversations.length);
        const template = sampleConversations[templateIndex];
        
        const baseTime = new Date();
        baseTime.setDate(baseTime.getDate() - Math.floor(Math.random() * 30));
        
        const messages = template.messages.map((msg, index) => {
          const msgTime = new Date(baseTime);
          msgTime.setMinutes(baseTime.getMinutes() + (index * 2));
          
          return {
            role: msg.role,
            content: msg.content,
            timestamp: msgTime
          };
        });
        
        const conversation = new Conversation({
          userId: patient._id,
          title: template.title,
          messages,
          createdAt: messages[0].timestamp,
          updatedAt: messages[messages.length - 1].timestamp
        });
        
        await conversation.save();
        conversations.push(conversation);
      }
    }
    
    console.log(`Seeded ${conversations.length} conversations`);
    return conversations;
  } catch (error) {
    console.error('Error seeding conversations:', error.message);
    throw error;
  }
}

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to the database');
    
    const seededHospitals = await seedHospitals();
    const { admin, doctors, patients } = await seedUsers(seededHospitals);
    const appointments = await seedAppointments(doctors, patients, seededHospitals);
    const healthConditions = await seedHealthConditions(patients);
    const rfidCards = await seedRFIDCards(patients, admin);
    const conversations = await seedConversations(patients);
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--all') {
  seedDatabase();
} else {
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
      
      if (args.includes('--rfid')) {
        const patients = await User.find({ role: 'patient' });
        const admin = await User.findOne({ role: 'admin' });
        
        if (patients.length === 0 || !admin) {
          console.log('No patients or admin found. Please seed users first or use --all');
        } else {
          await seedRFIDCards(patients, admin);
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