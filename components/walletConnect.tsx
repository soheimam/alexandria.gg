
'use client'

import {
    ConnectWallet,
    Wallet,
    WalletAdvanced,
    WalletAdvancedAddressDetails,
    WalletAdvancedTokenHoldings,
    WalletAdvancedTransactionActions,
    WalletAdvancedWalletActions,
  } from '@coinbase/onchainkit/wallet';
  import { Address, Avatar, Name, Identity } from '@coinbase/onchainkit/identity';
  import { color } from '@coinbase/onchainkit/theme';
   
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
          <WalletAdvanced>
            <WalletAdvancedWalletActions />
            <WalletAdvancedAddressDetails />
            <WalletAdvancedTransactionActions />
            <WalletAdvancedTokenHoldings />
          </WalletAdvanced>
        </Wallet>
      </div>
    );
  }