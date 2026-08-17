/**
 * backup-database — writes a consistent snapshot of the database to a file.
 * Pass an optional target path: `npm run database:backup -- backups\\custom.realm`
 */

import { databaseManager } from '../src/core/database/database-manager'
import { Realm } from '../src/core/database/realm'

async function main(): Promise<void> {
  const target = process.argv.find((arg) => arg.startsWith('--target='))?.slice('--target='.length)
  await databaseManager.open()
  const backupPath = databaseManager.backup(target)
  console.log(`Backup created at: ${backupPath}`)
  databaseManager.close()
  Realm.shutdown()
  process.exit(0)
}

main().catch((error) => {
  console.error('Backup failed:', error)
  process.exit(1)
})
