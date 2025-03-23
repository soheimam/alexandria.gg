'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './walletConnect';

export function Navigation() {
  const pathname = usePathname();

  return (
    <Card className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden mx-auto mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Home button */}
          <div className="flex items-center">
            {/* Andri Logo */}
            <Link href="/" className="flex items-center mr-3">
              <Image
                src="/logo.jpeg"
                alt="Andri Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>

            <Link href="/lesson" className="flex items-center mr-3">
              <Image
                src="/logo.jpeg"
                alt="Andri Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
            </Link>

            {/* Home button - only visible when not on home page */}
            {pathname !== '/' && (
              <Link
                href="/"
                className="flex items-center text-pink-500 hover:text-pink-600 bg-pink-50 px-2 py-1 rounded-lg transition-colors"
              >
                <Home className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Home</span>
              </Link>
            )}
          </div>

          {/* Right side - Wallet connection */}
          <WalletConnect />
        </div>
      </CardContent>
    </Card>
  );
}
