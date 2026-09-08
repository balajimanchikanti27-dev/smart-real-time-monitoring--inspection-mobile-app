export type DataSourceType = 'DEMO' | 'OFFICIAL';
export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InspectionStatus = 'CREATED' | 'ASSIGNED' | 'INSPECTOR_ACCEPTED' | 'TRAVELLING' | 'ARRIVED' | 'INSPECTION_STARTED' | 'EVIDENCE_COLLECTION' | 'REPORT_SUBMITTED' | 'REVIEW' | 'CORRECTIVE_ACTION' | 'CLOSED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW' | 'SUSPENDED' | 'CLOSED';
export type OrganizationType = 'GOVERNMENT_INSTITUTION' | 'COMMISSION' | 'CORPORATION' | 'FOUNDATION' | 'BOARD' | 'NGO' | 'IMPLEMENTING_AGENCY';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type InstitutionStatus = 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';

export interface Institution {
  id: string;
  name: string;
  type: string;
  description: string;
  registrationNumber: string;
  state: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: InstitutionStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type Role = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'INSPECTOR' 
  | 'ORGANIZATION';

export interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: Role;
  organizationId?: string;
  phone?: string;
  state?: string;
  district?: string;
  photoURL?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BaseRecord {
  dataSourceType: DataSourceType;
  lastVerifiedAt?: string;
  sourceUrl?: string;
}

export interface Organization extends BaseRecord {
  id: string;
  organizationName: string;
  organizationType: OrganizationType;
  ngoDarpanId?: string;
  registrationNumber?: string;
  registrationAuthority?: string;
  schemeIds: string[];
  projectIds: string[];
  address: string;
  state: string;
  district: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website?: string;
  establishedYear?: number;
  status: EntityStatus;
  
  // Risk calculation fields
  previousViolations: number;
  inspectionDelayDays: number;
  complaintsCount: number;
  cctvAnomalies: number;
  financialIrregularityFlags: number;
  complianceScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

export interface Scheme extends BaseRecord {
  schemeId: string;
  schemeName: string;
  description: string;
  department: string;
  ministry: string;
  targetBeneficiaries: string;
  eligibility: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Project extends BaseRecord {
  projectId: string;
  projectName: string;
  organizationId: string;
  schemeId: string;
  projectType: string;
  description: string;
  targetBeneficiaries: number;
  actualBeneficiaries: number;
  budget: number;
  grantAmount: number;
  startDate: string;
  endDate: string;
  state: string;
  district: string;
  projectStatus: 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'UNDER_REVIEW' | 'CLOSED';
  riskScore: number;
  lastInspection?: string;
  nextInspection?: string;
}

export interface Inspector extends BaseRecord {
  inspectorId: string;
  name: string;
  employeeCode: string;
  department: string;
  designation: string;
  state: string;
  district: string;
  specialization: string[];
  availabilityStatus: 'AVAILABLE' | 'ASSIGNED' | 'ON_INSPECTION' | 'UNAVAILABLE';
  currentLocation?: string;
  assignedInspectionCount: number;
  lastInspectionDate?: string;
}

export interface Inspection extends BaseRecord {
  inspectionId: string;
  type: 'ROUTINE' | 'SURPRISE' | 'RANDOM' | 'RISK_BASED' | 'COMPLAINT_BASED' | 'FOLLOW_UP' | 'EMERGENCY';
  status: InspectionStatus;
  organizationId: string;
  projectId?: string;
  inspectorId?: string;
  createdAt: string;
  scheduledDate?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  overallScore?: number;
  riskLevelFound?: string;
  issuesFound?: number;
  locationMatched?: boolean;
  gpsCoordinates?: { latitude: number; longitude: number; accuracy: number };
  summary?: string;
  schemeName?: string;
  subScores?: {
    infrastructure?: number;
    staffing?: number;
    beneficiaries?: number;
    records?: number;
    safety?: number;
  };
  findingsList?: {
    id: string;
    title: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    category: string;
    actionRequired: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  }[];
  evidencePhotos?: {
    id: string;
    title: string;
    url: string;
    timestamp: string;
    geotag?: { lat: number; lng: number };
  }[];
}

export interface Complaint extends BaseRecord {
  complaintId: string;
  organizationId: string;
  projectId?: string;
  category: string;
  description: string;
  submittedAt: string;
  priority: Severity;
  status: 'NEW' | 'OPEN' | 'ACKNOWLEDGED' | 'UNDER_INVESTIGATION' | 'ACTION_REQUIRED' | 'RESOLVED' | 'CLOSED';
  assignedOfficer?: string;
}

export interface Evidence extends BaseRecord {
  evidenceId: string;
  inspectionId: string;
  type: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  fileUrl: string;
  capturedAt: string;
  latitude?: number;
  longitude?: number;
  uploadedBy: string;
  description: string;
}

export interface CCTVDevice extends BaseRecord {
  id: string;
  organizationId: string;
  name: string;
  location: string;
  streamUrl?: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE';
  lastHeartbeat: string;
  createdAt: string;
  updatedAt: string;
}

export interface CCTVEvent extends BaseRecord {
  id: string;
  deviceId: string;
  eventType: string;
  description: string;
  timestamp: string;
  severity: Severity;
}

export interface CorrectiveAction extends BaseRecord {
  actionId: string;
  inspectionId: string;
  organizationId: string;
  issue: string;
  severity: Severity;
  requiredAction: string;
  assignedTo: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'OVERDUE' | 'CLOSED';
}

export interface Alert extends BaseRecord {
  id?: string;
  alertId?: string;
  type: 'CCTV_OFFLINE' | 'HIGH_RISK' | 'CRITICAL_RISK' | 'INSPECTION_OVERDUE' | 'COMPLAINT_RECEIVED' | 'DOCUMENT_MISSING' | 'REPEATED_VIOLATION' | 'BENEFICIARY_DISCREPANCY' | 'CORRECTIVE_ACTION_OVERDUE' | 'RISK_ESCALATION' | 'INSPECTION_DELAY';
  severity: Severity;
  message: string;
  entityId?: string;
  organizationId?: string;
  timestamp?: string;
  isRead?: boolean;
  createdAt?: string;
}

export type NotificationType = 
  | 'NEW_ASSIGNMENT'
  | 'ASSIGNMENT_ACCEPTED'
  | 'INSPECTION_STARTED'
  | 'INSPECTION_SUBMITTED'
  | 'CRITICAL_FINDING'
  | 'HIGH_PRIORITY_INSPECTION'
  | 'CORRECTIVE_ACTION_DUE'
  | 'REPORT_GENERATED'
  | 'CCTV_OFFLINE';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Severity;
  read: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

export type AuditAction = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'ASSIGN_INSPECTOR'
  | 'ACCEPT_INSPECTION'
  | 'START_INSPECTION'
  | 'SUBMIT_INSPECTION'
  | 'CREATE_FINDING'
  | 'UPDATE_FINDING'
  | 'UPLOAD_EVIDENCE'
  | 'VERIFY_FINDING'
  | 'GENERATE_REPORT'
  | 'STATUS_CHANGE';

export interface AuditLog {
  id: string;
  userId: string;
  role: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
}
