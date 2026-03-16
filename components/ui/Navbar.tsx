'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

const navItems = [
    {
        href: '/dashboard', label: 'Dashboard', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        href: '/transactions', label: 'Transactions', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        )
    },
    {
        href: '/shopping', label: 'Shopping', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    }
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, signOut, userData } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    // Get user display name and avatar
    const displayName = userData?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userAvatar = userData?.avatar || user?.user_metadata?.avatar_url;

    return (
        <nav className="glass-card border-t-0 border-x-0 rounded-none sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 group">
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-500 transition-colors">
                            Spend<span className="text-amber-500">Wise</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                    ${pathname === item.href
                                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/50 border border-transparent'
                                    }
                                `}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* User Section */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {user && (
                            <div className="hidden sm:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-white">{displayName}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/20 flex items-center justify-center overflow-hidden">
                                    {userAvatar && userAvatar.startsWith('http') ? (
                                        <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : userAvatar ? (
                                        <span className="text-2xl">{userAvatar}</span>
                                    ) : (
                                        <span className="text-amber-400 font-semibold text-lg">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button variant="outline" size="sm" onClick={handleSignOut} className="text-xs sm:text-sm px-2 sm:px-4">
                            <span className="hidden sm:inline">Sign Out</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </Button>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 min-w-[44px] min-h-[44px] flex items-center justify-center"
                            aria-label="Toggle menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-slate-700/30 animate-slideDown">
                        {/* User Info for Mobile */}
                        {user && (
                            <div className="flex items-center gap-3 px-4 py-3 mb-3 bg-slate-800/30 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {userAvatar && userAvatar.startsWith('http') ? (
                                        <img src={userAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : userAvatar ? (
                                        <span className="text-xl">{userAvatar}</span>
                                    ) : (
                                        <span className="text-amber-400 font-semibold text-lg">
                                            {displayName.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{displayName}</p>
                                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px]
                                        ${pathname === item.href
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                        }
                                    `}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
