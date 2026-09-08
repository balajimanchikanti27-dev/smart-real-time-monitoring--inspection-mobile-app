import { 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp, 
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { institutionsRef, ngosRef, projectsRef } from './firebase/firestore';
import type { Project } from '../types/firestore';
import { logClientAuditEvent } from './auditService';

const COLLECTION_NAME = 'projects';

export interface ProjectFilters {
  status?: string;
  searchQuery?: string;
}

export interface PaginationParams {
  pageSize: number;
  lastVisible?: any;
}

/**
 * Validates a project before creation or update.
 */
const validateProject = async (data: Partial<Project>, isUpdate = false) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  if (!isUpdate || data.organizationId || data.organizationType) {
    if (!data.organizationId) throw new Error('Organization ID is required');
    if (!data.organizationType) throw new Error('Organization Type is required');

    // 1. Check if organization exists
    let orgRef;
    if (data.organizationType === 'Institution') {
      orgRef = doc(institutionsRef, data.organizationId);
    } else {
      orgRef = doc(ngosRef, data.organizationId);
    }
    const orgSnap = await getDoc(orgRef as any);
    if (!orgSnap.exists()) {
      throw new Error(`The specified ${data.organizationType} does not exist`);
    }

    // 2. Do not allow an organization to create projects for another organization
    // Wait, we need to check if the user is an ORGANIZATION and if their UID matches the organizationId
    // Actually, in our auth model, an Organization user's UID is the same as the Organization ID.
    // Let's get the user profile to check their role.
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.role === 'ORGANIZATION') {
        if (data.organizationId !== user.uid) {
          throw new Error('You cannot create or modify projects for another organization');
        }
      }
    }
  }

  // 3. Dates must be valid
  if (data.startDate && data.endDate) {
    const start = data.startDate instanceof Date ? data.startDate.getTime() : (data.startDate as any).toMillis?.() || new Date(data.startDate as any).getTime();
    const end = data.endDate instanceof Date ? data.endDate.getTime() : (data.endDate as any).toMillis?.() || new Date(data.endDate as any).getTime();
    
    if (start && end && start > end) {
      throw new Error('Start date must be before end date');
    }
  }

  // 4. Budget cannot be negative
  if (data.budget !== undefined && data.budget < 0) {
    throw new Error('Budget cannot be negative');
  }

  // 5. Progress must be 0-100
  if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
    throw new Error('Progress must be between 0 and 100');
  }
};

/**
 * Creates a new Project.
 */
export const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>): Promise<Project> => {
  await validateProject(data);

  const user = auth.currentUser!;
  
  const projectData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    createdBy: user.uid,
    updatedBy: user.uid,
  };

  const docRef = await addDoc(projectsRef, projectData as any);
  await logClientAuditEvent('CREATE', COLLECTION_NAME, docRef.id, { after: projectData });

  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() } as Project;
};

/**
 * Gets a single Project by ID.
 */
export const getProject = async (id: string): Promise<Project | null> => {
  const docRef = doc(projectsRef, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Project;
};

/**
 * Gets a paginated list of Projects with optional filters.
 */
export const getProjects = async (
  filters?: ProjectFilters,
  pagination?: PaginationParams
): Promise<{ projects: Project[], lastVisible: any }> => {
  
  const constraints: QueryConstraint[] = [];

  if (filters?.status && filters.status !== 'all') {
    constraints.push(where('status', '==', filters.status));
  }

  if (filters?.searchQuery) {
    constraints.push(where('name', '>=', filters.searchQuery));
    constraints.push(where('name', '<=', filters.searchQuery + '\uf8ff'));
    constraints.push(orderBy('name'));
  } else {
    constraints.push(orderBy('createdAt', 'desc'));
  }

  if (pagination?.pageSize) constraints.push(limit(pagination.pageSize));
  if (pagination?.lastVisible) constraints.push(startAfter(pagination.lastVisible));

  const q = query(projectsRef, ...constraints);
  const snapshot = await getDocs(q);

  const projects = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Project));
  const lastVisible = snapshot.docs[snapshot.docs.length - 1];

  return { projects, lastVisible };
};

/**
 * Gets projects by Organization ID.
 */
export const getProjectsByOrganization = async (organizationId: string): Promise<Project[]> => {
  const q = query(projectsRef, where('organizationId', '==', organizationId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Project));
};

/**
 * Gets projects by Status.
 */
export const getProjectsByStatus = async (status: string): Promise<Project[]> => {
  const q = query(projectsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Project));
};

/**
 * Search projects globally.
 */
export const searchProjects = async (searchQuery: string): Promise<Project[]> => {
  const q = query(
    projectsRef, 
    where('name', '>=', searchQuery),
    where('name', '<=', searchQuery + '\uf8ff'),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...(d.data() as object) } as Project));
};

/**
 * Updates a Project.
 */
export const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'createdAt' | 'createdBy'>>): Promise<void> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Must be logged in');

  const docRef = doc(projectsRef, id);
  const beforeSnap = await getDoc(docRef);
  if (!beforeSnap.exists()) throw new Error('Project not found');

  const currentData = beforeSnap.data() as Project;
  const mergedData = { ...currentData, ...updates };

  await validateProject(mergedData, true);

  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
    updatedBy: user.uid,
  };

  await updateDoc(docRef, updateData);
  
  await logClientAuditEvent('UPDATE', COLLECTION_NAME, id, { 
    before: currentData, 
    after: { ...currentData, ...updateData } 
  });
};

/**
 * Deletes a Project.
 */
export const deleteProject = async (id: string): Promise<void> => {
  const docRef = doc(projectsRef, id);
  const beforeSnap = await getDoc(docRef);
  
  if (beforeSnap.exists()) {
    // If user is ORGANIZATION, check ownership
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().role === 'ORGANIZATION') {
        if (beforeSnap.data().organizationId !== user.uid) {
          throw new Error('You cannot delete projects belonging to another organization');
        }
      }
    }

    await deleteDoc(docRef);
    await logClientAuditEvent('DELETE', COLLECTION_NAME, id, { before: beforeSnap.data() });
  }
};
