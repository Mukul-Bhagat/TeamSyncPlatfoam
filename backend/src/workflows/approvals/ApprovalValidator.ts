export interface ApprovalValidationResult {
  valid: boolean;
  errors: string[];
}

export class ApprovalValidator {
  private static instance: ApprovalValidator;

  private constructor() {}

  static getInstance(): ApprovalValidator {
    if (!ApprovalValidator.instance) {
      ApprovalValidator.instance = new ApprovalValidator();
    }
    return ApprovalValidator.instance;
  }

  /**
   * Validate approval request
   */
  validateApprovalRequest(data: {
    execution_id: string;
    requested_by: string;
    approval_type: string;
    approver_id?: string;
  }): ApprovalValidationResult {
    const errors: string[] = [];

    if (!data.execution_id) {
      errors.push('execution_id is required');
    }

    if (!data.requested_by) {
      errors.push('requested_by is required');
    }

    if (!data.approval_type) {
      errors.push('approval_type is required');
    }

    // Validate approval type
    const validTypes = ['manual', 'deployment', 'incident', 'custom'];
    if (!validTypes.includes(data.approval_type)) {
      errors.push(`approval_type must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate approval action
   */
  validateApprovalAction(data: {
    approval_id: string;
    approver_id: string;
    action: 'approve' | 'reject';
  }): ApprovalValidationResult {
    const errors: string[] = [];

    if (!data.approval_id) {
      errors.push('approval_id is required');
    }

    if (!data.approver_id) {
      errors.push('approver_id is required');
    }

    if (!data.action) {
      errors.push('action is required');
    }

    if (data.action !== 'approve' && data.action !== 'reject') {
      errors.push('action must be either "approve" or "reject"');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate rejection action
   */
  validateRejectionAction(data: {
    approval_id: string;
    approver_id: string;
    reason: string;
  }): ApprovalValidationResult {
    const errors: string[] = [];

    if (!data.approval_id) {
      errors.push('approval_id is required');
    }

    if (!data.approver_id) {
      errors.push('approver_id is required');
    }

    if (!data.reason) {
      errors.push('reason is required for rejection');
    }

    if (data.reason.length < 10) {
      errors.push('reason must be at least 10 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
