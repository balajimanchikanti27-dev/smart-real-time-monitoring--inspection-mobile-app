import { Timestamp, FieldValue } from 'firebase/firestore';

export type FirestoreDate = Timestamp | FieldValue | Date;

export interface User {
  id?: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'INSPECTOR' | 'ORGANIZATION';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface Institution {
  id?: string;
  name: string;
  type: string;
  registrationNumber: string;
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive';
  isDemo: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface NGO {
  id?: string;
  name: string;
  registrationNumber: string;
  description: string;
  state: string;
  district: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_REVIEW';
  isDemo: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  createdBy: string;
  updatedBy: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  organizationType: 'NGO' | 'Institution';
  organizationId: string;
  schemeName: string;
  projectType: string;
  state: string;
  district: string;
  budget: number;
  startDate: FirestoreDate;
  endDate?: FirestoreDate;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  progress: number;
  isDemo: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  createdBy: string;
  updatedBy: string;
}

export interface Inspector {
  id?: string;
  userId: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  specialization: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_INSPECTION' | 'UNAVAILABLE';
  currentWorkload: number;
  maximumWorkload: number;
  lastInspectionDate?: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface Inspection {
  id?: string;
  organizationType: 'NGO' | 'Institution';
  organizationId: string;
  projectId?: string;
  inspectorId: string;
  inspectionType: string;
  status: 'CREATED' | 'ASSIGNED' | 'ACCEPTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'CLOSED';
  scheduledDate: FirestoreDate;
  startedAt?: FirestoreDate;
  submittedAt?: FirestoreDate;
  reviewedAt?: FirestoreDate;
  summary?: string;
  hasCriticalFinding?: boolean;
  complianceScore?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  riskLevelFound?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  closedAt?: FirestoreDate;
  createdBy: string;
}

// User didn't specify fields for this, so creating standard relational fields
export interface InspectionAssignment {
  id?: string;
  inspectionId: string;
  inspectorId: string;
  assignedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface InspectionChecklist {
  id?: string;
  inspectionId: string;
  category: string;
  question: string;
  response: 'PASS' | 'FAIL' | 'NOT_APPLICABLE' | 'PENDING';
  remarks?: string;
  applicable: boolean;
  score?: number;
  completedAt?: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface InspectionFinding {
  id?: string;
  inspectionId: string;
  category: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED' | 'CLOSED';
  dueDate?: FirestoreDate;
  assignedTo?: string;
  correctiveAction?: string;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  resolvedAt?: FirestoreDate;
  verifiedAt?: FirestoreDate;
}

export interface InspectionEvidence {
  id?: string;
  inspectionId: string;
  findingId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadURL: string;
  uploadedBy: string;
  createdAt: FirestoreDate;
}

export interface CctvDevice {
  id?: string;
  organizationId: string;
  name: string;
  location: string;
  streamUrl: string;
  status: 'ONLINE' | 'OFFLINE' | 'ERROR' | 'MAINTENANCE';
  lastHeartbeat: FirestoreDate;
  createdAt: FirestoreDate;
}

export interface CctvEvent {
  id?: string;
  deviceId: string;
  eventType: 'motion_detected' | 'offline' | 'tamper';
  description: string;
  snapshotUrl?: string;
  createdAt: FirestoreDate;
}

export interface CorrectiveAction {
  id?: string;
  findingId: string;
  organizationId: string;
  actionDescription: string;
  dueDate: FirestoreDate;
  status: 'OPEN' | 'IN_PROGRESS' | 'SUBMITTED' | 'VERIFIED' | 'OVERDUE' | 'CLOSED';
  submittedEvidence?: string;
  verifiedBy?: string;
  verifiedDate?: FirestoreDate;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'assignment';
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: FirestoreDate;
}

export interface Report {
  id?: string;
  inspectionId: string;
  generatedBy: string;
  reportUrl: string;
  generatedAt: FirestoreDate;
}

// User didn't specify fields for this, creating generic organization document metadata
export interface Document {
  id?: string;
  organizationId: string;
  title: string;
  type: 'registration' | 'audit' | 'financial' | 'other';
  fileUrl: string;
  uploadedBy: string;
  status: 'valid' | 'expired' | 'pending_review';
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

export interface AuditLog {
  id?: string;
  userId: string;
  role: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'export';
  entityType: string;
  entityId: string;
  description: string;
  timestamp: FirestoreDate;
}
