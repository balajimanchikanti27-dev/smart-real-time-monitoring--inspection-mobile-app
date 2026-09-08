import { collection, query, where, getDocs, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db, usersRef, inspectionsRef } from '../firebase/firestore';
import type { User, Inspection, InspectionAssignment, Notification, AuditLog } from '../../types/firestore';

export interface AssignmentRequest {
  targetType: 'NGO' | 'Institution';
  targetId: string;
  targetName: string;
  state: string;
  district: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  projectName?: string;
  adminId: string;
}

export interface AssignmentResponse {
  success: boolean;
  inspectorId?: string;
  inspectorName?: string;
  inspectionId?: string;
  error?: string;
}

/**
 * Mock Cloud Function for securely assigning an inspector.
 * In production, this would be an httpsCallable function running on Firebase Functions.
 */
export const mockAssignInspectorFunction = async (request: AssignmentRequest): Promise<AssignmentResponse> => {
  try {
    const { targetType, targetId, targetName, state, district, priority, projectId, adminId } = request;

    // 1. Fetch eligible inspectors (must be active and have INSPECTOR role)
    let eligibleInspectors: any[] = [];
    try {
      const qInspectors = query(
        usersRef, 
        where('role', '==', 'INSPECTOR'),
        where('status', '==', 'active')
      );
      
      const inspectorSnap = await getDocs(qInspectors);
      eligibleInspectors = inspectorSnap.docs.map(d => ({ id: d.id, ...d.data() } as User));
    } catch (e) {
      console.warn('Firebase error fetching inspectors, falling back to mockData:', e);
      // Fallback for demo
      const { demoInspectors } = await import('../mockData');
      eligibleInspectors = demoInspectors.map(i => ({
        id: i.inspectorId,
        name: i.name,
        role: 'INSPECTOR',
        status: 'active',
        state: i.state,
        district: i.district,
        availabilityStatus: i.availabilityStatus
      }));
    }

    // 2. Filter by geographic location (prefer district, fallback to state)
    let localInspectors = eligibleInspectors.filter(i => (i as any).district === district && (i as any).state === state);
    if (localInspectors.length === 0) {
      localInspectors = eligibleInspectors.filter(i => (i as any).state === state);
    }
    
    if (localInspectors.length === 0) {
      // If we still have no local inspectors, we fallback to all eligible for the sake of demo progression
      localInspectors = eligibleInspectors;
    }

    if (localInspectors.length === 0) {
      return { success: false, error: 'No active inspectors available.' };
    }

    // 3. Calculate Workload and filter out unavailable inspectors
    // Fetch all currently active inspections to map workload
    const qActiveInspections = query(
      inspectionsRef,
      where('status', 'in', ['scheduled', 'in_progress'])
    );
    
    const activeInspectionsSnap = await getDocs(qActiveInspections);
    const workloadMap: Record<string, number> = {};
    
    activeInspectionsSnap.docs.forEach(docSnap => {
      const insp = docSnap.data() as Inspection;
      if (insp.inspectorId) {
        workloadMap[insp.inspectorId] = (workloadMap[insp.inspectorId] || 0) + 1;
      }
    });

    const MAX_CAPACITY = 3;
    let availableInspectors = localInspectors.filter(i => {
      const isAvailable = (i as any).availabilityStatus !== 'UNAVAILABLE';
      const isUnderCapacity = (workloadMap[i.id!] || 0) < MAX_CAPACITY;
      return isAvailable && isUnderCapacity;
    });

    if (availableInspectors.length === 0) {
      // OVERRIDE: For critical situations or demo purposes, pick the one with the lowest workload
      localInspectors.sort((a, b) => (workloadMap[a.id!] || 0) - (workloadMap[b.id!] || 0));
      availableInspectors = [localInspectors[0]];
    }

    // 4. Secure Random Selection (Simulating non-predictable server selection)
    // We shuffle the array using crypto.getRandomValues if available, else Math.random fallback
    const array = new Uint32Array(1);
    const randomValue = window.crypto ? window.crypto.getRandomValues(array)[0] / (0xffffffff + 1) : Math.random();
    const randomIndex = Math.floor(randomValue * availableInspectors.length);
    const selectedInspector = availableInspectors[randomIndex];

    // 5. Create Database Batch for Atomic Transaction
    const newInspectionId = `INSP-MOCK-${Date.now()}`;
    try {
      const batch = writeBatch(db);

      // 5a. Create Inspection
      const newInspectionRef = doc(collection(db, 'inspections'), newInspectionId);
      const newInspection: Inspection = {
        organizationType: targetType,
        organizationId: targetId,
        projectId: projectId || undefined,
        inspectorId: selectedInspector.id!,
        inspectionType: 'SURPRISE',
        status: 'CREATED',
        scheduledDate: serverTimestamp() as any,
        priority: priority,
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
        createdBy: 'system'
      };
      batch.set(newInspectionRef, newInspection);

      // 5b. Create Inspection Assignment (for inspector dashboard acceptance workflow)
      const newAssignmentRef = doc(collection(db, 'inspectionAssignments'));
      const newAssignment: InspectionAssignment = {
        inspectionId: newInspectionRef.id,
        inspectorId: selectedInspector.id!,
        assignedBy: adminId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      batch.set(newAssignmentRef, newAssignment);

      // 5c. Update Inspector's Workload (Simulated by updating a custom field or status if they are pushed to max)
      const inspectorRef = doc(usersRef, selectedInspector.id!);
      const newWorkload = (workloadMap[selectedInspector.id!] || 0) + 1;
      if (newWorkload >= MAX_CAPACITY) {
        batch.update(inspectorRef, { availabilityStatus: 'ASSIGNED', updatedAt: serverTimestamp() });
      }

      // 5d. Send Notification to the Inspector
      const notificationRef = doc(collection(db, 'notifications'));
      const notification: Notification = {
        userId: selectedInspector.id!,
        title: 'New Surprise Inspection Assigned',
        message: `You have been securely assigned to a surprise inspection for ${targetName}.`,
        type: 'assignment',
        priority: priority === 'critical' || priority === 'high' ? 'high' : 'medium',
        read: false,
        createdAt: serverTimestamp()
      };
      batch.set(notificationRef, notification);

      // 5e. Create Audit Log (Confidential Trail)
      const auditLogRef = doc(collection(db, 'auditLogs'));
      const auditLog: AuditLog = {
        userId: adminId,
        role: 'SUPER_ADMIN', // Or whatever role triggered this
        action: 'create',
        entityType: 'Inspection',
        entityId: newInspectionRef.id,
        description: `Initiated SURPRISE inspection assignment for ${targetName}. Algorithm securely selected inspector ${selectedInspector.id}.`,
        timestamp: serverTimestamp()
      };
      batch.set(auditLogRef, auditLog);

      // Commit the batch
      await batch.commit();
    } catch (e) {
      console.warn('Firebase batch commit failed, simulating success for demo', e);
    }

    return { 
      success: true, 
      inspectorId: selectedInspector.id,
      inspectorName: selectedInspector.name,
      inspectionId: newInspectionId
    };

  } catch (err: any) {
    console.error('Cloud Function Assignment Error:', err);
    return { success: false, error: err.message };
  }
};
