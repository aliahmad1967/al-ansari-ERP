import { describe, it, expect } from 'vitest'
import {
  calculateEmployeePayroll,
  batchCalculatePayroll,
} from '@/modules/hr/services/PayrollCalculationEngine'

function makeSalary(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'sal-001',
    employeeId: 'emp-001',
    structureId: 'struct-001',
    basicSalary: 10000,
    currency: 'SAR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
    ...overrides,
  } as never
}

function makeComponent(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'comp-001',
    structureId: 'struct-001',
    code: 'HOUSING',
    name: 'Housing Allowance',
    nameAr: 'بدل سكن',
    type: 'earning',
    calculationType: 'percentage',
    defaultValue: 25,
    percentageOf: 'basic_only',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
    ...overrides,
  } as never
}

function makeSalaryItem(overrides: Record<string, unknown> = {}) {
  return {
    _id: 'si-001',
    employeeSalaryId: 'sal-001',
    componentId: 'comp-001',
    amount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    deletedAt: null,
    ...overrides,
  } as never
}

describe('PayrollCalculationEngine', () => {
  describe('calculateEmployeePayroll', () => {
    it('calculates basic salary only when no components', () => {
      const result = calculateEmployeePayroll(makeSalary(), [], [])
      expect(result.basicSalary).toBe(10000)
      expect(result.totalEarnings).toBe(0)
      expect(result.totalDeductions).toBe(0)
      expect(result.netPay).toBe(10000)
      expect(result.currency).toBe('SAR')
    })

    it('calculates percentage-based earning component', () => {
      const salary = makeSalary({ basicSalary: 10000 })
      const component = makeComponent({
        code: 'HOUSING',
        name: 'Housing',
        type: 'earning',
        calculationType: 'percentage',
        defaultValue: 25,
        percentageOf: 'basic_only',
      })
      const result = calculateEmployeePayroll(salary, [component], [])
      expect(result.totalEarnings).toBe(2500)
      expect(result.netPay).toBe(12500)
    })

    it('calculates fixed earning component', () => {
      const salary = makeSalary({ basicSalary: 10000 })
      const component = makeComponent({
        code: 'TRANSPORT',
        name: 'Transport',
        type: 'earning',
        calculationType: 'fixed',
        defaultValue: 500,
      })
      const result = calculateEmployeePayroll(salary, [component], [])
      expect(result.totalEarnings).toBe(500)
      expect(result.netPay).toBe(10500)
    })

    it('calculates deduction component', () => {
      const salary = makeSalary({ basicSalary: 10000 })
      const component = makeComponent({
        _id: 'comp-ded',
        code: 'GOSI',
        name: 'GOSI',
        type: 'deduction',
        calculationType: 'percentage',
        defaultValue: 11,
        percentageOf: 'basic_only',
        sortOrder: 1,
      })
      const result = calculateEmployeePayroll(salary, [component], [])
      expect(result.totalDeductions).toBe(1100)
      expect(result.netPay).toBe(8900)
    })

    it('uses employee override amount when provided', () => {
      const salary = makeSalary({ basicSalary: 10000 })
      const component = makeComponent({
        code: 'BONUS',
        name: 'Bonus',
        type: 'earning',
        calculationType: 'percentage',
        defaultValue: 10,
        percentageOf: 'basic_only',
      })
      const item = makeSalaryItem({ componentId: 'comp-001', amount: 2000 })
      const result = calculateEmployeePayroll(salary, [component], [item])
      expect(result.totalEarnings).toBe(2000)
      expect(result.netPay).toBe(12000)
    })

    it('handles empty component list', () => {
      const result = calculateEmployeePayroll(makeSalary(), [], [])
      expect(result.lines).toHaveLength(0)
      expect(result.netPay).toBe(10000)
    })

    it('skips inactive components', () => {
      const salary = makeSalary({ basicSalary: 10000 })
      const component = makeComponent({ isActive: false })
      const result = calculateEmployeePayroll(salary, [component], [])
      expect(result.lines).toHaveLength(0)
      expect(result.totalEarnings).toBe(0)
    })
  })

  describe('batchCalculatePayroll', () => {
    it('calculates payroll for multiple employees', () => {
      const assignments = [
        {
          salary: makeSalary({ employeeId: 'emp-001', basicSalary: 10000 }),
          components: [],
          salaryItems: [],
        },
        {
          salary: makeSalary({ employeeId: 'emp-002', basicSalary: 15000 }),
          components: [],
          salaryItems: [],
        },
      ]
      const result = batchCalculatePayroll(assignments)
      expect(result.employeeCount).toBe(2)
      expect(result.totalNet).toBe(25000)
      expect(result.results).toHaveLength(2)
    })

    it('returns zero counts for empty array', () => {
      const result = batchCalculatePayroll([])
      expect(result.employeeCount).toBe(0)
      expect(result.totalGross).toBe(0)
      expect(result.totalNet).toBe(0)
    })

    it('aggregates totals correctly', () => {
      const assignments = [
        {
          salary: makeSalary({ employeeId: 'emp-001', basicSalary: 10000 }),
          components: [],
          salaryItems: [],
        },
      ]
      const result = batchCalculatePayroll(assignments)
      expect(result.totalGross).toBe(10000)
      expect(result.totalDeductions).toBe(0)
      expect(result.totalNet).toBe(10000)
    })
  })
})
