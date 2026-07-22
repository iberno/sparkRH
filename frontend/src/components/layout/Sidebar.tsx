import { useState } from 'react';
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
  ChevronDown,
  Briefcase,
  HandCoins,
  MapPin,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Gestão de Pessoas',
    items: [
      { label: 'Colaboradores', href: '/employees', icon: Users },
      { label: 'Treinamentos', href: '/trainings', icon: GraduationCap },
      { label: 'ASO', href: '/asos', icon: Heart },
      { label: 'Férias', href: '/vacations', icon: Plane },
      { label: 'Benefícios', href: '/benefits', icon: Gift },
    ],
  },
  {
    title: 'Comercial',
    items: [
      { label: 'Clientes', href: '/clients', icon: Building2 },
      { label: 'Contratos', href: '/contracts', icon: FileText },
    ],
  },
  {
    title: 'Operacional',
    items: [
      { label: 'Postos', href: '/work-posts', icon: MapPin },
      { label: 'Alocações', href: '/assignments', icon: Briefcase },
      { label: 'Escalas', href: '/schedules', icon: Calendar },
      { label: 'Ponto', href: '/time-clocks', icon: Clock },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      { label: 'Folha de Pagamento', href: '/payroll', icon: DollarSign },
      { label: 'HE Porteiros', href: '/extra-payroll', icon: HandCoins },
    ],
  },
  {
    title: 'Logística',
    items: [
      { label: 'Veículos', href: '/vehicles', icon: Car },
      { label: 'Motoristas', href: '/drivers', icon: Bike },
      { label: 'Uniformes', href: '/uniforms', icon: Shield },
    ],
  },
  {
    title: 'Monitoramento',
    items: [
      { label: 'Ocorrências', href: '/occurrences', icon: AlertTriangle },
    ],
  },
  {
    title: 'Administração',
    items: [
      { label: 'Relatórios', href: '/reports', icon: BarChart3 },
      { label: 'Usuários', href: '/users', icon: Users },
      { label: 'Auditoria', href: '/audit', icon: Shield },
      { label: 'Configurações', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function GroupSection({ group, pathname, onClose }: { group: NavGroup; pathname: string; onClose: () => void }) {
  const isGroupActive = group.items.some((item) => pathname.startsWith(item.href));
  const [isOpen, setIsOpen] = useState(isGroupActive);

  return (
    <li>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
          isGroupActive
            ? 'text-spark-primary'
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        <span>{group.title}</span>
        <ChevronDown
          className={`size-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <ul className="mt-0.5 space-y-0.5">
          {group.items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
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
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
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

        <nav className="p-3 overflow-y-auto h-[calc(100%-4rem)]">
          <ul className="space-y-2">
            <li>
              <Link
                to="/dashboard"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith('/dashboard')
                    ? 'bg-spark-primary text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                <span>Dashboard</span>
              </Link>
            </li>
            {navGroups.map((group) => (
              <GroupSection
                key={group.title}
                group={group}
                pathname={location.pathname}
                onClose={onClose}
              />
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
