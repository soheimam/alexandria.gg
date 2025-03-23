'use client'
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders client-side to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex justify-end h-6"></div>; // Placeholder with same height
  }

  return (
    <div className="flex justify-end">
      <Wallet>
        <ConnectWallet className="flex items-center justify-center px-3 py-2 rounded-full bg-pink-100 text-pink-500 text-sm font-medium hover:bg-pink-200 transition-colors">
          <div className="flex items-center">
            <Avatar className="h-6 w-6 mr-2" />
            <Name className="text-sm font-medium" />
          </div>
         
        </ConnectWallet>
      </Wallet>
    </div>
  );
}