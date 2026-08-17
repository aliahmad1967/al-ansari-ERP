/**
 * reset-database — DESTRUCTIVE. Deletes the database file and all data.
 *
 * Hard guards (enforced in code):
 *  - requires the confirmation token,
 *  - refuses to run when NODE_ENV=production unless `--allow-in-production`.
 *
 * Usage:
 *   npm run database:reset -- --confirm=RESET
 */

import { databaseManager } from '../src/core/database/database-manager'
import { DatabaseErrorCode, isDatabaseError } from '../src/core/database/errors'
import { Realm } from '../src/core/database/realm'

function parseArgs(): { confirm?: string; allowInProduction: boolean } {
  const args = process.argv.slice(2)
  const confirmArg = args.find((arg) => arg.startsWith('--confirm='))
  return {
    confirm: confirmArg?.slice('--confirm='.length),
    allowInProduction: args.includes('--allow-in-production'),
  }
}

async function main(): Promise<void> {
  const { confirm, allowInProduction } = parseArgs()
  if (!confirm) {
    console.error('Usage: reset-database --confirm=RESET [--allow-in-production]')
    process.exit(2)
  }

  try {
    databaseManager.reset({ confirm, allowInProduction })
  } catch (error) {
    if (isDatabaseError(error) && error.code === DatabaseErrorCode.DB_RESET_BLOCKED) {
      console.error('Reset blocked:', error.message)
      process.exit(3)
    }
    throw error
  }

  console.log('Database deleted.')
  Realm.shutdown()
  process.exit(0)
}

main().catch((error) => {
  console.error('Reset failed:', error)
  process.exit(1)
})
