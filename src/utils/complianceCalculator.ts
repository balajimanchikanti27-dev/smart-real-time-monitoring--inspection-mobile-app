import type { InspectionChecklist, InspectionFinding } from '../types/firestore';

export const COMPLIANCE_THRESHOLDS = {
  EXCELLENT: { min: 90, label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' },
  GOOD: { min: 75, label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' },
  NEEDS_REVIEW: { min: 50, label: 'Needs Review', color: 'text-amber-600', bg: 'bg-amber-100' },
  CRITICAL: { min: 0, label: 'Critical', color: 'text-red-600', bg: 'bg-red-100' }
};

export interface ComplianceResult {
  score: number;
  label: string;
  colorClass: string;
  bgClass: string;
  total: number;
  applicable: number;
  passed: number;
  failed: number;
  completed: number;
  remaining: number;
  hasCriticalFinding: boolean;
  alertMessage?: string;
}

/**
 * Calculates dynamic inspection compliance.
 * NOTE: These are prototype thresholds only and do not represent official government standards.
 */
export const calculateCompliance = (
  items: InspectionChecklist[],
  findings: InspectionFinding[] = []
): ComplianceResult => {
  const total = items.length;
  
  // N/A or UNANSWERED items are not applicable to the final score denominator
  // Wait, UNANSWERED shouldn't be counted in the compliance calculation until they are answered.
  // Actually, standard practice: Applicable = total items that are NOT marked N/A.
  const applicableItems = items.filter(i => i.response !== 'NOT_APPLICABLE');
  const applicable = applicableItems.length;

  const passed = items.filter(i => i.response === 'PASS').length;
  const failed = items.filter(i => i.response === 'FAIL').length;
  const unanswered = items.filter(i => i.response === 'PENDING').length;
  
  // Completed means it has an explicit answer (PASS, FAIL, NA)
  const completed = total - unanswered;
  const remaining = total - completed;

  // If no items are applicable or answered, score is 0
  let score = 0;
  if (applicable > 0) {
    // Only count passed items against the answered applicable items to show live running score?
    // Or against ALL applicable items?
    // Usually, running score = (passed / (passed + failed)) * 100
    const answeredApplicable = passed + failed;
    if (answeredApplicable > 0) {
      score = Math.round((passed / answeredApplicable) * 100);
    }
  }

  // Determine category
  let category = COMPLIANCE_THRESHOLDS.CRITICAL;
  if (score >= COMPLIANCE_THRESHOLDS.EXCELLENT.min) category = COMPLIANCE_THRESHOLDS.EXCELLENT;
  else if (score >= COMPLIANCE_THRESHOLDS.GOOD.min) category = COMPLIANCE_THRESHOLDS.GOOD;
  else if (score >= COMPLIANCE_THRESHOLDS.NEEDS_REVIEW.min) category = COMPLIANCE_THRESHOLDS.NEEDS_REVIEW;

  // Check for critical findings overriding the visual alert
  const hasCriticalFinding = findings.some(f => f.severity === 'CRITICAL');
  
  let alertMessage;
  if (hasCriticalFinding) {
    alertMessage = "Critical attention required";
    // Keep the score, but force the visual styling to critical
    category = COMPLIANCE_THRESHOLDS.CRITICAL;
  }

  return {
    score,
    label: category.label,
    colorClass: category.color,
    bgClass: category.bg,
    total,
    applicable,
    passed,
    failed,
    completed,
    remaining,
    hasCriticalFinding,
    alertMessage
  };
};
