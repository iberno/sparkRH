import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit, User, Phone, MapPin, Landmark, FileText,
  Clock, AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { EMPLOYEE_STATUS_LABELS } from '../../lib/constants';
import { PageHeader } from '../../components/custom';
import { Button, Card, CardContent, Badge, Spinner } from '../../components/ui';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  is_primary: boolean;
}

interface EmployeeDoc {
  id: string;
  type: string;
  name: string;
  file_name: string;
  expiry_date: string | null;
  status: string;
  created_at: string;
}

interface HourBankEntry {
  id: string;
  type: string;
  hours: number;
  description: string | null;
  reference_date: string;
  balance: number;
  status: string;
}

interface Employee {
  id: string;
  registration_number: string;
  cpf: string;
  full_name: string;
  social_name: string | null;
  birth_date: string;
  gender: string | null;
  marital_status: string | null;
  nationality: string | null;
  rg: string | null;
  rg_org: string | null;
  email: string | null;
  phone: string | null;
  phone_secondary: string | null;
  address_street: string | null;
  address_number: string | null;
  address_complement: string | null;
  address_neighborhood: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  bank_name: string | null;
  bank_agency: string | null;
  bank_account: string | null;
  bank_account_type: string | null;
  bank_pix: string | null;
  pis_pasep: string | null;
  ctps_number: string | null;
  ctps_series: string | null;
  ctps_state: string | null;
  photo_url: string | null;
  status: string;
  admission_date: string;
  resignation_date: string | null;
  emergency_contacts: EmergencyContact[];
  documents: EmployeeDoc[];
  hour_bank_entries: HourBankEntry[];
  user: { id: string; cpf: string; role: string; is_active: boolean } | null;
}

type Tab = 'personal' | 'contact' | 'address' | 'bank' | 'emergency' | 'documents' | 'hour-bank';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'personal', label: 'Pessoal', icon: User },
  { key: 'contact', label: 'Contato', icon: Phone },
  { key: 'address', label: 'Endereço', icon: MapPin },
  { key: 'bank', label: 'Banco', icon: Landmark },
  { key: 'emergency', label: 'Emergência', icon: AlertCircle },
  { key: 'documents', label: 'Documentos', icon: FileText },
  { key: 'hour-bank', label: 'Banco de Horas', icon: Clock },
];

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium dark:text-spark-dark-text text-spark-gray mb-1">{label}</p>
      <p className="text-sm dark:text-white text-spark-dark">{value || '—'}</p>
    </div>
  );
}

function formatCpf(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatDate(date: string | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('pt-BR');
}

export function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('personal');

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${id}`);
      setEmployee(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaborador');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12 dark:text-spark-dark-text text-spark-gray">
        <p>Colaborador não encontrado.</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/employees')}>
          <ArrowLeft className="size-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      ATIVO: 'success',
      AFASTADO: 'warning',
      FERIAS: 'info',
      DEMITIDO: 'danger',
    };
    return map[status] || 'default';
  };

  return (
    <div>
      <PageHeader
        title={employee.social_name || employee.full_name}
        subtitle={`Matrícula: ${employee.registration_number} · CPF: ${formatCpf(employee.cpf)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate('/employees')}>
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Button>
            <Button onClick={() => navigate(`/employees/${id}/edit`)}>
              <Edit className="size-4 mr-2" />
              Editar
            </Button>
          </div>
        }
      />

      {/* Status Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="py-3">
            <p className="text-xs dark:text-spark-dark-text text-spark-gray">Status</p>
            <Badge variant={getStatusVariant(employee.status)} className="mt-1">
              {EMPLOYEE_STATUS_LABELS[employee.status as keyof typeof EMPLOYEE_STATUS_LABELS] || employee.status}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs dark:text-spark-dark-text text-spark-gray">Admissão</p>
            <p className="text-sm font-medium dark:text-white text-spark-dark mt-1">
              {formatDate(employee.admission_date)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs dark:text-spark-dark-text text-spark-gray">Telefone</p>
            <p className="text-sm font-medium dark:text-white text-spark-dark mt-1">
              {employee.phone || '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3">
            <p className="text-xs dark:text-spark-dark-text text-spark-gray">Usuário</p>
            <p className="text-sm font-medium dark:text-white text-spark-dark mt-1">
              {employee.user ? (employee.user.is_active ? 'Ativo' : 'Inativo') : 'Sem usuário'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-1 border-b dark:border-spark-dark-border border-gray-200 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-spark-primary text-spark-primary'
                    : 'border-transparent dark:text-spark-dark-text text-spark-gray hover:text-spark-primary'
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
                {tab.key === 'emergency' && employee.emergency_contacts.length > 0 && (
                  <span className="ml-1 size-5 rounded-full bg-spark-primary/10 text-spark-primary text-xs flex items-center justify-center">
                    {employee.emergency_contacts.length}
                  </span>
                )}
                {tab.key === 'documents' && employee.documents.length > 0 && (
                  <span className="ml-1 size-5 rounded-full bg-spark-primary/10 text-spark-primary text-xs flex items-center justify-center">
                    {employee.documents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Personal */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Nome Completo" value={employee.full_name} />
              <Field label="Nome Social" value={employee.social_name} />
              <Field label="CPF" value={formatCpf(employee.cpf)} />
              <Field label="Data de Nascimento" value={formatDate(employee.birth_date)} />
              <Field label="Gênero" value={employee.gender} />
              <Field label="Estado Civil" value={employee.marital_status} />
              <Field label="Nacionalidade" value={employee.nationality} />
              <Field label="RG" value={employee.rg} />
              <Field label="Órgão Emissor" value={employee.rg_org} />
              <Field label="PIS/PASEP" value={employee.pis_pasep} />
              <Field label="CTPS Número" value={employee.ctps_number} />
              <Field label="CTPS Série" value={employee.ctps_series} />
              <Field label="CTPS UF" value={employee.ctps_state} />
            </div>
          )}

          {/* Contact */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="E-mail" value={employee.email} />
              <Field label="Telefone Principal" value={employee.phone} />
              <Field label="Telefone Secundário" value={employee.phone_secondary} />
            </div>
          )}

          {/* Address */}
          {activeTab === 'address' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Logradouro" value={employee.address_street} />
              <Field label="Número" value={employee.address_number} />
              <Field label="Complemento" value={employee.address_complement} />
              <Field label="Bairro" value={employee.address_neighborhood} />
              <Field label="Cidade" value={employee.address_city} />
              <Field label="UF" value={employee.address_state} />
              <Field label="CEP" value={employee.address_zip} />
            </div>
          )}

          {/* Bank */}
          {activeTab === 'bank' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Banco" value={employee.bank_name} />
              <Field label="Agência" value={employee.bank_agency} />
              <Field label="Conta" value={employee.bank_account} />
              <Field label="Tipo de Conta" value={employee.bank_account_type} />
              <Field label="Chave PIX" value={employee.bank_pix} />
            </div>
          )}

          {/* Emergency Contacts */}
          {activeTab === 'emergency' && (
            <div>
              {employee.emergency_contacts.length === 0 ? (
                <p className="text-sm dark:text-spark-dark-text text-spark-gray text-center py-4">
                  Nenhum contato de emergência cadastrado.
                </p>
              ) : (
                <div className="space-y-3">
                  {employee.emergency_contacts.map((ec) => (
                    <div
                      key={ec.id}
                      className="flex items-center justify-between p-3 border dark:border-spark-dark-border border-gray-200 rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium dark:text-white text-spark-dark text-sm">{ec.name}</p>
                          {ec.is_primary && (
                            <Badge variant="primary" className="text-xs">Principal</Badge>
                          )}
                        </div>
                        <p className="text-xs dark:text-spark-dark-text text-spark-gray mt-1">
                          {ec.relationship} · {ec.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div>
              {employee.documents.length === 0 ? (
                <p className="text-sm dark:text-spark-dark-text text-spark-gray text-center py-4">
                  Nenhum documento cadastrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border dark:border-spark-dark-border border-gray-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium dark:text-white text-spark-dark text-sm">{doc.name}</p>
                        <p className="text-xs dark:text-spark-dark-text text-spark-gray">
                          {doc.type} · {formatDate(doc.created_at)}
                          {doc.expiry_date && ` · Validade: ${formatDate(doc.expiry_date)}`}
                        </p>
                      </div>
                      <Badge variant={doc.status === 'ATIVO' ? 'success' : 'danger'} className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hour Bank */}
          {activeTab === 'hour-bank' && (
            <div>
              {employee.hour_bank_entries.length === 0 ? (
                <p className="text-sm dark:text-spark-dark-text text-spark-gray text-center py-4">
                  Nenhuma entrada no banco de horas.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b dark:border-spark-dark-border border-gray-200">
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Data</th>
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Horas</th>
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Saldo</th>
                        <th className="text-left py-3 px-4 font-medium dark:text-spark-dark-text text-spark-gray">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.hour_bank_entries.map((entry) => (
                        <tr key={entry.id} className="border-b dark:border-spark-dark-border border-gray-100">
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray">
                            {formatDate(entry.reference_date)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={entry.type === 'CREDITO' ? 'success' : 'danger'} className="text-xs">
                              {entry.type === 'CREDITO' ? 'Crédito' : 'Débito'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 dark:text-white text-spark-dark font-mono">
                            {entry.hours}h
                          </td>
                          <td className="py-3 px-4 dark:text-white text-spark-dark font-mono">
                            {entry.balance}h
                          </td>
                          <td className="py-3 px-4 dark:text-spark-dark-text text-spark-gray text-xs">
                            {entry.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
