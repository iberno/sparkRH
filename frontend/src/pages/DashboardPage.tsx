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
    <div className="dark:bg-spark-dark-bg bg-spark-light min-h-screen font-body">
      <header className="sticky top-0 z-50 w-full dark:bg-spark-navy bg-spark-navy backdrop-blur-lg border-b dark:border-spark-dark-border border-spark-navy/20">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white font-heading">
                Spark RH
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="size-9 flex justify-center items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-spark-primary transition-colors"
              >
                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="inline-flex items-center gap-x-2 text-sm rounded-lg text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-spark-primary px-3 py-2 transition-colors"
                >
                  <div className="size-8 flex justify-center items-center rounded-full bg-spark-primary">
                    <span className="text-sm font-medium text-white">
                      {user?.name?.charAt(0) || user?.cpf?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-white">
                    {user?.name || user?.cpf}
                  </span>
                  <ChevronDown className="size-4" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 dark:bg-spark-dark-surface bg-white dark:border-spark-dark-border border-gray-200 rounded-xl shadow-lg p-2 z-50">
                    <a
                      href="#"
                      className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-spark-dark-text text-spark-dark hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <User className="size-4" />
                      Perfil
                    </a>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-spark-dark-text text-spark-dark hover:bg-white/5 dark:hover:bg-white/5 transition-colors"
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

      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-white text-spark-dark font-heading">
            Dashboard
          </h1>
          <p className="mt-1 dark:text-spark-dark-text text-spark-gray">
            Visão geral do sistema
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 sm:p-5 dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-spark-primary/10">
                <Users className="size-5 text-spark-primary" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-spark-dark-text text-spark-gray">Colaboradores</p>
                <h3 className="text-xl font-bold dark:text-white text-spark-dark font-heading">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-teal-500/10">
                <Building2 className="size-5 text-teal-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-spark-dark-text text-spark-gray">Postos Ativos</p>
                <h3 className="text-xl font-bold dark:text-white text-spark-dark font-heading">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-yellow-500/10">
                <FileText className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-spark-dark-text text-spark-gray">Contratos</p>
                <h3 className="text-xl font-bold dark:text-white text-spark-dark font-heading">0</h3>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-purple-500/10">
                <DollarSign className="size-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs uppercase dark:text-spark-dark-text text-spark-gray">Folha do Mês</p>
                <h3 className="text-xl font-bold dark:text-white text-spark-dark font-heading">R$ 0</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="dark:bg-spark-dark-surface bg-white border dark:border-spark-dark-border border-gray-200 rounded-xl shadow-2xs p-6">
          <h2 className="text-lg font-semibold dark:text-white text-spark-dark mb-4 font-heading">
            Bem-vindo ao Spark RH & DP Portal
          </h2>
          <p className="dark:text-spark-dark-text text-spark-gray">
            Use o menu lateral para navegar entre os módulos do sistema.
          </p>
        </div>
      </main>
    </div>
  );
}
