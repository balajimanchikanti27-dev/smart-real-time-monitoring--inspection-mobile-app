import { 
  initializeTestEnvironment,
  RulesTestEnvironment,
  RulesTestContext
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Read the firestore.rules file from the parent directory
  const rules = fs.readFileSync(path.resolve(__dirname, '../../firestore.rules'), 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-nirikshan-test',
    firestore: {
      rules,
      host: '127.0.0.1',
      port: 8085,
    }
  });
});

beforeEach(async () => {
  // Clear the database between tests
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('NIRIKSHAN Backend E2E Workflow', () => {
  let superAdminContext: RulesTestContext;
  let adminContext: RulesTestContext;
  let inspectorContext: RulesTestContext;
  let orgContext: RulesTestContext;
  let unauthContext: RulesTestContext;

  beforeEach(() => {
    superAdminContext = testEnv.authenticatedContext('super_admin_id', { email: 'super@admin.com' });
    adminContext = testEnv.authenticatedContext('admin_id', { email: 'admin@admin.com' });
    inspectorContext = testEnv.authenticatedContext('inspector_id', { email: 'inspector@test.com' });
    orgContext = testEnv.authenticatedContext('org_id', { email: 'org@test.com' });
    unauthContext = testEnv.unauthenticatedContext();
  });

  test('Complete Workflow', async () => {
    // We will simulate the exact steps here
    
    // 1. Initialize user roles via Admin SDK equivalent (simulated by pre-seeding the DB)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await db.collection('users').doc('super_admin_id').set({ role: 'SUPER_ADMIN' });
      await db.collection('users').doc('admin_id').set({ role: 'ADMIN' });
      await db.collection('users').doc('inspector_id').set({ role: 'INSPECTOR' });
      await db.collection('users').doc('org_id').set({ role: 'ORGANIZATION' });
    });

    // 2. Setup: Super Admin creates Institution
    const saDb = superAdminContext.firestore();
    const instRef = saDb.collection('institutions').doc('inst_1');
    await expect(instRef.set({ name: 'Test Institution', status: 'ACTIVE' })).resolves.toBeUndefined();

    // 3. Setup: Admin creates Project
    const adminDb = adminContext.firestore();
    const projRef = adminDb.collection('projects').doc('proj_1');
    await expect(projRef.set({ name: 'Test Project', organizationId: 'org_id' })).resolves.toBeUndefined();

    // 4. Creation: Admin creates Routine Inspection
    const inspRef = adminDb.collection('inspections').doc('insp_1');
    await expect(inspRef.set({ 
      inspectionType: 'ROUTINE', 
      status: 'ASSIGNED', 
      organizationId: 'org_id',
      inspectorId: 'inspector_id'
    })).resolves.toBeUndefined();

    // 5. Inspector reads their assignment
    const inspDb = inspectorContext.firestore();
    const myInsp = await inspDb.collection('inspections').doc('insp_1').get();
    expect(myInsp.exists).toBe(true);

    // 6. Organization reads their inspection
    const orgDb = orgContext.firestore();
    const orgInsp = await orgDb.collection('inspections').doc('insp_1').get();
    expect(orgInsp.exists).toBe(true);

    // 7. Inspector updates status to IN_PROGRESS
    await expect(inspDb.collection('inspections').doc('insp_1').update({ status: 'IN_PROGRESS' })).resolves.toBeUndefined();

    // 8. Inspector creates a finding
    const findingRef = inspDb.collection('inspectionFindings').doc('finding_1');
    await expect(findingRef.set({
      inspectionId: 'insp_1',
      severity: 'CRITICAL',
      status: 'OPEN'
    })).resolves.toBeUndefined();

    // 9. Negative Test: Organization tries to read a finding not belonging to them
    // Here finding belongs to org_id because it links to insp_1 which belongs to org_id.
    // They should be able to read it.
    const orgFinding = await orgDb.collection('inspectionFindings').doc('finding_1').get();
    expect(orgFinding.exists).toBe(true);

    // 10. Negative Test: Organization attempts to VERIFY their own finding
    await expect(orgDb.collection('inspectionFindings').doc('finding_1').update({ status: 'VERIFIED' })).rejects.toThrow();

    // 11. Inspector submits the inspection
    await expect(inspDb.collection('inspections').doc('insp_1').update({ status: 'SUBMITTED' })).resolves.toBeUndefined();

    // 12. Unauthenticated User tries to delete an Audit Log
    const unauthDb = unauthContext.firestore();
    await expect(unauthDb.collection('auditLogs').doc('log_1').delete()).rejects.toThrow();

    // 13. Inspector verifies finding
    await expect(inspDb.collection('inspectionFindings').doc('finding_1').update({ status: 'VERIFIED' })).resolves.toBeUndefined();

    // 14. Admin closes inspection
    await expect(adminDb.collection('inspections').doc('insp_1').update({ status: 'CLOSED' })).resolves.toBeUndefined();
  });
});
