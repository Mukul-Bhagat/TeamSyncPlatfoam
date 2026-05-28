import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Switch } from '../../../components/ui/switch';
import { Plus, Trash2, ArrowUp, ArrowDown, Play } from 'lucide-react';
import type { WorkflowStep } from '../../types/workflows';

interface ActionPipelineProps {
  steps: WorkflowStep[];
  onStepsChange: (steps: WorkflowStep[]) => void;
  onExecute?: () => void;
}

export function ActionPipeline({ steps, onStepsChange, onExecute }: ActionPipelineProps) {
  const [selectedAction, setSelectedAction] = useState<string>('');

  const actionTypes = [
    'send_notification',
    'create_incident',
    'trigger_webhook',
    'AI_analysis',
    'generate_summary',
    'assign_user',
    'create_channel_message',
  ];

  const addStep = () => {
    if (!selectedAction) return;

    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      name: `Step ${steps.length + 1}`,
      action_type: selectedAction,
      action_config: {},
      continue_on_error: false,
    };

    onStepsChange([...steps, newStep]);
    setSelectedAction('');
  };

  const removeStep = (stepId: string) => {
    onStepsChange(steps.filter((step) => step.id !== stepId));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newSteps.length) return;

    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    onStepsChange(newSteps);
  };

  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    onStepsChange(
      steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Action Pipeline</CardTitle>
            <CardDescription>Configure the sequence of actions for this workflow</CardDescription>
          </div>
          {onExecute && (
            <Button onClick={onExecute}>
              <Play className="mr-2 h-4 w-4" />
              Execute
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedAction} onValueChange={setSelectedAction}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select an action to add" />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addStep} disabled={!selectedAction}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
            No actions configured. Add an action to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3 p-4 border rounded-lg bg-card">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === steps.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={step.name}
                      onChange={(e) => updateStep(step.id, { name: e.target.value })}
                      className="font-medium bg-transparent border-none focus:outline-none focus:ring-0 w-full"
                    />
                    <Badge variant="outline">{step.action_type}</Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`continue-error-${step.id}`}
                        checked={step.continue_on_error}
                        onCheckedChange={(checked) => updateStep(step.id, { continue_on_error: checked })}
                      />
                      <label htmlFor={`continue-error-${step.id}`} className="text-muted-foreground">
                        Continue on error
                      </label>
                    </div>
                  </div>
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
  );
}
