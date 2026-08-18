import { Timesheet, type TimesheetInput, type TimesheetStatusValue } from '../models/Timesheet'
import { validateFields, required, type ValidationIssue } from '../utils/validation'
import { BaseRepository, type FindOptions, type ModelConstructor } from './BaseRepository'

export class TimesheetRepository extends BaseRepository<Timesheet, TimesheetInput> {
  protected get objectType(): string {
    return 'Timesheet'
  }

  protected get modelClass(): ModelConstructor<Timesheet> {
    return Timesheet
  }

  protected validateCreate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateTimesheetFields(values)
  }

  protected validateUpdate(values: Record<string, unknown>): ValidationIssue[] {
    return this.validateTimesheetFields(values)
  }

  private validateTimesheetFields(values: Record<string, unknown>): ValidationIssue[] {
    return validateFields(values, {
      projectId: required('Project'),
      employeeId: required('Employee'),
      date: required('Date'),
      hours: required('Hours'),
    })
  }

  findByProject(projectId: string, options: FindOptions = {}): Timesheet[] {
    return this.query('projectId == $0', [projectId], { ...options, sortBy: options.sortBy ?? 'date', sortAscending: false })
  }

  findByEmployee(employeeId: string, options: FindOptions = {}): Timesheet[] {
    return this.query('employeeId == $0', [employeeId], options)
  }

  findByTask(taskId: string, options: FindOptions = {}): Timesheet[] {
    return this.query('taskId == $0', [taskId], options)
  }

  findByStatus(status: TimesheetStatusValue, options: FindOptions = {}): Timesheet[] {
    return this.query('status == $0', [status], options)
  }

  findByDateRange(startDate: Date, endDate: Date, options: FindOptions = {}): Timesheet[] {
    return this.query('date >= $0 AND date <= $1', [startDate, endDate], options)
  }

  findByProjectAndDateRange(projectId: string, startDate: Date, endDate: Date, options: FindOptions = {}): Timesheet[] {
    return this.query('projectId == $0 AND date >= $1 AND date <= $2', [projectId, startDate, endDate], options)
  }

  findByEmployeeAndDateRange(employeeId: string, startDate: Date, endDate: Date, options: FindOptions = {}): Timesheet[] {
    return this.query('employeeId == $0 AND date >= $1 AND date <= $2', [employeeId, startDate, endDate], options)
  }

  sumHoursByProject(projectId: string, options: FindOptions = {}): number {
    const items = this.findByProject(projectId, options)
    return items.reduce((sum, t) => sum + t.hours, 0)
  }

  sumHoursByEmployee(employeeId: string, options: FindOptions = {}): number {
    const items = this.findByEmployee(employeeId, options)
    return items.reduce((sum, t) => sum + t.hours, 0)
  }
}
