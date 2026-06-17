import { eq } from 'drizzle-orm';
import { DbClient } from '../../../docs/client';
import { workflows } from '../../../docs/schema';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowStep, WorkflowPriority } from '../../types/workflow';

/**
 * WorkflowService
 * 
 * Manages the lifecycle of document workflows. 
 * Orchestrates the transitions between extraction, validation, and completion.
 */
export const WorkflowService = {
  /**
   * Initializes a new workflow for a document.
   */
  async createWorkflow(db: DbClient, documentId: string, priority: WorkflowPriority = 'medium'): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const defaultSteps: WorkflowStep[] = [ // Ensure WorkflowStep has an 'id' property
        { id: uuidv4(), name: 'Extraction', order: 1, status: 'pending' },
        { id: uuidv4(), name: 'Validation', order: 2, status: 'pending' },
        { id: uuidv4(), name: 'Finalization', order: 3, status: 'pending' }
      ];

      const newWorkflowData = {
        id: uuidv4(),
        documentId,
        status: 'active' as const,
        priority,
        currentStepId: defaultSteps[0].id, // Reference the ID of the first step
        steps: defaultSteps,
        startedAt: new Date()
      };

      await db.insert(workflows).values(newWorkflowData);

      return { data: newWorkflowData as Workflow, error: null };
    } catch (error: any) {
      console.error('[WorkflowService] createWorkflow Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Retrieves the workflow associated with a specific document.
   */
  async getWorkflowByDocumentId(db: DbClient, documentId: string): Promise<{ data: Workflow | null; error: Error | null }> {
    try {
      const data = await db.query.workflows.findFirst({
        where: eq(workflows.documentId, documentId)
      });

      if (!data) return { data: null, error: new Error('Workflow not found') };
      return { data: { ...data, steps: data.steps as WorkflowStep[] } as unknown as Workflow, error: null };
    } catch (error: any) {
      console.error('[WorkflowService] getWorkflowByDocumentId Error:', error.message);
      return { data: null, error };
    }
  },

  /**
   * Updates the status of a specific step within a workflow.
   */
  async updateStepStatus(
    db: DbClient,
    workflowId: string, 
    stepName: string, 
    status: WorkflowStep['status']
  ): Promise<{ error: Error | null }> {
    try {
      const workflow = await db.query.workflows.findFirst({
        columns: { steps: true, currentStepId: true },
        where: eq(workflows.id, workflowId)
      });

      if (!workflow) throw new Error('Workflow not found');

      const steps = workflow.steps as any as WorkflowStep[];
      const currentUpdatingStep = steps.find(s => s.name === stepName);
      let newCurrentStepId = workflow.currentStepId;

      // If the step being updated is completed, advance currentStepId to the next step in order
      if (currentUpdatingStep && status === 'completed') {
        const nextStep = steps.find(s => s.order === currentUpdatingStep.order + 1);
        if (nextStep) {
          newCurrentStepId = nextStep.id;
        }
      }

      const updatedSteps = steps.map(step => {
        return step.name === stepName ? { ...step, status } : step;
      });

      await db.update(workflows)
        .set({ steps: updatedSteps, currentStepId: newCurrentStepId })
        .where(eq(workflows.id, workflowId));

      return { error: null };
    } catch (error: any) {
      console.error('[WorkflowService] updateStepStatus Error:', error.message);
      return { error };
    }
  },

  /**
   * Marks a workflow as completed.
   */
  async completeWorkflow(db: DbClient, workflowId: string): Promise<{ error: Error | null }> {
    try {
      await db.update(workflows)
        .set({ 
          status: 'completed',
          completedAt: new Date()
        })
        .where(eq(workflows.id, workflowId));

      return { error: null };
    } catch (error: any) {
      console.error('[WorkflowService] completeWorkflow Error:', error.message);
      return { error };
    }
  },

  /**
   * Resets a workflow to its initial state for a retry.
   */
  async resetWorkflow(db: DbClient, workflowId: string): Promise<{ error: Error | null }> {
    try {
      const workflow = await db.query.workflows.findFirst({
        where: eq(workflows.id, workflowId)
      });

      if (!workflow) throw new Error('Workflow not found');

      const steps = workflow.steps as any as WorkflowStep[];
      const resetSteps = steps.map(step => ({ ...step, status: 'pending' as const }));
      
      // Find the ID of the first step (order 1)
      const firstStepId = steps.find(s => s.order === 1)?.id || workflow.currentStepId;

      await db.update(workflows)
        .set({ 
          status: 'active',
          currentStepId: firstStepId,
          steps: resetSteps,
          completedAt: null 
        })
        .where(eq(workflows.id, workflowId));

      return { error: null };
    } catch (error: any) {
      console.error('[WorkflowService] resetWorkflow Error:', error.message);
      return { error };
    }
  }
};