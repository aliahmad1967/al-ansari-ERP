/**
 * WorkflowDefinitionRepository — persistence for workflow definitions.
 */

import {
  WorkflowDefinition,
  type WorkflowDefinitionInput,
} from '../models/WorkflowDefinition'
import { maxLength, required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class WorkflowDefinitionRepository extends BaseRepository<
  WorkflowDefinition,
  WorkflowDefinitionInput
> {
  protected get objectType(): string {
    return 'WorkflowDefinition'
  }

  protected get modelClass(): ModelConstructor<WorkflowDefinition> {
    return WorkflowDefinition
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: required('Name'),
      entityType: required('Entity type'),
      nameAr: maxLength('Arabic name', 256),
      description: maxLength('Description', 1024),
      descriptionAr: maxLength('Arabic description', 1024),
    })
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: values['name'] !== undefined ? required('Name') : undefined,
      entityType: values['entityType'] !== undefined ? required('Entity type') : undefined,
      nameAr: maxLength('Arabic name', 256),
      description: maxLength('Description', 1024),
      descriptionAr: maxLength('Arabic description', 1024),
    })
  }

  findByEntityType(entityType: string, options: FindOptions = {}): WorkflowDefinition[] {
    return this.query('entityType == $0 AND isActive == true', [entityType], options)
  }

  findActive(options: FindOptions = {}): WorkflowDefinition[] {
    return this.query('isActive == true', [], options)
  }

  findByName(name: string): WorkflowDefinition | null {
    return this.first('name == $0', [name])
  }
}
