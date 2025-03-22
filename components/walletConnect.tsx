
'use client'
import { Avatar, Name } from '@coinbase/onchainkit/identity';

import {
  ConnectWallet,
  Wallet
} from '@coinbase/onchainkit/wallet';

export function WalletConnect() {
  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet>
          <Avatar className="h-6 w-6" />
          <Name />
        </ConnectWallet>
      </Wallet>
    </div>
  );
}