import { useState, useEffect } from 'react';
import { workflowService } from '../services/workflow.service';
import type { Workflow, WorkflowExecution } from '../types/workflows';

export function useWorkflows(organizationId: string) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, [organizationId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflows(organizationId);
      setWorkflows(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    try {
      const newWorkflow = await workflowService.createWorkflow(workflow);
      setWorkflows([...workflows, newWorkflow]);
      return newWorkflow;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workflow');
      throw err;
    }
  };

  const updateWorkflow = async (id: string, updates: Partial<Workflow>) => {
    try {
      const updated = await workflowService.updateWorkflow(id, updates);
      setWorkflows(workflows.map((w) => (w.id === id ? updated : w)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workflow');
      throw err;
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      await workflowService.deleteWorkflow(id);
      setWorkflows(workflows.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workflow');
      throw err;
    }
  };

  return {
    workflows,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    reload: loadWorkflows,
  };
}

export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, [id]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getWorkflow(id);
      setWorkflow(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  return { workflow, loading, error, reload: loadWorkflow };
}

export function useWorkflowExecutions(workflowId: string) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExecutions();
  }, [workflowId]);

  const loadExecutions = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getExecutions(workflowId);
      setExecutions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (context: Record<string, unknown> = {}) => {
    try {
      const result = await workflowService.executeWorkflow(workflowId, context);
      await loadExecutions();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute workflow');
      throw err;
    }
  };

  return {
    executions,
    loading,
    error,
    executeWorkflow,
    reload: loadExecutions,
  };
}

export function useWorkflowExecution(executionId: string) {
  const [execution, setExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExecution();
  }, [executionId]);

  const loadExecution = async () => {
    try {
      setLoading(true);
      const data = await workflowService.getExecution(executionId);
      setExecution(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load execution');
    } finally {
      setLoading(false);
    }
  };

  const cancelExecution = async () => {
    try {
      await workflowService.cancelExecution(executionId);
      await loadExecution();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel execution');
      throw err;
    }
  };

  return { execution, loading, error, cancelExecution, reload: loadExecution };
}
