import { Skill, type SkillInput, type SkillLevelValue } from '../models/Skill'
import {
  required,
  validateFields,
  type ValidationIssue,
} from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class SkillRepository extends BaseRepository<Skill, SkillInput> {
  protected get objectType(): string {
    return 'Skill'
  }

  protected get modelClass(): ModelConstructor<Skill> {
    return Skill
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      name: required('Skill name'),
      employeeId: required('Employee'),
    })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): Skill[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByLevel(level: SkillLevelValue, options: FindOptions = {}): Skill[] {
    return this.query('level == $0', [level], options)
  }

  findByCategory(category: string, options: FindOptions = {}): Skill[] {
    return this.query('category == $0', [category], options)
  }
}
