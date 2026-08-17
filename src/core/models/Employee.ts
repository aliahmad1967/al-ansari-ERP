import Realm from 'realm'

import { BASE_PROPERTIES, SOFT_DELETE_PROPERTIES, type SoftDeletableEntityFields } from './base'
import { EmployeeStatus, type EmployeeStatusValue } from './EmployeeStatus'

export { EmployeeStatus, type EmployeeStatusValue } from './EmployeeStatus'

export interface EmployeeInput {
  employeeNumber: string
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  email: string
  phone?: string
  dateOfBirth?: Date
  gender?: string
  nationality?: string
  nationalId?: string
  maritalStatus?: string
  address?: string
  city?: string
  country?: string
  photoUrl?: string
  organizationId?: string
  branchId?: string
  departmentId?: string
  positionId?: string
  managerId?: string
  employmentDate: Date
  terminationDate?: Date
  status?: EmployeeStatusValue
  notes?: string
}

export class Employee extends Realm.Object<Employee> {
  declare _id: string
  declare employeeNumber: string
  declare firstName: string
  declare lastName: string
  declare firstNameAr: string | null
  declare lastNameAr: string | null
  declare email: string
  declare phone: string | null
  declare dateOfBirth: Date | null
  declare gender: string | null
  declare nationality: string | null
  declare nationalId: string | null
  declare maritalStatus: string | null
  declare address: string | null
  declare city: string | null
  declare country: string | null
  declare photoUrl: string | null
  declare organizationId: string | null
  declare branchId: string | null
  declare departmentId: string | null
  declare positionId: string | null
  declare managerId: string | null
  declare employmentDate: Date
  declare terminationDate: Date | null
  declare status: EmployeeStatusValue
  declare notes: string | null
  declare createdAt: Date
  declare updatedAt: Date
  declare isDeleted: boolean
  declare deletedAt: Date | null

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get fullNameAr(): string {
    return `${this.firstNameAr ?? ''} ${this.lastNameAr ?? ''}`.trim()
  }

  static schema: Realm.ObjectSchema = {
    name: 'Employee',
    primaryKey: '_id',
    properties: {
      ...BASE_PROPERTIES,
      ...SOFT_DELETE_PROPERTIES,
      employeeNumber: { type: 'string', indexed: true },
      firstName: 'string',
      lastName: 'string',
      firstNameAr: { type: 'string', optional: true },
      lastNameAr: { type: 'string', optional: true },
      email: { type: 'string', indexed: true },
      phone: { type: 'string', optional: true },
      dateOfBirth: { type: 'date', optional: true },
      gender: { type: 'string', optional: true },
      nationality: { type: 'string', optional: true },
      nationalId: { type: 'string', optional: true },
      maritalStatus: { type: 'string', optional: true },
      address: { type: 'string', optional: true },
      city: { type: 'string', optional: true },
      country: { type: 'string', optional: true },
      photoUrl: { type: 'string', optional: true },
      organizationId: { type: 'string', optional: true, indexed: true },
      branchId: { type: 'string', optional: true, indexed: true },
      departmentId: { type: 'string', optional: true, indexed: true },
      positionId: { type: 'string', optional: true, indexed: true },
      managerId: { type: 'string', optional: true, indexed: true },
      employmentDate: { type: 'date' },
      terminationDate: { type: 'date', optional: true },
      status: { type: 'string', default: EmployeeStatus.Active },
      notes: { type: 'string', optional: true },
    },
  }
}

export type EmployeeEntity = Employee & SoftDeletableEntityFields
