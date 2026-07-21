import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="dark:bg-neutral-900 bg-gray-50 min-h-screen">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full dark:bg-neutral-800/80 bg-white/80 backdrop-blur-lg dark:border-neutral-700 border-gray-200">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold dark:text-white text-gray-900">
                Spark RH
              </span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Theme toggle */}
              <button
                type="button"
                className="size-9 flex justify-center items-center gap-x-2 text-sm rounded-lg dark:text-neutral-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-hs-theme-click-toggle="dark"
              >
                <svg className="dark:hidden block size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
                </svg>
                <svg className="hidden dark:block size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13z"/>
                </svg>
              </button>

              {/* User dropdown */}
              <div className="hs-dropdown relative inline-flex">
                <button
                  id="hs-dropdown-default"
                  type="button"
                  className="hs-dropdown-toggle inline-flex items-center gap-x-2 text-sm rounded-lg dark:text-neutral-400 text-gray-600 hover:bg-gray-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2"
                >
                  <div className="size-8 flex justify-center items-center rounded-full dark:bg-neutral-700 bg-gray-200">
                    <span className="text-sm font-medium dark:text-white text-gray-700">
                      {user?.name?.charAt(0) || user?.cpf?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium dark:text-neutral-300 text-gray-700">
                    {user?.name || user?.cpf}
                  </span>
                  <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>

                <div
                  className="hs-dropdown-menu transition-[opacity,margin] duration-200 hs-dropdown-open:opacity-100 opacity-0 w-48 hidden dark:bg-neutral-800 bg-white dark:border-neutral-700 border-gray-200 rounded-xl shadow-lg p-2"
                  aria-labelledby="hs-dropdown-default"
                >
                  <a className="flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-neutral-400 text-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-700" href="#">
                    <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H4s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                    </svg>
                    Perfil
                  </a>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-lg text-sm dark:text-neutral-400 text-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-700"
                  >
                    <svg className="size-4" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                      <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Page Title */}
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
          {/* Card 1 */}
          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-blue-600/10">
                <svg className="size-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.238 2.238 0 0 1 8 13c0 1.355-.68 2.75-1.936 3.56Q11.61 13.24 12 13h-2.216A2.239 2.239 0 0 1 7.216 14zM8 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6M5 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Colaboradores</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-teal-500/10">
                <svg className="size-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM2 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Postos Ativos</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-yellow-500/10">
                <svg className="size-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1H1V3zm0 3v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6H1z"/>
                  <path d="M4 8.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Contratos</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">0</h3>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4 sm:p-5 dark:bg-neutral-800 bg-white border dark:border-neutral-700 border-gray-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-x-4">
              <div className="size-10 flex justify-center items-center rounded-lg bg-purple-500/10">
                <svg className="size-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                </svg>
              </div>
              <div>
                <p className="text-xs uppercase dark:text-neutral-400 text-gray-500">Folha do Mês</p>
                <h3 className="text-xl font-bold dark:text-white text-gray-900">R$ 0</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Content placeholder */}
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
