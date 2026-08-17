import { Category, type CategoryInput } from '../models/Category'
import { required, validateFields, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class CategoryRepository extends BaseRepository<Category, CategoryInput> {
  protected get objectType(): string {
    return 'Category'
  }

  protected get modelClass(): ModelConstructor<Category> {
    return Category
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      code: required('Category code'),
      name: required('Category name'),
    })
  }

  findByParent(parentId: string, options: FindOptions = {}): Category[] {
    return this.query('parentId == $0', [parentId], options)
  }

  findRootCategories(options: FindOptions = {}): Category[] {
    return this.query('parentId == null OR parentId == ""', [], options)
  }

  findActive(options: FindOptions = {}): Category[] {
    return this.query('isActive == true', [], options)
  }
}
