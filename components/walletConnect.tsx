
'use client'
import { Avatar, Name } from '@coinbase/onchainkit/identity';

import {
  ConnectWallet,
  Wallet
} from '@coinbase/onchainkit/wallet';

export function WalletConnect() {
  return (
    <div className="flex justify-end">
      <Wallet
        draggable={true}
        draggableStartingPosition={{
          x: window.innerWidth - 300,
          y: window.innerHeight - 100,
        }}
      >
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
      </Wallet>
    </div>
  );
}