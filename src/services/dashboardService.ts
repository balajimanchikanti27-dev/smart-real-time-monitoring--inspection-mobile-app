import { collection, query, where, getCountFromServer, QueryConstraint, getAggregateFromServer, average } from 'firebase/firestore';
import { db } from '../firebase/config';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  state?: string;
  district?: string;
  organizationId?: string;
  projectId?: string;
  inspectorId?: string;
  inspectionType?: string;
  inspectionStatus?: string;
  findingSeverity?: string;
}

const buildConstraints = (filters?: DashboardFilters): QueryConstraint[] => {
  const constraints: QueryConstraint[] = [];
  if (!filters) return constraints;

  if (filters.startDate) constraints.push(where('createdAt', '>=', filters.startDate));
  if (filters.endDate) constraints.push(where('createdAt', '<=', filters.endDate));
  if (filters.state) constraints.push(where('state', '==', filters.state));
  if (filters.district) constraints.push(where('district', '==', filters.district));
  if (filters.organizationId) constraints.push(where('organizationId', '==', filters.organizationId));
  if (filters.projectId) constraints.push(where('projectId', '==', filters.projectId));
  if (filters.inspectorId) constraints.push(where('inspectorId', '==', filters.inspectorId));
  // Additional specialized filters usually handled per collection where applicable
  return constraints;
};

const countQuery = async (colName: string, additionalConstraints: QueryConstraint[], filters?: DashboardFilters) => {
  const constraints = buildConstraints(filters);
  const q = query(collection(db, colName), ...constraints, ...additionalConstraints);
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export const getDashboardMetrics = async (filters?: DashboardFilters) => {
  
  // 1. Institutions
  const totalInstitutions = await countQuery('institutions', [], filters);
  const activeInstitutions = await countQuery('institutions', [where('status', '==', 'ACTIVE')], filters);
  const inactiveInstitutions = await countQuery('institutions', [where('status', '==', 'INACTIVE')], filters);
  const underReviewInstitutions = await countQuery('institutions', [where('status', '==', 'UNDER_REVIEW')], filters);

  // 2. NGOs
  const totalNGOs = await countQuery('ngos', [], filters);
  const activeNGOs = await countQuery('ngos', [where('status', '==', 'ACTIVE')], filters);
  const inactiveNGOs = await countQuery('ngos', [where('status', '==', 'INACTIVE')], filters);
  const underReviewNGOs = await countQuery('ngos', [where('status', '==', 'UNDER_REVIEW')], filters);

  // 3. Projects
  const totalProjects = await countQuery('projects', [], filters);
  const plannedProjects = await countQuery('projects', [where('projectStatus', '==', 'UNDER_REVIEW')], filters); // Mapped to planned
  const activeProjects = await countQuery('projects', [where('projectStatus', '==', 'ACTIVE')], filters);
  const completedProjects = await countQuery('projects', [where('projectStatus', '==', 'COMPLETED')], filters);
  const suspendedProjects = await countQuery('projects', [where('projectStatus', '==', 'SUSPENDED')], filters);
  const cancelledProjects = await countQuery('projects', [where('projectStatus', '==', 'CLOSED')], filters); // Mapped to cancelled

  // 4. Inspections
  let inspectionBaseConstraints: QueryConstraint[] = [];
  if (filters?.inspectionType) inspectionBaseConstraints.push(where('type', '==', filters.inspectionType));
  if (filters?.inspectionStatus) inspectionBaseConstraints.push(where('status', '==', filters.inspectionStatus));

  const totalInspections = await countQuery('inspections', inspectionBaseConstraints, filters);
  const createdInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'CREATED')], filters);
  const assignedInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'ASSIGNED')], filters);
  const acceptedInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'INSPECTOR_ACCEPTED')], filters);
  const inProgressInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'IN_PROGRESS')], filters);
  const submittedInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'REPORT_SUBMITTED')], filters);
  const reviewedInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'REVIEW')], filters);
  const closedInspections = await countQuery('inspections', [...inspectionBaseConstraints, where('status', '==', 'CLOSED')], filters);

  // 5. Surprise Inspections
  const surpriseConstraints = [where('type', '==', 'SURPRISE')];
  const surpriseCreated = await countQuery('inspections', [...surpriseConstraints, where('status', '==', 'CREATED')], filters);
  const surpriseAssigned = await countQuery('inspections', [...surpriseConstraints, where('status', '==', 'ASSIGNED')], filters);
  const surpriseInProgress = await countQuery('inspections', [...surpriseConstraints, where('status', '==', 'IN_PROGRESS')], filters);
  const surpriseSubmitted = await countQuery('inspections', [...surpriseConstraints, where('status', '==', 'REPORT_SUBMITTED')], filters);
  const surpriseCompleted = await countQuery('inspections', [...surpriseConstraints, where('status', '==', 'COMPLETED')], filters);
  // 'Critical' surprise inspections might mean riskLevelFound == 'CRITICAL'
  const surpriseCritical = await countQuery('inspections', [...surpriseConstraints, where('riskLevelFound', '==', 'CRITICAL')], filters);

  // 6. Inspectors
  // Note: Inspectors collection doesn't usually use organizationId/projectId. Applying general filters cautiously.
  const totalInspectors = await countQuery('inspectors', []);
  const availableInspectors = await countQuery('inspectors', [where('availabilityStatus', '==', 'AVAILABLE')]);
  const assignedInspectors = await countQuery('inspectors', [where('availabilityStatus', '==', 'ASSIGNED')]);
  const onInspectionInspectors = await countQuery('inspectors', [where('availabilityStatus', '==', 'ON_INSPECTION')]);
  const unavailableInspectors = await countQuery('inspectors', [where('availabilityStatus', '==', 'UNAVAILABLE')]);

  // 7. Findings
  let findingConstraints: QueryConstraint[] = [];
  if (filters?.findingSeverity) findingConstraints.push(where('severity', '==', filters.findingSeverity));
  
  const lowFindings = await countQuery('findings', [...findingConstraints, where('severity', '==', 'LOW')], filters);
  const mediumFindings = await countQuery('findings', [...findingConstraints, where('severity', '==', 'MEDIUM')], filters);
  const highFindings = await countQuery('findings', [...findingConstraints, where('severity', '==', 'HIGH')], filters);
  const criticalFindings = await countQuery('findings', [...findingConstraints, where('severity', '==', 'CRITICAL')], filters);

  // 8. Compliance
  // Calculate average compliance score using aggregateQuery
  const complianceQuery = query(collection(db, 'inspections'), ...buildConstraints(filters), where('status', 'in', ['REPORT_SUBMITTED', 'REVIEW', 'CLOSED', 'COMPLETED']));
  const aggSnapshot = await getAggregateFromServer(complianceQuery, {
    overall: average('overallScore')
  });
  const overallCompliance = aggSnapshot.data().overall || 0;
  
  // Buckets
  const excellentCompliance = await countQuery('inspections', [where('overallScore', '>=', 90)], filters);
  const goodCompliance = await countQuery('inspections', [where('overallScore', '>=', 75), where('overallScore', '<', 90)], filters);
  const needsReviewCompliance = await countQuery('inspections', [where('overallScore', '>=', 50), where('overallScore', '<', 75)], filters);
  const criticalCompliance = await countQuery('inspections', [where('overallScore', '<', 50)], filters);

  // 9. CCTV
  const totalCCTV = await countQuery('cctvDevices', [], filters);
  const onlineCCTV = await countQuery('cctvDevices', [where('status', '==', 'ONLINE')], filters);
  const offlineCCTV = await countQuery('cctvDevices', [where('status', '==', 'OFFLINE')], filters);
  const errorCCTV = await countQuery('cctvDevices', [where('status', '==', 'ERROR')], filters);
  const maintenanceCCTV = await countQuery('cctvDevices', [where('status', '==', 'MAINTENANCE')], filters);

  return {
    institutions: { total: totalInstitutions, active: activeInstitutions, inactive: inactiveInstitutions, underReview: underReviewInstitutions },
    ngos: { total: totalNGOs, active: activeNGOs, inactive: inactiveNGOs, underReview: underReviewNGOs },
    projects: { total: totalProjects, planned: plannedProjects, active: activeProjects, completed: completedProjects, suspended: suspendedProjects, cancelled: cancelledProjects },
    inspections: { total: totalInspections, created: createdInspections, assigned: assignedInspections, accepted: acceptedInspections, inProgress: inProgressInspections, submitted: submittedInspections, reviewed: reviewedInspections, closed: closedInspections },
    surpriseInspections: { created: surpriseCreated, assigned: surpriseAssigned, inProgress: surpriseInProgress, submitted: surpriseSubmitted, completed: surpriseCompleted, critical: surpriseCritical },
    inspectors: { total: totalInspectors, available: availableInspectors, assigned: assignedInspectors, onInspection: onInspectionInspectors, unavailable: unavailableInspectors },
    findings: { low: lowFindings, medium: mediumFindings, high: highFindings, critical: criticalFindings },
    compliance: { overall: overallCompliance, excellent: excellentCompliance, good: goodCompliance, needsReview: needsReviewCompliance, critical: criticalCompliance },
    cctv: { total: totalCCTV, online: onlineCCTV, offline: offlineCCTV, error: errorCCTV, maintenance: maintenanceCCTV }
  };
};

/**
 * Simulates a real-time subscription for dashboard metrics by efficiently polling the counts.
 * Returns an unsubscribe function.
 */
export const subscribeToDashboardMetrics = (
  callback: (metrics: any) => void,
  filters?: DashboardFilters,
  pollingIntervalMs: number = 60000 // default 60 seconds
) => {
  let isSubscribed = true;

  const fetchMetrics = async () => {
    if (!isSubscribed) return;
    try {
      const metrics = await getDashboardMetrics(filters);
      if (isSubscribed) {
        callback(metrics);
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
    }
  };

  // Initial fetch
  fetchMetrics();

  // Set interval
  const intervalId = setInterval(fetchMetrics, pollingIntervalMs);

  // Return unsubscribe function
  return () => {
    isSubscribed = false;
    clearInterval(intervalId);
  };
};
