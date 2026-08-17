/**
 * PayrollCalculationEngine — configurable rules engine for payroll.
 *
 * No country-specific tax or legal rules are hardcoded.
 * All calculations are driven by SalaryComponent configurations.
 *
 * Calculation flow per employee:
 *   1. Start with basic salary
 *   2. Process earning components (fixed or percentage-based)
 *   3. Calculate gross = basic + total earnings
 *   4. Process deduction components (fixed or percentage-based)
 *   5. Process benefit components
 *   6. netPay = gross - total deductions
 *
 * Percentage-based components can reference:
 *   - basic_only: percentage of basic salary
 *   - total_earnings: percentage of basic + all prior earnings
 *   - gross: percentage of gross (basic + all earnings before this line)
 */

import Decimal from 'decimal.js'

import type { EmployeeSalary } from '@/core/models/EmployeeSalary'
import type { EmployeeSalaryItem } from '@/core/models/EmployeeSalaryItem'
import type { SalaryComponent, SalaryComponentPercentageBaseValue } from '@/core/models/SalaryComponent'
import {
  money,
  moneyAdd,
  moneyPercent,
  moneyRound,
  toNumber,
} from '@/core/utils/currency'

export interface CalculationLineInput {
  componentId: string
  componentCode: string
  componentName: string
  componentNameAr: string
  componentType: 'earning' | 'deduction' | 'benefit'
  baseAmount: number
  amount: number
}

export interface EmployeeCalculationResult {
  employeeId: string
  basicSalary: number
  totalEarnings: number
  totalDeductions: number
  totalBenefits: number
  netPay: number
  currency: string
  lines: CalculationLineInput[]
}

/**
 * Calculates payroll for a single employee based on their salary assignment
 * and the configured salary components.
 *
 * @param salary - The employee's active salary assignment
 * @param components - The salary components defined in the structure (sorted by sortOrder)
 * @param salaryItems - The employee-specific values for each component
 * @returns Full calculation breakdown
 */
export function calculateEmployeePayroll(
  salary: EmployeeSalary,
  components: SalaryComponent[],
  salaryItems: EmployeeSalaryItem[],
): EmployeeCalculationResult {
  const basicSalary = money(salary.basicSalary)
  const employeeSalaryItemMap = new Map<string, number>()
  for (const item of salaryItems) {
    employeeSalaryItemMap.set(item.componentId, item.amount)
  }

  const lines: CalculationLineInput[] = []
  let cumulativeEarnings = new Decimal(0)
  let gross = basicSalary.plus(0)

  const activeComponents = components
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  for (const component of activeComponents) {
    const overrideAmount = employeeSalaryItemMap.get(component._id)
    const calculated = calculateComponent(
      component,
      overrideAmount,
      basicSalary,
      cumulativeEarnings,
      gross,
    )

    if (calculated.isZero()) continue

    lines.push({
      componentId: component._id,
      componentCode: component.code,
      componentName: component.name,
      componentNameAr: component.nameAr ?? component.name,
      componentType: component.type,
      baseAmount: toNumber(getBaseAmount(component, basicSalary, cumulativeEarnings, gross)),
      amount: toNumber(calculated),
    })

    if (component.type === 'earning') {
      cumulativeEarnings = cumulativeEarnings.plus(calculated)
      gross = gross.plus(calculated)
    }
  }

  let totalEarnings = new Decimal(0)
  let totalDeductions = new Decimal(0)
  let totalBenefits = new Decimal(0)

  for (const line of lines) {
    const lineAmount = money(line.amount)
    switch (line.componentType) {
      case 'earning':
        totalEarnings = totalEarnings.plus(lineAmount)
        break
      case 'deduction':
        totalDeductions = totalDeductions.plus(lineAmount)
        break
      case 'benefit':
        totalBenefits = totalBenefits.plus(lineAmount)
        break
    }
  }

  const netPay = moneyRound(moneyAdd(basicSalary, totalEarnings, totalBenefits).minus(totalDeductions))

  return {
    employeeId: salary.employeeId,
    basicSalary: toNumber(basicSalary),
    totalEarnings: toNumber(moneyRound(totalEarnings)),
    totalDeductions: toNumber(moneyRound(totalDeductions)),
    totalBenefits: toNumber(moneyRound(totalBenefits)),
    netPay: toNumber(netPay),
    currency: salary.currency,
    lines,
  }
}

function calculateComponent(
  component: SalaryComponent,
  overrideAmount: number | undefined,
  basicSalary: Decimal,
  cumulativeEarnings: Decimal,
  gross: Decimal,
): Decimal {
  if (overrideAmount !== undefined && overrideAmount !== null) {
    return moneyRound(money(overrideAmount))
  }

  if (component.calculationType === 'fixed') {
    return moneyRound(money(component.defaultValue))
  }

  // Percentage-based
  const base = getBaseAmount(component, basicSalary, cumulativeEarnings, gross)
  return moneyRound(moneyPercent(base, component.defaultValue))
}

function getBaseAmount(
  component: SalaryComponent,
  basicSalary: Decimal,
  cumulativeEarnings: Decimal,
  gross: Decimal,
): Decimal {
  if (component.calculationType === 'fixed') {
    return new Decimal(0)
  }

  const percentageOf: SalaryComponentPercentageBaseValue = component.percentageOf ?? 'basic_only'

  switch (percentageOf) {
    case 'total_earnings':
      return basicSalary.plus(cumulativeEarnings)
    case 'gross':
      return gross
    case 'basic_only':
    default:
      return basicSalary
  }
}

/**
 * Batch calculate payroll for multiple employees.
 *
 * @param salaryAssignments - Active salary assignments with their components
 * @returns Array of per-employee results and aggregate totals
 */
export function batchCalculatePayroll(
  salaryAssignments: Array<{
    salary: EmployeeSalary
    components: SalaryComponent[]
    salaryItems: EmployeeSalaryItem[]
  }>,
): {
  results: EmployeeCalculationResult[]
  totalGross: number
  totalDeductions: number
  totalNet: number
  employeeCount: number
} {
  let totalGross = new Decimal(0)
  let totalDeductions = new Decimal(0)
  let totalNet = new Decimal(0)

  const results: EmployeeCalculationResult[] = []

  for (const assignment of salaryAssignments) {
    const result = calculateEmployeePayroll(
      assignment.salary,
      assignment.components,
      assignment.salaryItems,
    )
    results.push(result)

    totalGross = totalGross.plus(money(result.basicSalary).plus(money(result.totalEarnings)))
    totalDeductions = totalDeductions.plus(money(result.totalDeductions))
    totalNet = totalNet.plus(money(result.netPay))
  }

  return {
    results,
    totalGross: toNumber(moneyRound(totalGross)),
    totalDeductions: toNumber(moneyRound(totalDeductions)),
    totalNet: toNumber(moneyRound(totalNet)),
    employeeCount: results.length,
  }
}
