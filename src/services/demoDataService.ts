import { collection, doc, writeBatch, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { Institution, Organization, Project } from '../types';
import { createAuditLog } from './auditService';

// Ensure user is super admin
const verifySuperAdmin = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Unauthenticated');
  
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists() || userDoc.data()?.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Only SUPER_ADMIN can manage demo data');
  }
};

export const seedDemoData = async () => {
  await verifySuperAdmin();
  
  const batch = writeBatch(db);
  const now = new Date().toISOString();

  const demoInstitutions: Omit<Institution, 'id'>[] = [
    { name: 'Demo Tech Institute', type: 'UNIVERSITY', state: 'Delhi', district: 'New Delhi', status: 'ACTIVE', address: '123 Edu Road', contactEmail: 'contact@demotech.edu', contactPhone: '111-222-3333', contactName: 'Admin', description: 'Demo', registrationNumber: '123', createdBy: 'system', updatedBy: 'system', createdAt: now, updatedAt: now, isDemo: true },
    { name: 'Demo Medical College', type: 'COLLEGE', state: 'Maharashtra', district: 'Mumbai', status: 'ACTIVE', address: '456 Health St', contactEmail: 'info@demomed.edu', contactPhone: '222-333-4444', contactName: 'Admin', description: 'Demo', registrationNumber: '124', createdBy: 'system', updatedBy: 'system', createdAt: now, updatedAt: now, isDemo: true },
    { name: 'Demo Research Center', type: 'RESEARCH_CENTER', state: 'Karnataka', district: 'Bangalore', status: 'UNDER_REVIEW', address: '789 Science Blvd', contactEmail: 'research@democenter.org', contactPhone: '333-444-5555', contactName: 'Admin', description: 'Demo', registrationNumber: '125', createdBy: 'system', updatedBy: 'system', createdAt: now, updatedAt: now, isDemo: true }
  ];

  const demoNGOs: Omit<Organization, 'id'>[] = [
    { organizationName: 'Demo Care Foundation', organizationType: 'NGO', registrationNumber: 'REG-DEMO-1', state: 'Gujarat', district: 'Ahmedabad', status: 'ACTIVE', address: '12 Care Lane', email: 'hello@democare.org', phone: '444-555-6666', establishedYear: 2012, pincode: '123456', projectIds: [], schemeIds: [], previousViolations: 0, inspectionDelayDays: 0, complaintsCount: 0, cctvAnomalies: 0, financialIrregularityFlags: 0, complianceScore: 100, riskScore: 0, riskLevel: 'LOW', dataSourceType: 'DEMO', createdAt: now, updatedAt: now, isDemo: true } as unknown as Omit<Organization, 'id'>
  ];

  const demoProjects: Omit<Project, 'id'>[] = [
    { projectId: 'DEMO-PROJ-1', projectName: 'Demo Health Drive 2026', schemeId: 'SCHEME-DEMO', organizationId: 'ORG-DEMO-1', projectType: 'HEALTH', projectStatus: 'ACTIVE', startDate: now, endDate: '2027-01-01', state: 'Gujarat', district: 'Ahmedabad', budget: 5000000, grantAmount: 5000000, targetBeneficiaries: 1000, actualBeneficiaries: 0, description: 'Demo', riskScore: 0, dataSourceType: 'DEMO', createdAt: now, updatedAt: now, isDemo: true } as unknown as Omit<Project, 'id'>
  ];

  // Add Institutions
  demoInstitutions.forEach(inst => {
    const docRef = doc(collection(db, 'institutions'));
    batch.set(docRef, { ...inst, id: docRef.id });
  });

  // Add NGOs
  demoNGOs.forEach(ngo => {
    const docRef = doc(collection(db, 'ngos'));
    batch.set(docRef, { ...ngo, id: docRef.id });
  });

  // Add Projects
  demoProjects.forEach(proj => {
    const docRef = doc(collection(db, 'projects'));
    batch.set(docRef, { ...proj, id: docRef.id });
  });

  await batch.commit();

  await createAuditLog('CREATE', 'system', 'seed_demo_data', 'Seeded fictional demo institutions, NGOs, and projects safely');
};

export const removeDemoData = async () => {
  await verifySuperAdmin();
  
  const collectionsToClean = ['institutions', 'ngos', 'projects'];
  let totalDeleted = 0;

  for (const colName of collectionsToClean) {
    const q = query(collection(db, colName), where('isDemo', '==', true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) continue;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
      totalDeleted++;
    });

    await batch.commit();
  }

  await createAuditLog('DELETE', 'system', 'remove_demo_data', `Safely removed ${totalDeleted} demo records from database`);
};
