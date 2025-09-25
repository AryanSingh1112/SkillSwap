import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React, { useState } from 'react'

const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="navbar flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 shadow-md">
            <Link href="/">
                <p className="text-2xl font-bold text-gradient">SKILLSWAP</p>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
                <Link href="/Skills" className="primary-button w-fit">
                    Browse Skills
                </Link>
                {/* <Link href="/match" className="px-4 py-2 rounded-3xl bg-purple-500 text-white transition-colors">
                    Find Your Match
                </Link>
                <Link href="/meeting" className="px-4 py-2 rounded-3xl bg-purple-500 text-white transition-colors">
                    Meeting Page
                </Link> */}
                <Link href="/skillform" className="px-4 py-2 rounded-3xl primary-button w-fit">
                    SkillForm
                </Link>
                <UserButton />
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
                <button
                    className="text-3xl focus:outline-none"
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label="Toggle menu"
                >
                    <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 shadow-lg z-50 flex flex-col items-center gap-4 py-6 md:hidden animate-fade-in">
                    <Link href="/Skills" className="primary-button w-fit" onClick={() => setMenuOpen(false)}>
                        Browse Skills
                    </Link>
                    {/* <Link href="/match" className="px-4 py-2 rounded-3xl bg-purple-500 text-white transition-colors" onClick={() => setMenuOpen(false)}>
                        Find Your Match
                    </Link>
                    <Link href="/meeting" className="px-4 py-2 rounded-3xl bg-purple-500 text-white transition-colors" onClick={() => setMenuOpen(false)}>
                        Meeting Page
                    </Link> */}
                    <Link href="/skillform" className="px-4 py-2 rounded-3xl primary-button w-fit" onClick={() => setMenuOpen(false)}>
                        SkillForm
                    </Link>
                    <div className="mt-2">
                        <UserButton />
                    </div>
                </div>
            )}
        </nav>
    );
}

export default NavBar
