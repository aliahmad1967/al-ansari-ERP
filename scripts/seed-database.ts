/**
 * seed-database — seeds the default database (default path) with development
 * data. Safe to run repeatedly; seeding is skipped when data already exists.
 */

import { databaseManager } from '../src/core/database/database-manager'
import { Realm } from '../src/core/database/realm'

async function main(): Promise<void> {
  const realm = await databaseManager.open({ seed: true })
  const result = databaseManager.seedResult
  if (result?.seeded) {
    console.log('Database seeded:')
    console.log(`  organizations: ${result.summary.organizations}`)
    console.log(`  branches:      ${result.summary.branches}`)
    console.log(`  departments:   ${result.summary.departments}`)
    console.log(`  permissions:   ${result.summary.permissions}`)
    console.log(`  roles:         ${result.summary.roles}`)
    console.log(`  users:         ${result.summary.users}`)
    console.log(`  notifications: ${result.summary.notifications}`)
    console.log(`  audit entries: ${result.summary.auditEntries}`)
  } else {
    console.log('Database already contains data; seeding skipped.')
  }
  console.log(`Database path: ${realm.path}`)
  databaseManager.close()
  Realm.shutdown()
  process.exit(0)
}

main().catch((error) => {
  console.error('Seeding failed:', error)
  process.exit(1)
})
