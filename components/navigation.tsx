'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Home, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletConnect } from './walletConnect';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5 mr-1" /> },
    { href: '/lesson', label: 'Lessons', icon: <BookOpen className="h-5 w-5 mr-1" /> },
  ];

  return (
    <Card className="w-full max-w-md bg-white rounded-3xl shadow-lg overflow-hidden mx-auto mb-4">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and navigation links */}
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              
            </Link>

            {/* Navigation links */}
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right side - Wallet connection */}
          <WalletConnect />
        </div>
      </CardContent>
    </Card>
  );
}
