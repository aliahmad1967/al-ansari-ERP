/**
 * WorkflowDefinition — configurable approval workflow template.
 *
 * Each definition describes an approval chain for a specific entity type
 * (e.g., PurchaseRequest, SalesOrder). Definitions contain ordered steps
 * that define who must approve at each level.
 */

import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface WorkflowDefinitionInput {
  name: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  entityType: string
  isActive?: boolean
}

export interface WorkflowDefinitionUpdate {
  name?: string
  nameAr?: string
  description?: string
  descriptionAr?: string
  entityType?: string
  isActive?: boolean
}

export class WorkflowDefinition extends Realm.Object<WorkflowDefinition> {
  declare _id: string
  declare name: string
  declare nameAr: string | null
  declare description: string | null
  declare descriptionAr: string | null
  declare entityType: string
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'WorkflowDefinition',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      name: { type: 'string', indexed: true },
      nameAr: { type: 'string', optional: true },
      description: { type: 'string', optional: true },
      descriptionAr: { type: 'string', optional: true },
      entityType: { type: 'string', indexed: true },
      isActive: { type: 'bool', default: true },
    },
  }
}

export type WorkflowDefinitionEntity = WorkflowDefinition & SoftDeletableEntityFields
