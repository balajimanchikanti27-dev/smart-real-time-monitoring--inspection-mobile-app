import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Hardcoded for the script to avoid Vite env dependencies
const firebaseConfig = {
  apiKey: "AIzaSyA2MxXhnZYW__l_ngEQjsWApozx_h6mACk",
  authDomain: "nirikshan-app-8e1a0.firebaseapp.com",
  projectId: "nirikshan-app-8e1a0",
  storageBucket: "nirikshan-app-8e1a0.firebasestorage.app",
  messagingSenderId: "372761014394",
  appId: "1:372761014394:web:a37b6ec5cc2e81e5608bc3",
  measurementId: "G-X6TJM1CKXL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Data extracted from mockData.ts
const demoOrganizations = [
  { id: 'GOV001', organizationName: 'National Institute of Social Defence', organizationType: 'GOVERNMENT_INSTITUTION', state: 'Delhi', district: 'New Delhi' },
  { id: 'GOV002', organizationName: 'National Scheduled Castes Finance and Development Corporation', organizationType: 'CORPORATION', state: 'Delhi', district: 'New Delhi' },
  { id: 'NGO001', organizationName: 'Sahyog Social Development Foundation', organizationType: 'NGO', state: 'Andhra Pradesh', district: 'Guntur' },
  { id: 'NGO002', organizationName: 'Jan Seva Welfare Association', organizationType: 'NGO', state: 'Andhra Pradesh', district: 'Vijayawada' }
];

const demoInspectors = [
  { inspectorId: 'INS001', name: 'Arun Kumar', employeeCode: 'EMP-001', designation: 'Senior Inspector', state: 'Delhi', district: 'New Delhi', availabilityStatus: 'AVAILABLE' },
  { inspectorId: 'INS002', name: 'Priya Sharma', employeeCode: 'EMP-002', designation: 'Field Officer', state: 'Karnataka', district: 'Bengaluru Urban', availabilityStatus: 'AVAILABLE' }
];

const demoProjects = [
  { projectId: 'PRJ001', projectName: 'Community Social Support Centre', organizationId: 'GOV001', projectType: 'INFRASTRUCTURE', projectStatus: 'ACTIVE' },
  { projectId: 'PRJ002', projectName: 'Senior Citizen Assistance Centre', organizationId: 'NGO004', projectType: 'SERVICES', projectStatus: 'ACTIVE' }
];

async function seedData() {
  console.log('Starting data seed...');
  
  try {
    console.log('Authenticating as admin...');
    await signInWithEmailAndPassword(auth, 'admin@mosje.gov.in', 'Admin@123');
    
    console.log('Seeding organizations...');
    for (const org of demoOrganizations) {
      await setDoc(doc(db, 'organizations', org.id), org);
      // Also split them into ngos and institutions collections for easier querying if needed
      if (org.organizationType === 'NGO') {
        await setDoc(doc(db, 'ngos', org.id), org);
      } else {
        await setDoc(doc(db, 'institutions', org.id), org);
      }
    }

    console.log('Seeding inspectors...');
    for (const ins of demoInspectors) {
      await setDoc(doc(db, 'inspectors', ins.inspectorId), ins);
    }

    console.log('Seeding projects...');
    for (const prj of demoProjects) {
      await setDoc(doc(db, 'projects', prj.projectId), prj);
    }

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
