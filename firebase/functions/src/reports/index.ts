import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const generateInspectionReport = functions.https.onCall(async (data, context) => {
  const { inspectionId } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  if (!inspectionId) {
    throw new functions.https.HttpsError('invalid-argument', 'inspectionId is required.');
  }

  const db = admin.firestore();
  const bucket = admin.storage().bucket();
  const userId = context.auth.uid;

  try {
    // 1. Retrieve all related data
    const inspectionRef = db.collection('inspections').doc(inspectionId);
    const inspectionSnap = await inspectionRef.get();
    
    if (!inspectionSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Inspection not found.');
    }
    
    const inspection = inspectionSnap.data()!;
    const organizationId = inspection.organizationId;
    const projectId = inspection.projectId;
    const inspectorId = inspection.inspectorId;

    // Fetch Organization
    let organization = null;
    if (organizationId) {
      const orgSnap = await db.collection('organizations').doc(organizationId).get();
      organization = orgSnap.data();
    }

    // Fetch Project
    let project = null;
    if (projectId) {
      const projectSnap = await db.collection('projects').doc(projectId).get();
      project = projectSnap.data();
    }

    // Fetch Inspector
    let inspector = null;
    if (inspectorId) {
      const inspectorSnap = await db.collection('inspectors').doc(inspectorId).get();
      inspector = inspectorSnap.data();
    }

    // Fetch Checklists (Assuming checklists collection with inspectionId)
    const checklistsSnap = await db.collection('checklists').where('inspectionId', '==', inspectionId).get();
    const checklists = checklistsSnap.docs.map(doc => doc.data());

    // Fetch Findings
    const findingsSnap = await db.collection('findings').where('inspectionId', '==', inspectionId).get();
    const findings = findingsSnap.docs.map(doc => doc.data());

    // Fetch Evidence
    const evidenceSnap = await db.collection('evidence').where('inspectionId', '==', inspectionId).get();
    const evidence = evidenceSnap.docs.map(doc => doc.data());

    // Fetch Corrective Actions
    const caSnap = await db.collection('correctiveActions').where('inspectionId', '==', inspectionId).get();
    const correctiveActions = caSnap.docs.map(doc => doc.data());

    // Determine Compliance Score (using inspection's overallScore or calculating mock)
    const complianceScore = inspection.overallScore || 0;

    // 2. Generate structured report content (Text/JSON based)
    const reportContent = {
      branding: 'NIRIKSHAN STATUTORY VIGILANCE',
      inspectionId,
      organization: organization?.organizationName || 'Unknown Organization',
      project: project?.projectName || 'N/A',
      inspector: inspector?.name || 'Unknown Inspector',
      inspectionType: inspection.type || 'ROUTINE',
      date: inspection.createdAt,
      checklistSummary: checklists,
      complianceScore: complianceScore,
      findings: findings.map(f => ({
        title: f.title,
        severity: f.severity,
        status: f.status
      })),
      evidenceReferences: evidence.map(e => ({
        id: e.evidenceId,
        url: e.fileUrl
      })),
      correctiveActions: correctiveActions.map(ca => ({
        issue: ca.issue,
        requiredAction: ca.requiredAction,
        status: ca.status
      })),
      finalStatus: inspection.status
    };

    // 3. Store the report file in Firebase Storage
    const storagePath = `reports/inspections/${inspectionId}_${Date.now()}.json`;
    const file = bucket.file(storagePath);
    
    await file.save(JSON.stringify(reportContent, null, 2), {
      contentType: 'application/json',
      metadata: {
        metadata: {
          generatedBy: userId,
          inspectionId: inspectionId
        }
      }
    });

    // Make file public or get a signed URL (assuming public for simplicity here or get signed URL)
    // For long term, usually we store the path and generate signed urls on demand.
    // We'll store a generic URL format.
    const reportUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    // 4. Store report metadata in Firestore
    const reportData = {
      inspectionId,
      organizationId,
      projectId,
      inspectorId,
      reportUrl,
      storagePath,
      generatedBy: userId,
      generatedAt: new Date().toISOString(),
      complianceScore,
      status: 'GENERATED'
    };

    const newReportRef = db.collection('reports').doc();
    await newReportRef.set(reportData);

    // Also update inspection status if needed or trigger notification
    // ...

    return {
      success: true,
      reportId: newReportRef.id,
      reportUrl,
      storagePath
    };
  } catch (error) {
    console.error('Error generating report:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate report.');
  }
});
