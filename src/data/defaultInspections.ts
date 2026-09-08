import type { Inspection } from '../types';

export const defaultInspections: Inspection[] = [
  // 1. NIEPVD Dehradun - Completed Routine
  {
    inspectionId: 'INSP-2024-001',
    type: 'ROUTINE',
    organizationId: 'GOV001',
    projectId: 'PRJ001',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-02-10T09:00:00Z',
    scheduledDate: '2024-02-25T10:00:00Z',
    startedAt: '2024-02-25T10:05:00Z',
    completedAt: '2024-02-25T14:45:00Z',
    riskLevelFound: 'LOW',
    overallScore: 94,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6139, longitude: 77.2090, accuracy: 8 },
    summary: 'Annual comprehensive audit of National Institute of Social Defence campus. Training modules, beneficiary stipend register, and barrier-free access infrastructure verified 100% compliant.',
    schemeName: 'Social Defence & Senior Citizen Welfare',
    subScores: { infrastructure: 96, staffing: 94, beneficiaries: 95, records: 92, safety: 91 },
    findingsList: [
      { id: 'FND-101', title: 'Tactile directional flooring worn near Library exit', severity: 'LOW', category: 'Infrastructure', actionRequired: 'Replace polyurethane tactile studs in corridor B within 30 days.', status: 'RESOLVED' }
    ],
    evidencePhotos: [
      { id: 'EV-101', title: 'Main Administration Block & Notice Board', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80', timestamp: '2024-02-25T10:15:00Z', geotag: { lat: 28.6139, lng: 77.2090 } },
      { id: 'EV-102', title: 'Assistive Tech Computer Lab Terminals', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80', timestamp: '2024-02-25T11:30:00Z', geotag: { lat: 28.6140, lng: 77.2091 } }
    ],
    dataSourceType: 'DEMO'
  },

  // 2. Akshaya Patra Bengaluru - Routine Completed
  {
    inspectionId: 'INSP-2024-002',
    type: 'ROUTINE',
    organizationId: 'NGO001',
    projectId: 'PRJ015',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-03-01T09:30:00Z',
    scheduledDate: '2024-03-12T07:00:00Z',
    startedAt: '2024-03-12T07:05:00Z',
    completedAt: '2024-03-12T12:30:00Z',
    riskLevelFound: 'LOW',
    overallScore: 97,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 13.0068, longitude: 77.5511, accuracy: 6 },
    summary: 'Automated mega-kitchen inspection for student mid-day meal operations. Steam cauldrons, microbiological food testing laboratory, and insulated delivery fleet found in exemplary hygiene condition.',
    schemeName: 'PM-POSHAN & Educational Nutrition',
    subScores: { infrastructure: 98, staffing: 96, beneficiaries: 99, records: 96, safety: 98 },
    findingsList: [],
    evidencePhotos: [
      { id: 'EV-201', title: 'Automated Roti Making & Rice Cooking Units', url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80', timestamp: '2024-03-12T07:45:00Z', geotag: { lat: 13.0068, lng: 77.5511 } }
    ],
    dataSourceType: 'DEMO'
  },

  // 3. NSKFDC Delhi - In Progress Routine
  {
    inspectionId: 'INSP-2024-003',
    type: 'ROUTINE',
    organizationId: 'GOV004',
    projectId: 'PRJ006',
    inspectorId: 'INS001',
    status: 'IN_PROGRESS',
    createdAt: '2024-04-01T08:00:00Z',
    scheduledDate: '2024-04-10T10:00:00Z',
    startedAt: '2024-04-10T10:12:00Z',
    riskLevelFound: 'MEDIUM',
    overallScore: 78,
    issuesFound: 3,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6250, longitude: 77.2150, accuracy: 12 },
    summary: 'On-site audit of mechanised sanitation equipment distribution (NAMASTE Scheme). Hydro-jetting and suction machine physical verification underway.',
    schemeName: 'NAMASTE Mechanized Sanitation',
    subScores: { infrastructure: 82, staffing: 75, beneficiaries: 80, records: 76, safety: 79 },
    findingsList: [
      { id: 'FND-301', title: 'Delay in micro-loan disbursement documentation', severity: 'MEDIUM', category: 'Records', actionRequired: 'Digitize pending 28 physical loan agreements within 10 days.', status: 'IN_PROGRESS' },
      { id: 'FND-302', title: 'Safety harness buffer stock low in regional warehouse', severity: 'MEDIUM', category: 'Safety', actionRequired: 'Procure 50 standard CE-marked safety harnesses.', status: 'OPEN' }
    ],
    dataSourceType: 'DEMO'
  },

  // 4. Navjeevan Rehab (NGO003) - Surprise Inspection (Critical Failure)
  {
    inspectionId: 'INSP-2024-004',
    type: 'SURPRISE',
    organizationId: 'NGO003',
    projectId: 'PRJ003',
    inspectorId: 'INS004',
    status: 'COMPLETED',
    createdAt: '2024-01-15T11:00:00Z',
    scheduledDate: '2024-01-18T14:00:00Z',
    startedAt: '2024-01-18T14:15:00Z',
    completedAt: '2024-01-18T19:00:00Z',
    riskLevelFound: 'CRITICAL',
    overallScore: 42,
    issuesFound: 11,
    locationMatched: false,
    gpsCoordinates: { latitude: 17.3850, longitude: 78.4867, accuracy: 48 },
    summary: 'UNANNOUNCED SURPRISE INSPECTION: Triggered by 6+ hours CCTV outage and complaint CMP-001. Multiple severe infractions detected: unauthorized resident capacity, expired prescription drugs, absent medical officer.',
    schemeName: 'NAPDDR Substance De-Addiction',
    subScores: { infrastructure: 48, staffing: 35, beneficiaries: 40, records: 42, safety: 45 },
    findingsList: [
      { id: 'FND-401', title: 'Resident Doctor Absent for 3 Consecutive Days', severity: 'CRITICAL', category: 'Staffing', actionRequired: 'Immediate deployment of registered medical practitioner with MBBS credential.', status: 'OPEN' },
      { id: 'FND-402', title: 'Expired Psychotropic Medication in Dispensary', severity: 'CRITICAL', category: 'Safety', actionRequired: 'Safely confiscate expired stock and produce pharmacy disposal manifest.', status: 'OPEN' },
      { id: 'FND-403', title: 'Main Perimeter CCTV Camera Intentionally Unplugged', severity: 'HIGH', category: 'Infrastructure', actionRequired: 'Restore continuous RTSP feed to NIRIKSHAN cloud gateway.', status: 'RESOLVED' }
    ],
    evidencePhotos: [
      { id: 'EV-401', title: 'Dispensary Expired Batch Photo', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80', timestamp: '2024-01-18T15:20:00Z', geotag: { lat: 17.3850, lng: 78.4867 } }
    ],
    dataSourceType: 'DEMO'
  },

  // 5. Smile Foundation Delhi - Routine Completed
  {
    inspectionId: 'INSP-2024-005',
    type: 'ROUTINE',
    organizationId: 'NGO002',
    projectId: 'PRJ011',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-03-20T10:00:00Z',
    scheduledDate: '2024-04-05T09:30:00Z',
    startedAt: '2024-04-05T09:35:00Z',
    completedAt: '2024-04-05T15:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 91,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5355, longitude: 77.2639, accuracy: 9 },
    summary: 'Mission Education center inspection at Okhla. Digital smart classrooms, student biometric attendance, and mid-day nutritional snacks verified compliant.',
    schemeName: 'Mission Education & Social Empowerment',
    subScores: { infrastructure: 92, staffing: 90, beneficiaries: 93, records: 91, safety: 89 },
    findingsList: [
      { id: 'FND-501', title: 'First Aid box contents need replenishment in Room 4', severity: 'LOW', category: 'Safety', actionRequired: 'Restock antiseptic lotions and sterile bandages.', status: 'RESOLVED' }
    ],
    dataSourceType: 'DEMO'
  },

  // 6. HelpAge India Delhi - Surprise Inspection
  {
    inspectionId: 'INSP-2024-006',
    type: 'SURPRISE',
    organizationId: 'NGO004',
    projectId: 'PRJ002',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-02-18T14:00:00Z',
    scheduledDate: '2024-02-20T18:30:00Z',
    startedAt: '2024-02-20T18:40:00Z',
    completedAt: '2024-02-20T22:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 89,
    issuesFound: 2,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5413, longitude: 77.1824, accuracy: 10 },
    summary: 'Night surprise audit of senior citizen care facility. Dinner nutritional standards, on-call nursing staff, and emergency medical call buttons in elderly resident rooms verified active.',
    schemeName: 'Integrated Programme for Senior Citizens (IPSrC)',
    subScores: { infrastructure: 90, staffing: 88, beneficiaries: 92, records: 87, safety: 89 },
    findingsList: [
      { id: 'FND-601', title: 'Resident call bell cord detached in Bed 12', severity: 'LOW', category: 'Infrastructure', actionRequired: 'Fix nurse bell connection.', status: 'RESOLVED' }
    ],
    dataSourceType: 'DEMO'
  },

  // 7. Pratham Mumbai - Routine Completed
  {
    inspectionId: 'INSP-2024-007',
    type: 'ROUTINE',
    organizationId: 'NGO005',
    projectId: 'PRJ008',
    inspectorId: 'INS003',
    status: 'COMPLETED',
    createdAt: '2024-03-10T10:00:00Z',
    scheduledDate: '2024-03-24T10:00:00Z',
    startedAt: '2024-03-24T10:10:00Z',
    completedAt: '2024-03-24T16:00:00Z',
    riskLevelFound: 'MEDIUM',
    overallScore: 74,
    issuesFound: 4,
    locationMatched: true,
    gpsCoordinates: { latitude: 19.0195, longitude: 72.8436, accuracy: 14 },
    summary: 'Remedial education and youth digital literacy project review. Tablet software learning metrics satisfactory. Learning center fire exit partially blocked by storage boxes.',
    schemeName: 'Youth Digital Skills & Education',
    subScores: { infrastructure: 72, staffing: 80, beneficiaries: 82, records: 75, safety: 68 },
    findingsList: [
      { id: 'FND-701', title: 'Fire exit corridor obstructed with paper cartons', severity: 'HIGH', category: 'Safety', actionRequired: 'Clear corridor immediately and ensure unhindered evacuation route.', status: 'RESOLVED' }
    ],
    dataSourceType: 'DEMO'
  },

  // 8. Goonj Sarita Vihar - Follow-Up Completed
  {
    inspectionId: 'INSP-2024-008',
    type: 'FOLLOW_UP',
    organizationId: 'NGO003',
    projectId: 'PRJ003',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-04-12T09:00:00Z',
    scheduledDate: '2024-04-22T11:00:00Z',
    startedAt: '2024-04-22T11:05:00Z',
    completedAt: '2024-04-22T14:30:00Z',
    riskLevelFound: 'LOW',
    overallScore: 92,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5303, longitude: 77.2889, accuracy: 7 },
    summary: 'Follow-up compliance verification after corrective notice. Rural kit packaging facility and female artisan dignity kit assembly verified 100% compliant with labor standards.',
    schemeName: 'Community Livelihood & Empowerment',
    subScores: { infrastructure: 94, staffing: 92, beneficiaries: 95, records: 90, safety: 91 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 9. NBCFDC New Delhi - Scheduled Upcoming
  {
    inspectionId: 'INSP-2024-009',
    type: 'ROUTINE',
    organizationId: 'GOV003',
    projectId: 'PRJ005',
    inspectorId: 'INS001',
    status: 'SCHEDULED',
    createdAt: '2024-05-01T09:00:00Z',
    scheduledDate: '2024-09-18T10:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 0,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6150, longitude: 77.2050, accuracy: 10 },
    summary: 'Upcoming scheduled statutory inspection of OBC Entrepreneurship Credit Guarantee facility and digital loan sanction pipeline.',
    schemeName: 'PM-DAKSH & OBC Concessional Finance',
    subScores: { infrastructure: 0, staffing: 0, beneficiaries: 0, records: 0, safety: 0 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 10. Navjyoti India Foundation - Overdue High Risk
  {
    inspectionId: 'INSP-2024-010',
    type: 'RISK_BASED',
    organizationId: 'NGO010',
    projectId: 'PRJ017',
    inspectorId: 'INS012',
    status: 'OVERDUE',
    createdAt: '2024-03-05T08:00:00Z',
    scheduledDate: '2024-04-20T10:00:00Z',
    riskLevelFound: 'HIGH',
    overallScore: 38,
    issuesFound: 7,
    locationMatched: false,
    gpsCoordinates: { latitude: 28.4116, longitude: 77.1009, accuracy: 35 },
    summary: 'OVERDUE URGENT AUDIT: Triggered by financial discrepancy alert and recurring beneficiary grievance regarding delayed stipends. Assigned officer delayed on transit.',
    schemeName: 'Community Skill Development & Literacy',
    subScores: { infrastructure: 50, staffing: 40, beneficiaries: 35, records: 32, safety: 55 },
    findingsList: [
      { id: 'FND-1001', title: 'Stipend disbursement bank reconciliations missing for Q1', severity: 'HIGH', category: 'Finance', actionRequired: 'Furnish complete bank statement reconciliation with DBT vouchers.', status: 'OPEN' }
    ],
    dataSourceType: 'DEMO'
  },

  // 11. NSFDC Delhi - Completed Routine
  {
    inspectionId: 'INSP-2024-011',
    type: 'ROUTINE',
    organizationId: 'GOV002',
    projectId: 'PRJ004',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-01-20T09:00:00Z',
    scheduledDate: '2024-02-05T10:00:00Z',
    startedAt: '2024-02-05T10:15:00Z',
    completedAt: '2024-02-05T15:30:00Z',
    riskLevelFound: 'LOW',
    overallScore: 88,
    issuesFound: 2,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6200, longitude: 77.2100, accuracy: 8 },
    summary: 'Skill development training center for SC beneficiaries audited. Digital bio-attendance records cross-checked with biometric backend.',
    schemeName: 'SC Skill Development Programme',
    subScores: { infrastructure: 90, staffing: 88, beneficiaries: 91, records: 85, safety: 88 },
    findingsList: [
      { id: 'FND-1101', title: 'Backup UPS batteries require routine servicing', severity: 'LOW', category: 'Infrastructure', actionRequired: 'Annual UPS battery maintenance.', status: 'RESOLVED' }
    ],
    dataSourceType: 'DEMO'
  },

  // 12. Snehalaya Ahmednagar - Routine Completed
  {
    inspectionId: 'INSP-2024-012',
    type: 'ROUTINE',
    organizationId: 'NGO009',
    projectId: 'PRJ009',
    inspectorId: 'INS003',
    status: 'COMPLETED',
    createdAt: '2024-02-14T10:00:00Z',
    scheduledDate: '2024-02-28T09:30:00Z',
    startedAt: '2024-02-28T09:40:00Z',
    completedAt: '2024-02-28T14:45:00Z',
    riskLevelFound: 'LOW',
    overallScore: 86,
    issuesFound: 2,
    locationMatched: true,
    gpsCoordinates: { latitude: 19.1417, longitude: 74.7431, accuracy: 11 },
    summary: 'Shelter home and vocational center inspection. Child protection protocols, medical checkup registers, and nutrition logs verified in good order.',
    schemeName: 'Social Awareness & De-Addiction Support',
    subScores: { infrastructure: 88, staffing: 85, beneficiaries: 89, records: 84, safety: 86 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 13. Dr. Ambedkar Foundation - Routine Completed
  {
    inspectionId: 'INSP-2024-013',
    type: 'ROUTINE',
    organizationId: 'GOV005',
    projectId: 'PRJ010',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-03-01T09:00:00Z',
    scheduledDate: '2024-03-14T10:00:00Z',
    startedAt: '2024-03-14T10:05:00Z',
    completedAt: '2024-03-14T13:45:00Z',
    riskLevelFound: 'LOW',
    overallScore: 95,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6300, longitude: 77.2200, accuracy: 7 },
    summary: 'National scholarship disbursal and research fellowship monitoring. Records completely digitized on MoSJE central registry.',
    schemeName: 'Dr. Ambedkar National Merit Awards',
    subScores: { infrastructure: 95, staffing: 94, beneficiaries: 97, records: 96, safety: 93 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 14. Oxfam India Delhi - Complaint Based Completed
  {
    inspectionId: 'INSP-2024-014',
    type: 'COMPLAINT_BASED',
    organizationId: 'NGO008',
    projectId: 'PRJ007',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-01-25T11:30:00Z',
    scheduledDate: '2024-02-02T10:00:00Z',
    startedAt: '2024-02-02T10:15:00Z',
    completedAt: '2024-02-02T16:30:00Z',
    riskLevelFound: 'HIGH',
    overallScore: 58,
    issuesFound: 6,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5355, longitude: 77.2639, accuracy: 15 },
    summary: 'Complaint-triggered inspection regarding delays in field project completion and discrepancies in beneficiary lists. Substantial documentation gaps identified.',
    schemeName: 'Community Rehabilitation & Social Inclusion',
    subScores: { infrastructure: 70, staffing: 62, beneficiaries: 50, records: 48, safety: 72 },
    findingsList: [
      { id: 'FND-1401', title: 'Beneficiary contact details non-verifiable in 24 sample records', severity: 'HIGH', category: 'Beneficiaries', actionRequired: 'Submit physical identity verification with Aadhaar-linked phone numbers.', status: 'OPEN' }
    ],
    dataSourceType: 'DEMO'
  },

  // 15. Save the Children Gurugram - Routine Completed
  {
    inspectionId: 'INSP-2024-015',
    type: 'ROUTINE',
    organizationId: 'NGO006',
    projectId: 'PRJ016',
    inspectorId: 'INS012',
    status: 'COMPLETED',
    createdAt: '2024-02-22T09:00:00Z',
    scheduledDate: '2024-03-08T10:00:00Z',
    startedAt: '2024-03-08T10:10:00Z',
    completedAt: '2024-03-08T15:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 91,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.4503, longitude: 77.0620, accuracy: 9 },
    summary: 'Child health, emergency nutrition, and education assistance center inspected. Clean water filtration units and emergency kits verified.',
    schemeName: 'Child Welfare & Nutrition Support',
    subScores: { infrastructure: 92, staffing: 90, beneficiaries: 93, records: 91, safety: 90 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 16. Babu Jagjivan Ram Foundation - Routine Completed
  {
    inspectionId: 'INSP-2024-016',
    type: 'ROUTINE',
    organizationId: 'GOV006',
    projectId: 'PRJ014',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-03-15T09:00:00Z',
    scheduledDate: '2024-03-29T10:30:00Z',
    startedAt: '2024-03-29T10:35:00Z',
    completedAt: '2024-03-29T14:15:00Z',
    riskLevelFound: 'LOW',
    overallScore: 93,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6350, longitude: 77.2250, accuracy: 8 },
    summary: 'Leadership and youth social justice training workshop facilities verified. Student accommodation facilities adhere to national standards.',
    schemeName: 'Social Justice Youth Leadership',
    subScores: { infrastructure: 94, staffing: 92, beneficiaries: 94, records: 93, safety: 92 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 17. Kailash Satyarthi Foundation - Surprise Inspection
  {
    inspectionId: 'INSP-2024-017',
    type: 'SURPRISE',
    organizationId: 'NGO007',
    projectId: 'PRJ012',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-04-02T11:00:00Z',
    scheduledDate: '2024-04-04T13:00:00Z',
    startedAt: '2024-04-04T13:05:00Z',
    completedAt: '2024-04-04T17:30:00Z',
    riskLevelFound: 'LOW',
    overallScore: 95,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5452, longitude: 77.2711, accuracy: 7 },
    summary: 'Unannounced inspection of transit care home for rescued child laborers. Psychological counseling records, medical baseline tests, and child welfare committee intimations 100% compliant.',
    schemeName: 'Rehabilitation of Rescued Children',
    subScores: { infrastructure: 96, staffing: 95, beneficiaries: 97, records: 94, safety: 96 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 18. DNT Welfare Board - Scheduled Routine
  {
    inspectionId: 'INSP-2024-018',
    type: 'ROUTINE',
    organizationId: 'GOV007',
    projectId: 'PRJ018',
    inspectorId: 'INS008',
    status: 'SCHEDULED',
    createdAt: '2024-05-02T09:00:00Z',
    scheduledDate: '2024-09-22T10:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 0,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6400, longitude: 77.2300, accuracy: 10 },
    summary: 'Upcoming field verification of De-notified, Nomadic, and Semi-Nomadic Tribes community resource camps.',
    schemeName: 'SEED Scheme for DNTs',
    subScores: { infrastructure: 0, staffing: 0, beneficiaries: 0, records: 0, safety: 0 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 19. NCSC Delhi - Routine Completed
  {
    inspectionId: 'INSP-2024-019',
    type: 'ROUTINE',
    organizationId: 'GOV008',
    projectId: 'PRJ019',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-02-01T09:00:00Z',
    scheduledDate: '2024-02-16T10:00:00Z',
    startedAt: '2024-02-16T10:10:00Z',
    completedAt: '2024-02-16T14:30:00Z',
    riskLevelFound: 'LOW',
    overallScore: 94,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6450, longitude: 77.2350, accuracy: 8 },
    summary: 'Public grievance cell and constitutional safeguard monitoring wing inspected. Digital portal grievance turnaround average is under 14 days.',
    schemeName: 'Constitutional Safeguards for SCs',
    subScores: { infrastructure: 95, staffing: 93, beneficiaries: 96, records: 94, safety: 92 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 20. NCBC Delhi - Routine Completed
  {
    inspectionId: 'INSP-2024-020',
    type: 'ROUTINE',
    organizationId: 'GOV009',
    projectId: 'PRJ005',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-03-05T09:00:00Z',
    scheduledDate: '2024-03-18T10:00:00Z',
    startedAt: '2024-03-18T10:05:00Z',
    completedAt: '2024-03-18T14:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 92,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6500, longitude: 77.2400, accuracy: 9 },
    summary: 'National Commission for Backward Classes hearings records, citizen representation registers, and online grievance queue inspected.',
    schemeName: 'Backward Classes Welfare & Welfare Inquiries',
    subScores: { infrastructure: 92, staffing: 92, beneficiaries: 94, records: 92, safety: 90 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 21. NCSK Delhi - Risk Based Review
  {
    inspectionId: 'INSP-2024-021',
    type: 'RISK_BASED',
    organizationId: 'GOV010',
    projectId: 'PRJ006',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-03-12T09:00:00Z',
    scheduledDate: '2024-03-26T10:30:00Z',
    startedAt: '2024-03-26T10:40:00Z',
    completedAt: '2024-03-26T15:30:00Z',
    riskLevelFound: 'MEDIUM',
    overallScore: 76,
    issuesFound: 3,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.6550, longitude: 77.2450, accuracy: 11 },
    summary: 'Survey on manual scavenging rehabilitation rehabilitation funds. Minor delays in district coordination reports identified in two states.',
    schemeName: 'Sanitation Worker Welfare & Compensation Monitoring',
    subScores: { infrastructure: 80, staffing: 76, beneficiaries: 78, records: 72, safety: 78 },
    findingsList: [
      { id: 'FND-2101', title: 'District verification reports pending from 4 regional offices', severity: 'MEDIUM', category: 'Records', actionRequired: 'Issue circular to nodal officers for submission within 15 days.', status: 'IN_PROGRESS' }
    ],
    dataSourceType: 'DEMO'
  },

  // 22. Akshaya Patra Kitchen 2 - Routine Completed
  {
    inspectionId: 'INSP-2024-022',
    type: 'ROUTINE',
    organizationId: 'NGO001',
    projectId: 'PRJ020',
    inspectorId: 'INS002',
    status: 'COMPLETED',
    createdAt: '2024-02-15T09:00:00Z',
    scheduledDate: '2024-02-27T08:00:00Z',
    startedAt: '2024-02-27T08:10:00Z',
    completedAt: '2024-02-27T13:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 96,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 13.0068, longitude: 77.5511, accuracy: 7 },
    summary: 'Secondary meal distribution hub verified. Cold storage temperatures recorded at +3°C consistently. Delivery van GPS telemetry verified.',
    schemeName: 'School Nutrition & Food Safety',
    subScores: { infrastructure: 97, staffing: 95, beneficiaries: 98, records: 96, safety: 97 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 23. Smile Foundation Skill Hub - In Progress Routine
  {
    inspectionId: 'INSP-2024-023',
    type: 'ROUTINE',
    organizationId: 'NGO002',
    projectId: 'PRJ011',
    inspectorId: 'INS002',
    status: 'IN_PROGRESS',
    createdAt: '2024-04-05T09:00:00Z',
    scheduledDate: '2024-04-18T10:00:00Z',
    startedAt: '2024-04-18T10:15:00Z',
    riskLevelFound: 'LOW',
    overallScore: 89,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5355, longitude: 77.2639, accuracy: 10 },
    summary: 'Livelihood skill training center for underprivileged adolescents. Retail management and hospitality mock labs under active evaluation.',
    schemeName: 'STeP Skill Training for Youth',
    subScores: { infrastructure: 90, staffing: 88, beneficiaries: 92, records: 88, safety: 89 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 24. HelpAge India Mobile Unit - Routine Completed
  {
    inspectionId: 'INSP-2024-024',
    type: 'ROUTINE',
    organizationId: 'NGO004',
    projectId: 'PRJ002',
    inspectorId: 'INS001',
    status: 'COMPLETED',
    createdAt: '2024-03-22T09:00:00Z',
    scheduledDate: '2024-04-02T10:00:00Z',
    startedAt: '2024-04-02T10:15:00Z',
    completedAt: '2024-04-02T14:45:00Z',
    riskLevelFound: 'LOW',
    overallScore: 90,
    issuesFound: 1,
    locationMatched: true,
    gpsCoordinates: { latitude: 28.5413, longitude: 77.1824, accuracy: 8 },
    summary: 'Mobile Medical Unit (MMU) vehicle inspection. Doctor on duty, ECG machine calibration, and free chronic illness medicine supplies verified.',
    schemeName: 'Mobile Healthcare for Rural Elderly',
    subScores: { infrastructure: 91, staffing: 89, beneficiaries: 92, records: 88, safety: 90 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // 25. Pratham Pune Learning Hub - Scheduled
  {
    inspectionId: 'INSP-2024-025',
    type: 'ROUTINE',
    organizationId: 'NGO005',
    projectId: 'PRJ008',
    inspectorId: 'INS003',
    status: 'SCHEDULED',
    createdAt: '2024-05-04T09:00:00Z',
    scheduledDate: '2024-09-25T10:00:00Z',
    riskLevelFound: 'LOW',
    overallScore: 0,
    issuesFound: 0,
    locationMatched: true,
    gpsCoordinates: { latitude: 19.0195, longitude: 72.8436, accuracy: 12 },
    summary: 'Scheduled field evaluation of rural reading camps and primary school literacy assessments across Pune peri-urban districts.',
    schemeName: 'Read India Programme',
    subScores: { infrastructure: 0, staffing: 0, beneficiaries: 0, records: 0, safety: 0 },
    findingsList: [],
    dataSourceType: 'DEMO'
  },

  // Generate deterministic inspections 26 through 50 for full national coverage
  ...(() => {
    const list: Inspection[] = [];
    const orgs = [
      { id: 'GOV001', name: 'National Institute of Social Defence', lat: 28.6139, lng: 77.2090, proj: 'PRJ001', scheme: 'Social Defence & Senior Citizen Care' },
      { id: 'GOV002', name: 'National Scheduled Castes Finance & Dev Corp', lat: 28.6200, lng: 77.2100, proj: 'PRJ004', scheme: 'SC Micro-Credit & Entrepreneurship' },
      { id: 'GOV003', name: 'National Backward Classes Finance Corp', lat: 28.6150, lng: 77.2050, proj: 'PRJ005', scheme: 'PM-DAKSH Skill Development' },
      { id: 'GOV004', name: 'National Safai Karamcharis Finance Corp', lat: 28.6250, lng: 77.2150, proj: 'PRJ006', scheme: 'NAMASTE Sanitation Mechanization' },
      { id: 'GOV005', name: 'Dr. Ambedkar Foundation', lat: 28.6300, lng: 77.2200, proj: 'PRJ010', scheme: 'Ambedkar Social Justice Grants' },
      { id: 'NGO001', name: 'Akshaya Patra Foundation', lat: 13.0068, lng: 77.5511, proj: 'PRJ015', scheme: 'Nutrition & Mid-Day Meal Services' },
      { id: 'NGO002', name: 'Smile Foundation', lat: 28.5355, lng: 77.2639, proj: 'PRJ011', scheme: 'Mission Education & Child Healthcare' },
      { id: 'NGO003', name: 'Goonj', lat: 28.5303, lng: 77.2889, proj: 'PRJ003', scheme: 'Cloth for Work & Rural Livelihoods' },
      { id: 'NGO004', name: 'HelpAge India', lat: 28.5413, lng: 77.1824, proj: 'PRJ002', scheme: 'Integrated Care for Senior Citizens' },
      { id: 'NGO005', name: 'Pratham Education Foundation', lat: 19.0195, lng: 72.8436, proj: 'PRJ008', scheme: 'Remedial Learning & Literacy' },
      { id: 'NGO006', name: 'Save the Children India', lat: 28.4503, lng: 77.0620, proj: 'PRJ016', scheme: 'Child Protection & Inclusive Education' },
      { id: 'NGO007', name: 'Kailash Satyarthi Children\'s Foundation', lat: 28.5452, lng: 77.2711, proj: 'PRJ012', scheme: 'Rescue & Rehabilitation of Child Labour' },
      { id: 'NGO008', name: 'Oxfam India', lat: 28.5355, lng: 77.2639, proj: 'PRJ007', scheme: 'Disaster Relief & Community Rehabilitation' },
      { id: 'NGO009', name: 'Snehalaya', lat: 19.1417, lng: 74.7431, proj: 'PRJ009', scheme: 'Rehabilitation & Destitute Care' },
      { id: 'NGO010', name: 'Navjyoti India Foundation', lat: 28.4116, lng: 77.1009, proj: 'PRJ017', scheme: 'Community Literacy & Crime Prevention' }
    ];

    const inspectorIds = [
      'INS001', 'INS002', 'INS003', 'INS004', 'INS005', 
      'INS006', 'INS007', 'INS008', 'INS009', 'INS010', 
      'INS011', 'INS012', 'INS013', 'INS014', 'INS015'
    ];

    const types: ('ROUTINE' | 'SURPRISE' | 'RISK_BASED' | 'COMPLAINT_BASED' | 'FOLLOW_UP')[] = [
      'ROUTINE', 'SURPRISE', 'ROUTINE', 'RISK_BASED', 'ROUTINE', 
      'COMPLAINT_BASED', 'ROUTINE', 'FOLLOW_UP', 'SURPRISE', 'ROUTINE'
    ];

    const statuses: ('COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'OVERDUE')[] = [
      'COMPLETED', 'COMPLETED', 'COMPLETED', 'IN_PROGRESS', 'SCHEDULED', 'COMPLETED', 'OVERDUE', 'COMPLETED', 'SCHEDULED', 'COMPLETED'
    ];

    for (let i = 26; i <= 50; i++) {
      const org = orgs[i % orgs.length];
      const inspId = inspectorIds[i % inspectorIds.length];
      const type = types[i % types.length];
      const status = statuses[i % statuses.length];
      const isCritical = (i === 34 || i === 48);
      const isHigh = (i === 29 || i === 41);
      const risk = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : (i % 3 === 0 ? 'MEDIUM' : 'LOW');
      const score = status === 'SCHEDULED' ? 0 : isCritical ? 44 : isHigh ? 62 : risk === 'MEDIUM' ? 76 : 88 + (i % 10);
      const issues = status === 'SCHEDULED' ? 0 : isCritical ? 9 : isHigh ? 5 : risk === 'MEDIUM' ? 3 : 1;

      list.push({
        inspectionId: `INSP-2024-${i.toString().padStart(3, '0')}`,
        type,
        organizationId: org.id,
        projectId: org.proj,
        inspectorId: inspId,
        status,
        createdAt: new Date(1706745600000 + (i * 86400000 * 3)).toISOString(),
        scheduledDate: new Date(1707955200000 + (i * 86400000 * 3)).toISOString(),
        startedAt: status !== 'SCHEDULED' ? new Date(1707955200000 + (i * 86400000 * 3) + 3600000).toISOString() : undefined,
        completedAt: status === 'COMPLETED' ? new Date(1707955200000 + (i * 86400000 * 3) + 18000000).toISOString() : undefined,
        riskLevelFound: risk,
        overallScore: score,
        issuesFound: issues,
        locationMatched: !isCritical,
        gpsCoordinates: {
          latitude: org.lat + ((i % 5 - 2) * 0.001),
          longitude: org.lng + ((i % 5 - 2) * 0.001),
          accuracy: 8 + (i % 6)
        },
        summary: `Statutory field verification for ${org.name}. Monitoring compliance with ${org.scheme} guidelines and digital attendance records.`,
        schemeName: org.scheme,
        subScores: status === 'SCHEDULED' ? { infrastructure: 0, staffing: 0, beneficiaries: 0, records: 0, safety: 0 } : {
          infrastructure: Math.min(100, score + 2),
          staffing: Math.min(100, score - 1),
          beneficiaries: Math.min(100, score + 3),
          records: Math.min(100, score - 2),
          safety: Math.min(100, score + 1)
        },
        findingsList: issues > 0 ? [
          {
            id: `FND-${i}01`,
            title: isCritical ? 'Critical unauthorized staff substitution identified' : isHigh ? 'Fire clearance certification overdue' : 'Minor register update pending',
            severity: risk as any,
            category: isCritical ? 'Staffing' : isHigh ? 'Safety' : 'Records',
            actionRequired: isCritical ? 'Terminate unauthorized substitute and initiate formal inquiry.' : 'Comply within stipulated time.',
            status: status === 'COMPLETED' && !isCritical ? 'RESOLVED' : 'OPEN'
          }
        ] : [],
        dataSourceType: 'DEMO'
      });
    }

    return list;
  })()
];
