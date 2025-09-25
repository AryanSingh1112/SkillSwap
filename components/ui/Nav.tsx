import Image from 'next/image';
import Link from 'next/link';
import MobileNav from '../../app/_components/MobileNav';

const Nav = () => {
  return (
    <>
      {/* Top Navbar */}
      <nav className="flex-between fixed top-0 z-50 w-full bg-dark-1 px-6 py-4 lg:px-10">
        <Link href="/meeting" className="flex items-center gap-1">
          <Image
            src="/icons/skill.svg"
            width={32}
            height={32}
            alt="skillswap logo"
            className="max-sm:size-10"
          />
          <p className="text-[26px] font-extrabold text-white max-sm:hidden">
            SKILLSWAP
          </p>
        </Link>

        <div className="flex items-center gap-5">
          <MobileNav />
         
        </div>
      </nav>

      {/* Sidebar on the left */}

    </>
  );
};

export default Nav;
