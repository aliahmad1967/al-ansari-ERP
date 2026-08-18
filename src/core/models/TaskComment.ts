import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'

export interface TaskCommentInput {
  taskId: string
  projectId: string
  authorId: string
  content: string
  contentAr?: string
}

export class TaskComment extends Realm.Object<TaskComment> {
  declare _id: string
  declare taskId: string
  declare projectId: string
  declare authorId: string
  declare content: string
  declare contentAr: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  static schema: Realm.ObjectSchema = {
    name: 'TaskComment',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      taskId: { type: 'string', indexed: true },
      projectId: { type: 'string', indexed: true },
      authorId: { type: 'string', indexed: true },
      content: 'string',
      contentAr: { type: 'string', optional: true },
    },
  }
}

export type TaskCommentEntity = TaskComment & SoftDeletableEntityFields
