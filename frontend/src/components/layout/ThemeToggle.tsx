import { useThemeStore } from '../../stores/themeStore';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`size-9 flex justify-center items-center rounded-lg dark:text-spark-dark-text text-spark-gray hover:bg-gray-100 dark:hover:bg-spark-dark-surface focus:outline-none focus:ring-2 focus:ring-spark-primary transition-colors ${className}`}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
