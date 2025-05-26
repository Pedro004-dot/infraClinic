'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  ClipboardDocumentListIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export function Navbar({ nomeClinica, clinicaId }: { nomeClinica?: string, clinicaId?: string }) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: clinicaId ? `/clinica/${clinicaId}` : '/',
      icon: HomeIcon
    },
    {
      name: 'Kanban',
      href: clinicaId ? `/clinica/${clinicaId}/kanban` : '/kanban',
      icon: ClipboardDocumentListIcon
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">{nomeClinica || 'White label'}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <UserCircleIcon className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 