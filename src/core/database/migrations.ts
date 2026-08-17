/**
 * Schema versioning and migration architecture.
 *
 * Every schema change increments {@link CURRENT_SCHEMA_VERSION} and adds a
 * {@link MigrationStep} to {@link MIGRATIONS}. Realm invokes the migration
 * callback inside its own write transaction before the database becomes
 * available, so steps only transform data between two known versions.
 */

import type Realm from 'realm'

import { DatabaseErrorCode, toDatabaseError } from './errors'

/** The current schema version. Bump this when {@link MIGRATIONS} grows. */
export const CURRENT_SCHEMA_VERSION = 5

export interface MigrationStep {
  /** The schema version this step produces. */
  toVersion: number
  /** Transforms data from the previous version to `toVersion`. */
  migrate: (oldRealm: Realm, newRealm: Realm) => void
}

/**
 * Ordered migration steps. v1 introduces the initial schema; v2 adds the
 * Position model for organization management.
 */
export const MIGRATIONS: MigrationStep[] = [
  {
    toVersion: 1,
    migrate: () => {
      // Initial schema — nothing to transform yet.
    },
  },
  {
    toVersion: 2,
    migrate: () => {
      // v2 adds the Position model. Realm handles schema additions
      // automatically; no data transformation is required.
    },
  },
  {
    toVersion: 3,
    migrate: () => {
      // v3 adds HR models: Employee, EmploymentContract, EmployeeDocument,
      // EmergencyContact, Education, Experience, Skill.
    },
  },
  {
    toVersion: 4,
    migrate: () => {
      // v4 adds attendance & leave models: Shift, AttendanceRecord,
      // LeaveType, LeaveBalance, LeaveRequest, LeaveApproval.
    },
  },
  {
    toVersion: 5,
    migrate: () => {
      // v5 adds payroll models: SalaryStructure, SalaryComponent,
      // EmployeeSalary, EmployeeSalaryItem, PayrollPeriod, PayrollRun,
      // PayrollItem, PayrollLineItem, Payslip.
    },
  },
]

/** True when the file at `path` requires a migration to the current version. */
export function requiresMigration(schemaVersion: number): boolean {
  return schemaVersion >= 0 && schemaVersion < CURRENT_SCHEMA_VERSION
}

/**
 * Builds the Realm `onMigration` callback that replays every pending step.
 * Fails atomically: if any step throws, the whole migration is aborted and the
 * database remains untouched.
 */
export function buildMigrationCallback(): Realm.MigrationCallback {
  return (oldRealm, newRealm) => {
    const fromVersion = oldRealm.schemaVersion
    if (!requiresMigration(fromVersion)) return

    try {
      for (const step of MIGRATIONS) {
        if (step.toVersion > fromVersion) {
          step.migrate(oldRealm, newRealm)
        }
      }
    } catch (error) {
      throw toDatabaseError(
        error,
        DatabaseErrorCode.DB_MIGRATION_FAILED,
        `Failed to migrate database from schema v${fromVersion} to v${CURRENT_SCHEMA_VERSION}.`,
        { operation: 'database.migrate', path: oldRealm.path },
      )
    }
  }
}
