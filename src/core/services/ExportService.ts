/**
 * ExportService — full database export to JSON.
 */

import { databaseManager } from '../database/database-manager'

export class ExportService {
  async exportJson(): Promise<string> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }
    return databaseManager.exportJson()
  }

  async exportToFile(targetPath?: string): Promise<string> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }
    return databaseManager.exportToFile(targetPath)
  }
}
