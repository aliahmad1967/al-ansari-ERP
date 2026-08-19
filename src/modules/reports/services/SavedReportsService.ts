import type { SavedReport, SavedReportInput } from '../types/report.types'

const STORAGE_KEY = 'erp_saved_reports'

function loadReports(): SavedReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown[] = JSON.parse(raw)
    return parsed.map((item) => {
      const obj = item as Record<string, unknown>
      return {
        _id: String(obj._id),
        name: String(obj.name),
        reportId: String(obj.reportId),
        module: obj.module as SavedReport['module'],
        filters: (obj.filters as Record<string, string | number | boolean>) ?? {},
        createdAt: new Date(String(obj.createdAt)),
        updatedAt: new Date(String(obj.updatedAt)),
        isDeleted: Boolean(obj.isDeleted),
        deletedAt: obj.deletedAt ? new Date(String(obj.deletedAt)) : null,
      }
    })
  } catch {
    return []
  }
}

function saveReports(reports: SavedReport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

function newId(): string {
  return `sr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export class SavedReportsService {
  findAll(): SavedReport[] {
    return loadReports().filter((r) => !r.isDeleted)
  }

  findById(id: string): SavedReport | null {
    return loadReports().find((r) => r._id === id && !r.isDeleted) ?? null
  }

  findByModule(module: string): SavedReport[] {
    return loadReports().filter((r) => r.module === module && !r.isDeleted)
  }

  create(input: SavedReportInput): SavedReport {
    const reports = loadReports()
    const now = new Date()
    const report: SavedReport = {
      _id: newId(),
      name: input.name,
      reportId: input.reportId,
      module: input.module,
      filters: input.filters,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      deletedAt: null,
    }
    reports.push(report)
    saveReports(reports)
    return report
  }

  update(id: string, changes: Partial<SavedReportInput>): SavedReport | null {
    const reports = loadReports()
    const index = reports.findIndex((r) => r._id === id && !r.isDeleted)
    if (index === -1) return null
    const existing = reports[index]
    if (!existing) return null
    const updated: SavedReport = {
      _id: existing._id,
      name: changes.name ?? existing.name,
      reportId: changes.reportId ?? existing.reportId,
      module: changes.module ?? existing.module,
      filters: changes.filters ?? existing.filters,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      isDeleted: existing.isDeleted,
      deletedAt: existing.deletedAt,
    }
    reports[index] = updated
    saveReports(reports)
    return updated
  }

  delete(id: string): boolean {
    const reports = loadReports()
    const index = reports.findIndex((r) => r._id === id)
    if (index === -1) return false
    const existing = reports[index]
    if (!existing) return false
    const deleted: SavedReport = {
      _id: existing._id,
      name: existing.name,
      reportId: existing.reportId,
      module: existing.module,
      filters: existing.filters,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      isDeleted: true,
      deletedAt: new Date(),
    }
    reports[index] = deleted
    saveReports(reports)
    return true
  }
}

export const savedReportsService = new SavedReportsService()
