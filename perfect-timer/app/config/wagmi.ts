import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

if (!projectId) {
  console.warn('Project ID is not defined')
}

export const networks = [base, baseSepolia]

// Set up the Wagmi Adapter (Config) - SSR disabled for game app
export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig
