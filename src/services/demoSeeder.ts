import { demoOrganizations, demoProjects } from './mockData';

// Generate completely fictional organizations that strictly adhere to the no-fake-personal-info rule
const fictionalInstitutions = [
  {
    id: 'DEMO-INST-001',
    organizationName: 'Apex Community Centre',
    organizationType: 'GOVERNMENT_INSTITUTION',
    state: 'Delhi',
    district: 'New Delhi',
    schemeIds: ['SCHEME001'],
    projectIds: [],
    address: 'Sector 4, New Delhi',
    pincode: '110001',
    latitude: 28.6139,
    longitude: 77.2090,
    phone: 'N/A', // No fake numbers
    email: 'N/A', // No fake emails
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 10,
    dataSourceType: 'DEMO',
    isDemo: true, // Explicit tag per requirements
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 0,
    inspectionDelayDays: 0,
    complaintsCount: 0,
    cctvAnomalies: 0,
    financialIrregularityFlags: 0,
    complianceScore: 90
  },
  {
    id: 'DEMO-INST-002',
    organizationName: 'Sunrise Welfare Institute',
    organizationType: 'GOVERNMENT_INSTITUTION',
    state: 'Maharashtra',
    district: 'Mumbai',
    schemeIds: ['SCHEME002'],
    projectIds: [],
    address: 'Andheri East, Mumbai',
    pincode: '400069',
    latitude: 19.1136,
    longitude: 72.8697,
    phone: 'N/A',
    email: 'N/A',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    riskScore: 40,
    dataSourceType: 'DEMO',
    isDemo: true,
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 0,
    inspectionDelayDays: 2,
    complaintsCount: 0,
    cctvAnomalies: 0,
    financialIrregularityFlags: 0,
    complianceScore: 65
  },
  {
    id: 'DEMO-INST-003',
    organizationName: 'Northern Horizon Development Board',
    organizationType: 'BOARD',
    state: 'Punjab',
    district: 'Chandigarh',
    schemeIds: ['SCHEME003'],
    projectIds: [],
    address: 'Sector 17, Chandigarh',
    pincode: '160017',
    latitude: 30.7333,
    longitude: 76.7794,
    phone: 'N/A',
    email: 'N/A',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 15,
    dataSourceType: 'DEMO',
    isDemo: true,
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 0,
    inspectionDelayDays: 0,
    complaintsCount: 0,
    cctvAnomalies: 0,
    financialIrregularityFlags: 0,
    complianceScore: 85
  }
];

const fictionalNGOs = [
  {
    id: 'DEMO-NGO-001',
    organizationName: 'Global Care Foundation',
    organizationType: 'NGO',
    state: 'Karnataka',
    district: 'Bengaluru',
    schemeIds: ['SCHEME004'],
    projectIds: [],
    address: 'Whitefield, Bengaluru',
    pincode: '560066',
    latitude: 12.9698,
    longitude: 77.7499,
    phone: 'N/A',
    email: 'N/A',
    status: 'ACTIVE',
    riskLevel: 'LOW',
    riskScore: 20,
    dataSourceType: 'DEMO',
    isDemo: true,
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 0,
    inspectionDelayDays: 0,
    complaintsCount: 0,
    cctvAnomalies: 0,
    financialIrregularityFlags: 0,
    complianceScore: 88
  },
  {
    id: 'DEMO-NGO-002',
    organizationName: 'Hope Initiative Society',
    organizationType: 'NGO',
    state: 'Tamil Nadu',
    district: 'Chennai',
    schemeIds: ['SCHEME005'],
    projectIds: [],
    address: 'T Nagar, Chennai',
    pincode: '600017',
    latitude: 13.0418,
    longitude: 80.2341,
    phone: 'N/A',
    email: 'N/A',
    status: 'ACTIVE',
    riskLevel: 'HIGH',
    riskScore: 75,
    dataSourceType: 'DEMO',
    isDemo: true,
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 2,
    inspectionDelayDays: 14,
    complaintsCount: 1,
    cctvAnomalies: 1,
    financialIrregularityFlags: 0,
    complianceScore: 45
  },
  {
    id: 'DEMO-NGO-003',
    organizationName: 'Bright Future Trust',
    organizationType: 'NGO',
    state: 'Gujarat',
    district: 'Ahmedabad',
    schemeIds: ['SCHEME006'],
    projectIds: [],
    address: 'Navrangpura, Ahmedabad',
    pincode: '380009',
    latitude: 23.0365,
    longitude: 72.5611,
    phone: 'N/A',
    email: 'N/A',
    status: 'ACTIVE',
    riskLevel: 'MEDIUM',
    riskScore: 35,
    dataSourceType: 'DEMO',
    isDemo: true,
    lastVerifiedAt: new Date().toISOString(),
    previousViolations: 0,
    inspectionDelayDays: 5,
    complaintsCount: 0,
    cctvAnomalies: 0,
    financialIrregularityFlags: 0,
    complianceScore: 72
  }
];

const fictionalProjects = [
  {
    projectId: 'DEMO-PRJ-001',
    projectName: 'Apex Infrastructure Expansion',
    organizationId: 'DEMO-INST-001',
    schemeId: 'SCHEME001',
    projectType: 'INFRASTRUCTURE',
    description: 'Expanding the main facility to accommodate more beneficiaries.',
    targetBeneficiaries: 500,
    actualBeneficiaries: 0,
    budget: 10000000,
    grantAmount: 8000000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    state: 'Delhi',
    district: 'New Delhi',
    projectStatus: 'ACTIVE',
    riskScore: 10,
    dataSourceType: 'DEMO',
    isDemo: true
  },
  {
    projectId: 'DEMO-PRJ-002',
    projectName: 'Global Care Skill Training',
    organizationId: 'DEMO-NGO-001',
    schemeId: 'SCHEME004',
    projectType: 'TRAINING',
    description: 'Providing vocational training to underprivileged youth.',
    targetBeneficiaries: 200,
    actualBeneficiaries: 50,
    budget: 2000000,
    grantAmount: 2000000,
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    state: 'Karnataka',
    district: 'Bengaluru',
    projectStatus: 'ACTIVE',
    riskScore: 15,
    dataSourceType: 'DEMO',
    isDemo: true
  },
  {
    projectId: 'DEMO-PRJ-003',
    projectName: 'Hope Relief Services',
    organizationId: 'DEMO-NGO-002',
    schemeId: 'SCHEME005',
    projectType: 'SERVICES',
    description: 'Providing essential relief services and supplies.',
    targetBeneficiaries: 1000,
    actualBeneficiaries: 800,
    budget: 5000000,
    grantAmount: 4500000,
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    state: 'Tamil Nadu',
    district: 'Chennai',
    projectStatus: 'ACTIVE',
    riskScore: 70,
    dataSourceType: 'DEMO',
    isDemo: true
  }
];

export const seedDemoData = () => {
  // Prevent double seeding
  if (demoOrganizations.some(o => (o as any).isDemo === true)) {
    return { success: false, message: 'Demo data is already seeded.' };
  }

  // Push to arrays in memory
  fictionalInstitutions.forEach(inst => demoOrganizations.push(inst as any));
  fictionalNGOs.forEach(ngo => demoOrganizations.push(ngo as any));
  fictionalProjects.forEach(proj => demoProjects.push(proj as any));

  return { success: true, message: 'Successfully seeded completely fictional demo records.' };
};

export const removeDemoData = () => {
  // Find indices to remove
  let removedOrgs = 0;
  let removedProjects = 0;

  for (let i = demoOrganizations.length - 1; i >= 0; i--) {
    if ((demoOrganizations[i] as any).isDemo === true) {
      demoOrganizations.splice(i, 1);
      removedOrgs++;
    }
  }

  for (let i = demoProjects.length - 1; i >= 0; i--) {
    if ((demoProjects[i] as any).isDemo === true) {
      demoProjects.splice(i, 1);
      removedProjects++;
    }
  }

  if (removedOrgs === 0 && removedProjects === 0) {
    return { success: false, message: 'No demo data found to remove.' };
  }

  return { success: true, message: `Successfully removed ${removedOrgs} organizations and ${removedProjects} projects.` };
};
