import { useState } from 'react';
import { useWorkflow } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Save, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import type { Workflow, WorkflowStep } from '@/types/workflows';

interface WorkflowEditorProps {
  workflowId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function WorkflowEditor({ workflowId, onSave, onCancel }: WorkflowEditorProps) {
  const { workflow, loading, error, updateWorkflow } = useWorkflow(workflowId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useState(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setEnabled(workflow.enabled);
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWorkflow(workflowId, {
        name,
        description,
        enabled,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  const addStep = () => {
    // TODO: Implement step addition
  };

  const removeStep = (stepId: string) => {
    // TODO: Implement step removal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">{error}</div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Workflow not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">Edit Workflow</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>Configure the basic settings for this workflow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Workflow name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Workflow description"
              rows={3}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor="enabled">Enabled</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Steps</CardTitle>
              <CardDescription>Configure the actions in this workflow</CardDescription>
            </div>
            <Button size="sm" onClick={addStep}>
              <Plus className="mr-2 h-4 w-4" />
              Add Step
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {workflow.steps.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No steps configured. Add a step to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {workflow.steps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{step.name}</h4>
                      <Badge variant="outline">{step.action_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.continue_on_error ? 'Continues on error' : 'Stops on error'}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStep(step.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
