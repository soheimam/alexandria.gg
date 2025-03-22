import { createConfig, http } from 'wagmi'
import { base } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create wagmi config
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http()
  }
})

// Create a client
export const queryClient = new QueryClient()
