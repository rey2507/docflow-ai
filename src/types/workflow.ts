import { DocumentStatus } from './document';

export type WorkflowPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: string;
}

export interface Workflow {
  id: string;
  documentId: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled' | 'failed';
  priority: WorkflowPriority;
  currentStepId: string;
  steps: WorkflowStep[];
  startedAt: Date | null;
  completedAt?: Date | null;
}