import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  injectedWallet,
  metaMaskWallet,
  rabbyWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { arcChain, ARC_RPC_URL, WALLETCONNECT_PROJECT_ID } from './network';

const connectors = WALLETCONNECT_PROJECT_ID
  ? connectorsForWallets(
      [
        {
          groupName: 'Recommended',
          wallets: [
            injectedWallet,
            metaMaskWallet,
            rabbyWallet,
            coinbaseWallet,
            rainbowWallet,
            walletConnectWallet,
          ],
        },
      ],
      {
        appName: 'Severe',
        projectId: WALLETCONNECT_PROJECT_ID,
      }
    )
  : [injected()];

export const wagmiConfig = createConfig({
  chains: [arcChain],
  connectors,
  transports: {
    [arcChain.id]: http(ARC_RPC_URL),
  },
  ssr: false,
});
