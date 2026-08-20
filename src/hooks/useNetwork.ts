import { useSyncExternalStore } from 'react'

import {
  getNetworkState,
  subscribeNetwork,
  checkConnectivity,
  preflightCheck,
  type NetworkState,
} from '@/stores/network.store'

/**
 * React hook that exposes the current network connectivity state.
 *
 * Uses the browser's `navigator.onLine` API, online/offline events,
 * and periodic preflight checks to provide accurate connectivity status.
 * Realm data remains fully accessible regardless of network state — this
 * hook is purely for UI feedback (offline indicator, etc.).
 */
export function useNetwork(): NetworkState & {
  recheck: () => boolean
  preflight: () => Promise<boolean>
} {
  const state = useSyncExternalStore(subscribeNetwork, getNetworkState)

  return {
    ...state,
    recheck: checkConnectivity,
    preflight: preflightCheck,
  }
}
