/**
 * BackupService — backup and restore orchestration.
 */

import type Realm from 'realm'

import { databaseManager } from '../database/database-manager'

export class BackupService {
  async createBackup(targetPath?: string): Promise<string> {
    if (!databaseManager.isOpen) {
      await databaseManager.open()
    }
    return databaseManager.backup(targetPath)
  }

  async restoreFromBackup(sourcePath: string): Promise<Realm> {
    return databaseManager.restore(sourcePath)
  }

  getBackupsDirectory(): string {
    return databaseManager.getBackupsDirectory()
  }
}
