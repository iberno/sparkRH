import { Sun, Moon, Users, Building2, FileText, DollarSign, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useState, useRef, useEffect } from 'react';

export function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="dark:bg-neutral-900 bg-gray-50 min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full dark:bg-neutral-800/80 bg-white/80 backdrop-blur-lg dark:border-neutral-700 border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold dark:text-white text-gray-900">
                Spark RH
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="size-9 flex justify-center items-center rounded-lg dark:text-neutral-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-x-2 text-sm rounded-lg dark:text-neutral-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 transition-colors"
                >
                  <div className="size-8 flex justify-center items-center rounded-full dark:bg-neutral-700 bg-gray-200">
                    <span className="text-sm font-medium dark:text-white text-gray-700">
                      {user?.name?.charAt(0) || user?.cpf?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium dark:text-neutral-300 text-gray-700">
                    {user?.name || user?.cpf}
                  </span>
                  <ChevronDown className="size-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 dark:bg-neutral-800 bg-white dark:border-neutral-700 border-gray-200 rounded-xl shadow-lg p-2 z-50">
                    <a
                      href="#"
                      className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-neutral-400 text-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <User className="size-4" />
                      Perfil
                    </a>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-neutral-400 text-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <LogOut className="size-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-white text-gray-900">
            Dashboard
          </h1>
          <p className="mt-1 dark:text-neutral-400 text-gray-600">
            Visão geral do sistema
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-blue-600/10">
                <Users className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Colaboradores</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-teal-500/10">
                <Building2 className="size-5 text-teal-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Postos Ativos</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-yellow-500/10">
                <FileText className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Contratos</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-purple-500/10">
                <DollarSign className="size-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Folha do Mês</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">R$ 0</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs p-6">
          <h2 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">
            Bem-vindo ao Spark RH & DP Portal
          </h2>
          <p className="dark:text-neutral-400 text-gray-600">
            Use o menu lateral para navegar entre os módulos do sistema.
          </p>
        </div>
      </main>
    </div>
  );
}
