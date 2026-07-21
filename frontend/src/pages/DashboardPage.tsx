import { useAuthStore } from '../stores/authStore';

export function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Spark RH & DP Portal
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-400">
              Olá, {user?.name || user?.cpf}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Colaboradores
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Postos Ativos
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Contratos
            </h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Folha do Mês
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">R$ 0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
