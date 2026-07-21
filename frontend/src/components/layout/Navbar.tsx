import { Menu, Bell, User, LogOut } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { Dropdown, DropdownItem } from '../ui/dropdown';
import { Avatar } from '../ui/avatar';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full dark:bg-spark-navy/90 bg-spark-navy/90 backdrop-blur-lg border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden size-9 flex justify-center items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-lg font-bold text-white font-heading lg:hidden">
            Spark RH
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button className="size-9 flex justify-center items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 relative">
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-spark-primary rounded-full" />
          </button>

          <ThemeToggle />

          <Dropdown
            trigger={
              <button className="inline-flex items-center gap-x-2 text-sm rounded-lg text-white/80 hover:text-white hover:bg-white/10 px-3 py-2">
                <Avatar name={user?.name || user?.cpf} size="sm" />
                <span className="hidden sm:block font-medium">{user?.name || user?.cpf}</span>
              </button>
            }
          >
            <DropdownItem href="/profile">
              <User className="size-4" />
              Perfil
            </DropdownItem>
            <DropdownItem onClick={logout} danger>
              <LogOut className="size-4" />
              Sair
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
