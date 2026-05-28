import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Check, X, Clock } from 'lucide-react';
import type { WorkflowApproval } from '../../types/workflows';

interface ApprovalListProps {
  approvals: WorkflowApproval[];
  onApprove: (approvalId: string, comment?: string) => void;
  onReject: (approvalId: string, reason: string) => void;
}

export function ApprovalList({ approvals, onApprove, onReject }: ApprovalListProps) {
  const [comment, setComment] = useState<Record<string, string>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState<Record<string, boolean>>({});

  const handleApprove = (approvalId: string) => {
    onApprove(approvalId, comment[approvalId]);
    setComment({ ...comment, [approvalId]: '' });
  };

  const handleReject = (approvalId: string) => {
    if (!rejectionReason[approvalId] || rejectionReason[approvalId].length < 10) {
      return;
    }
    onReject(approvalId, rejectionReason[approvalId]);
    setRejectionReason({ ...rejectionReason, [approvalId]: '' });
    setShowReject({ ...showReject, [approvalId]: false });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (approvals.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">No pending approvals</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Approvals</h2>
      <div className="grid gap-4">
        {approvals.map((approval) => (
          <Card key={approval.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{approval.approval_type}</CardTitle>
                  <CardDescription>
                    Requested by {approval.requested_by} · {new Date(approval.created_at).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(approval.status)}`} />
                  <Badge variant="outline">{approval.status.toUpperCase()}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {approval.status === 'pending' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`comment-${approval.id}`}>Comment (optional)</Label>
                    <Textarea
                      id={`comment-${approval.id}`}
                      placeholder="Add a comment for this approval..."
                      value={comment[approval.id] || ''}
                      onChange={(e) => setComment({ ...comment, [approval.id]: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(approval.id)}
                      className="flex-1"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowReject({ ...showReject, [approval.id]: true })}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                  {showReject[approval.id] && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label htmlFor={`reason-${approval.id}`}>Rejection Reason (required, min 10 chars)</Label>
                      <Textarea
                        id={`reason-${approval.id}`}
                        placeholder="Explain why you're rejecting this approval..."
                        value={rejectionReason[approval.id] || ''}
                        onChange={(e) => setRejectionReason({ ...rejectionReason, [approval.id]: e.target.value })}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(approval.id)}
                          disabled={!rejectionReason[approval.id] || rejectionReason[approval.id].length < 10}
                        >
                          Confirm Rejection
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowReject({ ...showReject, [approval.id]: false });
                            setRejectionReason({ ...rejectionReason, [approval.id]: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {approval.status === 'approved' && (
                <div className="text-sm text-muted-foreground">
                  Approved by {approval.approver_id} on {approval.approved_at ? new Date(approval.approved_at).toLocaleString() : 'N/A'}
                  {comment[approval.id] && <p className="mt-1 italic">"{comment[approval.id]}"</p>}
                </div>
              )}

              {approval.status === 'rejected' && (
                <div className="text-sm text-destructive">
                  Rejected by {approval.approver_id} on {approval.rejected_at ? new Date(approval.rejected_at).toLocaleString() : 'N/A'}
                  {approval.rejection_reason && <p className="mt-1">Reason: {approval.rejection_reason}</p>}
                </div>
              )}

              {approval.status === 'expired' && (
                <div className="text-sm text-muted-foreground">
                  This approval expired on {approval.expires_at ? new Date(approval.expires_at).toLocaleString() : 'N/A'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
