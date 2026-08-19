/**
 * WorkflowStepRepository — persistence for workflow steps.
 */

import { WorkflowStep, type WorkflowStepInput } from '../models/WorkflowStep'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WorkflowStepRepository extends BaseRepository<WorkflowStep, WorkflowStepInput> {
  protected get objectType(): string {
    return 'WorkflowStep'
  }

  protected get modelClass(): ModelConstructor<WorkflowStep> {
    return WorkflowStep
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      definitionId: required('Definition id'),
      orderNumber: required('Order number'),
      name: required('Name'),
      approverType: required('Approver type'),
    })
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: values['name'] !== undefined ? required('Name') : undefined,
      approverType: values['approverType'] !== undefined ? required('Approver type') : undefined,
    })
  }

  findByDefinition(definitionId: string, options: FindOptions = {}): WorkflowStep[] {
    return this.query('definitionId == $0', [definitionId], {
      ...options,
      sortBy: 'orderNumber',
      sortAscending: true,
    })
  }

  findByDefinitionAndOrder(definitionId: string, orderNumber: number): WorkflowStep | null {
    return this.first('definitionId == $0 AND orderNumber == $1', [definitionId, orderNumber])
  }

  findNextStep(definitionId: string, currentOrder: number): WorkflowStep | null {
    return this.first('definitionId == $0 AND orderNumber > $1', [definitionId, currentOrder], {
      sortBy: 'orderNumber',
      sortAscending: true,
    })
  }

  findFirstStep(definitionId: string): WorkflowStep | null {
    return this.first('definitionId == $0', [definitionId], {
      sortBy: 'orderNumber',
      sortAscending: true,
    })
  }

  countByDefinition(definitionId: string): number {
    return this.countQuery('definitionId == $0', [definitionId])
  }
}
