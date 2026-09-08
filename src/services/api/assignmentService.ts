import { mockAssignInspectorFunction } from '../backend/mockCloudFunctions';
import type { AssignmentRequest, AssignmentResponse } from '../backend/mockCloudFunctions';

/**
 * Service class for Inspection Assignment
 * Acts as a clean interface to Cloud Functions or backend APIs.
 */
class AssignmentService {
  /**
   * Securely creates a surprise inspection and assigns an eligible inspector.
   * This uses our mock cloud function internally, which handles workload filtering,
   * random non-predictable selection, and secure database transactions.
   */
  async createSurpriseInspection(request: AssignmentRequest): Promise<AssignmentResponse> {
    // In production, this would use firebase/functions httpsCallable
    // const assignInspector = httpsCallable(functions, 'assignInspector');
    // const result = await assignInspector(request);
    // return result.data;
    
    console.log('[AssignmentService] Calling secure backend assignment algorithm...');
    const result = await mockAssignInspectorFunction(request);
    return result;
  }
}

export const assignmentService = new AssignmentService();
