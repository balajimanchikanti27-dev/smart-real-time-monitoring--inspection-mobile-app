# NIRIKSHAN Security Architecture

This document outlines the security models and rules protecting the NIRIKSHAN platform's backend infrastructure (Firebase Firestore and Cloud Storage).

## 1. Principles

- **Default Deny**: All read and write operations are strictly denied by default.
- **Authentication Required**: No unauthenticated user can access any part of the database or storage.
- **Principle of Least Privilege**: Users are only granted access to the exact resources they need to fulfill their operational duties.

## 2. Role-Based Access Control (RBAC)

The system relies on four primary roles, defined in the `users` collection:

1. **SUPER_ADMIN**: Full administrative access. Can modify roles, manage audit logs, and oversee the entire system.
2. **ADMIN**: Operational staff. Can manage assignments, view all inspections, and oversee organizations. Cannot alter user roles.
3. **INSPECTOR**: Field officers. Can only view inspections explicitly assigned to their `uid`. Can create findings and upload evidence for their inspections.
4. **ORGANIZATION**: NGOs and Institutions. Can only view data (inspections, findings, corrective actions) linked to their specific `organizationId`.

> **Note on Role Escalation:** 
> Users are strictly prohibited from changing their own `role` field via Client SDKs. Role assignments are tightly controlled by `SUPER_ADMIN` logic.

## 3. Data Protection Mechanisms

### Inspections and Findings
Inspectors can only update records they own. Organizations can read records targeting them but cannot alter the compliance scores, inspection status, or finding severity.

### Audit Logs
Audit logs are immutable. Client SDKs are permitted to `create` logs (for tracking client-side events), but `update` and `delete` operations are completely disabled.

### Evidence Storage
Files uploaded to Cloud Storage must meet strict criteria:
- **Size Limit**: Maximum 10MB per file.
- **File Types**: Restricted to standard images (`image/*`) and documents (`application/pdf`).
- **Immutability**: Once evidence is uploaded, it cannot be modified or deleted. This preserves the integrity of the inspection trail.

## 4. Rule Deployment

The rules are maintained in `firestore.rules` and `storage.rules`. They must be deployed via the Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
```

*Before claiming full security readiness in a production environment, these rules must be rigorously tested using the Firebase Emulator Suite.*
