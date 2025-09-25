'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { cn } from '@/lib/utils';
import { sidebarLinks } from '@/constants/nav';

const MobileNav = () => {
    const pathname = usePathname();

    return (
        <section className="w-full max-w-[340px]">
            <Sheet>
                <SheetTrigger asChild>
                    <Image
                        src="/icons/hamburger.svg"
                        width={36}
                        height={36}
                        alt="hamburger icon"
                        className="cursor-pointer sm:hidden"
                    />
                </SheetTrigger>
                <SheetContent side="left" className="border-none bg-dark-1 w-[340px]">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                        <Link href="/" className="flex items-center gap-1">
                            <Image
                                src="/icons/skill.svg"
                                width={32}
                                height={32}
                                alt="skillswap logo"
                            />

                            
                                
                        
                            <p className="text-[26px] font-extrabold text-white">SKILLSWAP</p>
                        </Link>
                    </SheetHeader>
                    <div className="flex h-[calc(100vh-72px)] flex-col justify-between overflow-y-auto pl-8">
                        <SheetClose asChild>
                            <section className="flex h-full flex-col gap-6 pt-12 text-white">
                                {sidebarLinks.map((item) => {
                                    const isActive = pathname === item.route;

                                    return (
                                        <SheetClose asChild key={item.route}>
                                            <Link
                                                href={item.route}
                                                key={item.label}
                                                className={cn(
                                                    'flex gap-4 items-center p-4 rounded-lg w-full max-w-59',
                                                    {
                                                        'bg-blue-1': isActive,
                                                    }
                                                )}
                                            >
                                                <Image
                                                    src={item.imgURL}
                                                    alt={item.label}
                                                    width={20}
                                                    height={20}
                                                />
                                                <p className="font-semibold">{item.label}</p>
                                            </Link>
                                        </SheetClose>

                                    );
                                })}
                            </section>
                        </SheetClose>
                    
                    </div>
                </SheetContent>
                
            </Sheet>
        </section>
    );
};

export default MobileNav;