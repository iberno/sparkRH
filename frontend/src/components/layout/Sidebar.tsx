import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  Heart,
  Shield,
  Car,
  Bike,
  AlertTriangle,
  Plane,
  Gift,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Colaboradores', href: '/employees', icon: Users },
  { label: 'Clientes', href: '/clients', icon: Building2 },
  { label: 'Contratos', href: '/contracts', icon: FileText },
  { label: 'Postos', href: '/work-posts', icon: Shield },
  { label: 'Escalas', href: '/schedules', icon: Calendar },
  { label: 'Ponto', href: '/time-clocks', icon: Clock },
  { label: 'Folha de Pagamento', href: '/payroll', icon: DollarSign },
  { label: 'HE Porteiros', href: '/extra-payroll', icon: Clock },
  { label: 'Treinamentos', href: '/trainings', icon: GraduationCap },
  { label: 'ASO', href: '/asos', icon: Heart },
  { label: 'Uniformes', href: '/uniforms', icon: Shield },
  { label: 'Veículos', href: '/vehicles', icon: Car },
  { label: 'Motoristas', href: '/drivers', icon: Bike },
  { label: 'Ocorrências', href: '/occurrences', icon: AlertTriangle },
  { label: 'Férias', href: '/vacations', icon: Plane },
  { label: 'Benefícios', href: '/benefits', icon: Gift },
  { label: 'Relatórios', href: '/reports', icon: BarChart3 },
  { label: 'Usuários', href: '/users', icon: Users },
  { label: 'Auditoria', href: '/audit', icon: Shield },
  { label: 'Configurações', href: '/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 dark:bg-spark-navy bg-spark-navy border-r dark:border-spark-dark-border border-spark-navy/20 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <Link to="/dashboard" className="text-lg font-bold text-white font-heading">
            Spark RH
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden size-8 flex justify-center items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href && location.pathname.startsWith(item.href);
              return (
                <li key={item.label}>
                  {item.href ? (
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-spark-primary text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/50">
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
