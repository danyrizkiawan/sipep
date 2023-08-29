"use client";
import Logo from "./Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "../utils/auth-context";

interface NavLink {
  id: number;
  url: string;
  newTab: boolean;
  text: string;
  restricted: boolean;
}

function NavLink({ url, text }: NavLink) {
  const path = usePathname();

  return (
    <li className="flex">
      <Link
        href={url}
        className={`flex items-center mx-4 -mb-1 border-b-2 dark:border-transparent ${
          path === url && "dark:text-violet-400 dark:border-violet-400"
        }}`}
      >
        {text}
      </Link>
    </li>
  );
}

export default function Navbar({
  links,
  logoUrl,
  logoText,
}: {
  links: Array<NavLink>;
  logoUrl: string | null;
  logoText: string | null;
}) {
  const { user, logout } = useUser();

  async function handleSubmit() {
    logout();
  }

  return (
    <div className="p-4 bg-white text-gray-900">
      <div className="container flex justify-between h-16 mx-auto px-0 sm:px-6">
        <Logo src={logoUrl}>
          {logoText && <h2 className="text-2xl font-bold">{logoText}</h2>}
        </Logo>

        <div className="items-center flex-shrink-0 hidden lg:flex">
          <ul className="items-stretch hidden space-x-3 lg:flex">

            {links.map((item: NavLink) => (
              !item.restricted || user ? <NavLink key={item.id} {...item} /> : ''
            ))}
            {!user ? (
              <li>
                  <Link
                      key="login"
                      href="/login"
                      target="_self"
                      className="px-5 py-2 rounded bg-violet-400 text-gray-100"
                      >
                    Login
                  </Link>
              </li>
              ) : (
              <>
                <li>
                  <a className="text-right ml-20" href="#">Anda login sebagai, <span className="text-violet-800 underline">{user.username}</span></a>
                </li>
                <li>
                  <a className="px-5 py-2 rounded bg-violet-400 text-gray-100 cursor-pointer" onClick={handleSubmit}>
                    Logout
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>

        <button className="p-4 lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 dark:text-gray-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
