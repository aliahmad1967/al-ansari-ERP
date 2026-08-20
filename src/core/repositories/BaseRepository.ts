/**
 * BaseRepository — generic CRUD over a Realm object type.
 *
 * All database access flows through repositories:
 *
 *   UI → hooks → services → repositories → Realm
 *
 * Every write runs inside a transaction (see {@link withTransaction}) and every
 * create/update passes through the subclass validation hook.
 */

import Realm from 'realm'

import { getActiveRealm } from '../database/realm'
import { withTransaction } from '../database/transactions'
import { DatabaseError, DatabaseErrorCode } from '../database/errors'
import { newEntityId, touchedFields, type BaseEntityFields } from '../models/base'
import { throwIfInvalid, type ValidationIssue } from '../utils/validation'

/**
 * Constructor shape of a Realm model class. Mirrors Realm's own `Constructor`
 * type (`new (...args: any) => T`). The `any` rest parameter is required so
 * every concrete model class — whose constructor parameters are unknown to
 * this generic — is assignable; Realm never invokes it with our arguments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ModelConstructor<T extends Realm.AnyRealmObject> = new (...args: any) => T

export interface FindOptions {
  /** Include soft-deleted records in results. */
  includeDeleted?: boolean
  /** Sort field (must exist on the model). */
  sortBy?: string
  /** Sort direction, default ascending. */
  sortAscending?: boolean
  /** Number of records to skip. */
  offset?: number
  /** Maximum number of records to return. */
  limit?: number
}

export interface CountOptions {
  includeDeleted?: boolean
}

export interface EntityRecord extends BaseEntityFields {
  _id: string
  isDeleted: boolean
  deletedAt: Date | null
}

/**
 * Generic repository base. Subclasses provide the Realm object type and the
 * validation hooks; everything else is inherited.
 */
export abstract class BaseRepository<TModel extends Realm.AnyRealmObject, TInput extends object> {
  /** Realm schema name of the managed object type. */
  protected abstract get objectType(): string

  /** The model class used for typed create/query calls. */
  protected abstract get modelClass(): ModelConstructor<TModel>

  /** True when the model supports soft-delete (all except audit logs). */
  protected get supportsSoftDelete(): boolean {
    return true
  }

  /** Validation hook for `create` input. */
  protected validateCreate?(values: Record<string, unknown>): ValidationIssue[]

  /** Validation hook for `update` input. */
  protected validateUpdate?(values: Record<string, unknown>): ValidationIssue[]

  protected getRealm(): Realm {
    return getActiveRealm()
  }

  protected isSoftDeleted(object: TModel): boolean {
    if (!this.supportsSoftDelete) return false
    return (object as unknown as { isDeleted?: boolean }).isDeleted === true
  }

  /** Drops keys whose value is `undefined` so Realm never rejects them. */
  protected sanitizeValues(values: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined))
  }

  /** Runs the create-validation hook and throws on failure. */
  protected runCreateValidation(values: Record<string, unknown>): void {
    const issues = this.validateCreate ? this.validateCreate(values) : []
    throwIfInvalid(issues, {
      operation: `${this.objectType}.create`,
      resourceType: this.objectType,
    })
  }

  /** Runs the update-specific validation hook. */
  protected runUpdateValidation(values: Record<string, unknown>): void {
    const issues = this.validateUpdate ? this.validateUpdate(values) : []
    throwIfInvalid(issues, {
      operation: `${this.objectType}.update`,
      resourceType: this.objectType,
    })
  }

  /** Executes a predicate query with optional sorting/pagination. */
  protected query(predicate: string | null, args: unknown[], options: FindOptions = {}): TModel[] {
    const realm = this.getRealm()
    let results = realm.objects(this.modelClass)
    if (this.supportsSoftDelete && !options.includeDeleted) {
      results = results.filtered('isDeleted == false')
    }
    if (predicate) {
      results = results.filtered(predicate, ...args)
    }
    if (options.sortBy) {
      results = results.sorted(options.sortBy, options.sortAscending ?? true)
    }
    const hasPagination = options.offset !== undefined || options.limit !== undefined
    if (hasPagination) {
      const start = options.offset ?? 0
      const end = options.limit !== undefined ? start + options.limit : undefined
      return Array.from(results.slice(start, end))
    }
    return Array.from(results)
  }

  /** Returns the first match of a predicate query, if any. */
  protected first(
    predicate: string | null,
    args: unknown[],
    options: FindOptions = {},
  ): TModel | null {
    return this.query(predicate, args, { ...options, limit: 1 })[0] ?? null
  }

  /** Counts records matching a predicate. */
  protected countQuery(
    predicate: string | null,
    args: unknown[],
    options: CountOptions = {},
  ): number {
    const realm = this.getRealm()
    let results = realm.objects(this.modelClass)
    if (this.supportsSoftDelete && !options.includeDeleted) {
      results = results.filtered('isDeleted == false')
    }
    if (predicate) {
      results = results.filtered(predicate, ...args)
    }
    return results.length
  }

  /** Creates a record inside a write transaction. */
  create(input: TInput & { _id?: string }): TModel {
    const realm = this.getRealm()
    const values: Record<string, unknown> = { ...input }
    values._id = input._id ?? newEntityId()
    values.createdAt = new Date()
    values.updatedAt = new Date()
    if (this.supportsSoftDelete) {
      values.isDeleted = false
      values.deletedAt = null
    }
    this.runCreateValidation(this.sanitizeValues(values))
    const payload = this.sanitizeValues(values)
    return withTransaction(realm, () =>
      realm.create(this.modelClass, payload as unknown as Partial<Realm.Unmanaged<TModel>>),
    )
  }

  /** Finds a record by primary key (soft-deleted excluded by default). */
  findById(id: string, options: FindOptions = {}): TModel | null {
    const object = this.findByIdIncludingDeleted(id)
    if (!object) return null
    if (!options.includeDeleted && this.isSoftDeleted(object)) return null
    return object
  }

  /** Finds a record by primary key including soft-deleted records. */
  findByIdIncludingDeleted(id: string): TModel | null {
    // `id` is cast to the model's key type because Realm's typed overload
    // requires `T[keyof T]` and a generic `TModel` cannot prove that `string`
    // is one of its key types.
    return this.getRealm().objectForPrimaryKey<TModel>(this.modelClass, id as TModel[keyof TModel])
  }

  /** Returns all records with optional sorting and pagination. */
  findAll(options: FindOptions = {}): TModel[] {
    return this.query(null, [], options)
  }

  /** Updates a record using Realm `UpdateMode.Modified`. */
  update(id: string, changes: Partial<TInput>): TModel {
    const existing = this.findByIdIncludingDeleted(id)
    if (!existing) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_NOT_FOUND,
        `No ${this.objectType} found with id "${id}".`,
        {
          context: {
            operation: `${this.objectType}.update`,
            resourceType: this.objectType,
            resourceId: id,
          },
        },
      )
    }
    const existingValues = { ...existing } as Record<string, unknown>
    const values: Record<string, unknown> = {
      ...existingValues,
      ...changes,
      _id: id,
      ...touchedFields(),
    }
    this.runUpdateValidation(this.sanitizeValues(values))
    const payload = this.sanitizeValues({ ...changes, _id: id, ...touchedFields() })
    withTransaction(this.getRealm(), () =>
      this.getRealm().create(
        this.modelClass,
        payload as unknown as Partial<Realm.Unmanaged<TModel>>,
        Realm.UpdateMode.Modified,
      ),
    )
    const updated = this.findByIdIncludingDeleted(id)
    if (!updated) {
      throw new DatabaseError(
        DatabaseErrorCode.DB_NOT_FOUND,
        `No ${this.objectType} found with id "${id}".`,
        {
          context: {
            operation: `${this.objectType}.update`,
            resourceType: this.objectType,
            resourceId: id,
          },
        },
      )
    }
    return updated
  }

  /** Hard-deletes a record. Returns `false` when nothing was deleted. */
  delete(id: string): boolean {
    const object = this.findByIdIncludingDeleted(id)
    if (!object) return false
    withTransaction(this.getRealm(), () => this.getRealm().delete(object))
    return true
  }

  /** Soft-deletes a record (hard-deletes for models without soft-delete). */
  softDelete(id: string): boolean {
    if (!this.supportsSoftDelete) return this.delete(id)
    const object = this.findByIdIncludingDeleted(id)
    if (!object) return false
    if (this.isSoftDeleted(object)) return false
    const payload = {
      _id: id,
      isDeleted: true,
      deletedAt: new Date(),
      ...touchedFields(),
    } as unknown as Partial<Realm.Unmanaged<TModel>>
    withTransaction(this.getRealm(), () =>
      this.getRealm().create(this.modelClass, payload, Realm.UpdateMode.Modified),
    )
    return true
  }

  /** Restores a soft-deleted record. */
  restore(id: string): boolean {
    if (!this.supportsSoftDelete) return false
    const object = this.findByIdIncludingDeleted(id)
    if (!object) return false
    if (!this.isSoftDeleted(object)) return false
    const payload = {
      _id: id,
      isDeleted: false,
      deletedAt: null,
      ...touchedFields(),
    } as unknown as Partial<Realm.Unmanaged<TModel>>
    withTransaction(this.getRealm(), () =>
      this.getRealm().create(this.modelClass, payload, Realm.UpdateMode.Modified),
    )
    return true
  }

  /** True when a record with `id` exists. */
  exists(id: string): boolean {
    return this.findByIdIncludingDeleted(id) !== null
  }

  /** Number of records (soft-deleted excluded by default). */
  count(options: CountOptions = {}): number {
    return this.countQuery(null, [], options)
  }
}
