import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, User, Phone, MapPin, Landmark, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner } from '../../components/ui';
import { PrelineSelect } from '../../components/ui/preline-select';
import { EMPLOYEE_STATUS } from '../../lib/constants';

const employeeSchema = z.object({
  registration_number: z.string().min(1, 'Matrícula é obrigatória'),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos'),
  full_name: z.string().min(2, 'Nome completo é obrigatório'),
  social_name: z.string().optional().or(z.literal('')),
  birth_date: z.string().min(1, 'Data de nascimento é obrigatória'),
  gender: z.string().optional().or(z.literal('')),
  marital_status: z.string().optional().or(z.literal('')),
  nationality: z.string().optional().or(z.literal('')),
  rg: z.string().optional().or(z.literal('')),
  rg_org: z.string().optional().or(z.literal('')),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  phone_secondary: z.string().optional().or(z.literal('')),
  address_street: z.string().optional().or(z.literal('')),
  address_number: z.string().optional().or(z.literal('')),
  address_complement: z.string().optional().or(z.literal('')),
  address_neighborhood: z.string().optional().or(z.literal('')),
  address_city: z.string().optional().or(z.literal('')),
  address_state: z.string().optional().or(z.literal('')),
  address_zip: z.string().optional().or(z.literal('')),
  bank_name: z.string().optional().or(z.literal('')),
  bank_agency: z.string().optional().or(z.literal('')),
  bank_account: z.string().optional().or(z.literal('')),
  bank_account_type: z.string().optional().or(z.literal('')),
  bank_pix: z.string().optional().or(z.literal('')),
  pis_pasep: z.string().optional().or(z.literal('')),
  ctps_number: z.string().optional().or(z.literal('')),
  ctps_series: z.string().optional().or(z.literal('')),
  ctps_state: z.string().optional().or(z.literal('')),
  admission_date: z.string().min(1, 'Data de admissão é obrigatória'),
  status: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

type Tab = 'personal' | 'contact' | 'address' | 'bank' | 'documents';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'personal', label: 'Dados Pessoais', icon: User },
  { key: 'contact', label: 'Contato', icon: Phone },
  { key: 'address', label: 'Endereço', icon: MapPin },
  { key: 'bank', label: 'Dados Bancários', icon: Landmark },
  { key: 'documents', label: 'Documentos', icon: FileText },
];

const genderOptions = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'OUTRO', label: 'Outro' },
];

const maritalStatusOptions = [
  { value: 'SOLTEIRO', label: 'Solteiro(a)' },
  { value: 'CASADO', label: 'Casado(a)' },
  { value: 'DIVORCIADO', label: 'Divorciado(a)' },
  { value: 'VIUVO', label: 'Viúvo(a)' },
  { value: 'UNIAO_ESTAVEL', label: 'União Estável' },
];

const statusOptions = Object.entries(EMPLOYEE_STATUS).map(([key, val]) => ({
  value: val,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}));

const bankAccountTypes = [
  { value: 'CONTA_CORRENTE', label: 'Conta Corrente' },
  { value: 'CONTA_POUPANCA', label: 'Poupança' },
  { value: 'CONTA_SALARIO', label: 'Conta Salário' },
];

export function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nationality: 'Brasileira',
      admission_date: new Date().toISOString().split('T')[0],
      status: 'ATIVO',
    },
  });

  const fetchCep = useCallback(async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    setIsCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setValue('address_street', data.logradouro || '');
        setValue('address_neighborhood', data.bairro || '');
        setValue('address_city', data.localidade || '');
        setValue('address_state', data.uf || '');
      }
    } catch {
      // Silently fail — user can fill manually
    } finally {
      setIsCepLoading(false);
    }
  }, [setValue]);

  useEffect(() => {
    if (isEditing) fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/employees/${id}`);
      const emp = response.data;
      reset({
        registration_number: emp.registration_number,
        cpf: emp.cpf,
        full_name: emp.full_name,
        social_name: emp.social_name || '',
        birth_date: emp.birth_date?.split('T')[0] || '',
        gender: emp.gender || '',
        marital_status: emp.marital_status || '',
        nationality: emp.nationality || '',
        rg: emp.rg || '',
        rg_org: emp.rg_org || '',
        email: emp.email || '',
        phone: emp.phone || '',
        phone_secondary: emp.phone_secondary || '',
        address_street: emp.address_street || '',
        address_number: emp.address_number || '',
        address_complement: emp.address_complement || '',
        address_neighborhood: emp.address_neighborhood || '',
        address_city: emp.address_city || '',
        address_state: emp.address_state || '',
        address_zip: emp.address_zip || '',
        bank_name: emp.bank_name || '',
        bank_agency: emp.bank_agency || '',
        bank_account: emp.bank_account || '',
        bank_account_type: emp.bank_account_type || '',
        bank_pix: emp.bank_pix || '',
        pis_pasep: emp.pis_pasep || '',
        ctps_number: emp.ctps_number || '',
        ctps_series: emp.ctps_series || '',
        ctps_state: emp.ctps_state || '',
        admission_date: emp.admission_date?.split('T')[0] || '',
        status: emp.status,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar colaborador');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.phone?.replace(/\D/g, ''),
        phone_secondary: data.phone_secondary?.replace(/\D/g, ''),
        address_zip: data.address_zip?.replace(/\D/g, ''),
        ctps_number: data.ctps_number?.replace(/\D/g, ''),
        ctps_series: data.ctps_series?.replace(/\D/g, ''),
        pis_pasep: data.pis_pasep?.replace(/\D/g, ''),
      };

      if (isEditing) {
        await api.put(`/employees/${id}`, payload);
        toast.success('Colaborador atualizado com sucesso!');
      } else {
        const response = await api.post('/employees', payload);
        toast.success('Colaborador criado com sucesso!');
        setTimeout(() => navigate(`/employees/${response.data.id}`), 1500);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar colaborador');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}
        subtitle={isEditing ? 'Atualize os dados do colaborador' : 'Cadastre um novo colaborador'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/employees')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            {/* Tabs */}
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
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Personal Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Matrícula *"
                      placeholder="00001"
                      error={errors.registration_number?.message}
                      {...register('registration_number')}
                    />
                    <Input
                      label="CPF *"
                      placeholder="000.000.000-00"
                      error={errors.cpf?.message}
                      {...register('cpf')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome Completo *"
                      placeholder="Nome completo"
                      error={errors.full_name?.message}
                      {...register('full_name')}
                    />
                    <Input
                      label="Nome Social"
                      placeholder="Nome social (opcional)"
                      error={errors.social_name?.message}
                      {...register('social_name')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Data de Nascimento *"
                      type="date"
                      error={errors.birth_date?.message}
                      {...register('birth_date')}
                    />
                    <PrelineSelect
                      label="Gênero"
                      options={genderOptions}
                      value={watch('gender')}
                      onChange={(val) => setValue('gender', val)}
                      placeholder="Selecione..."
                    />
                    <PrelineSelect
                      label="Estado Civil"
                      options={maritalStatusOptions}
                      value={watch('marital_status')}
                      onChange={(val) => setValue('marital_status', val)}
                      placeholder="Selecione..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Nacionalidade"
                      {...register('nationality')}
                    />
                    <Input
                      label="RG"
                      placeholder="Número do RG"
                      error={errors.rg?.message}
                      {...register('rg')}
                    />
                    <Input
                      label="Órgão Emissor"
                      placeholder="SSP/ES"
                      error={errors.rg_org?.message}
                      {...register('rg_org')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="PIS/PASEP"
                      placeholder="Número PIS/PASEP"
                      {...register('pis_pasep')}
                    />
                    <PrelineSelect
                      label="Status"
                      options={statusOptions}
                      value={watch('status')}
                      onChange={(val) => setValue('status', val)}
                      placeholder="Selecione..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="CTPS Número"
                      {...register('ctps_number')}
                    />
                    <Input
                      label="CTPS Série"
                      {...register('ctps_series')}
                    />
                    <Input
                      label="CTPS UF"
                      placeholder="ES"
                      maxLength={2}
                      {...register('ctps_state')}
                    />
                  </div>
                  <Input
                    label="Data de Admissão *"
                    type="date"
                    error={errors.admission_date?.message}
                    {...register('admission_date')}
                  />
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="E-mail"
                      type="email"
                      placeholder="email@exemplo.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Telefone Principal"
                      placeholder="(27) 99999-0000"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <Input
                    label="Telefone Secundário"
                    placeholder="(27) 99999-0000"
                    error={errors.phone_secondary?.message}
                    {...register('phone_secondary')}
                  />
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Logradouro"
                        placeholder="Rua, Avenida, etc."
                        {...register('address_street')}
                      />
                    </div>
                    <Input
                      label="Número"
                      placeholder="123"
                      {...register('address_number')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Complemento"
                      placeholder="Apto, Sala, etc."
                      {...register('address_complement')}
                    />
                    <Input
                      label="Bairro"
                      {...register('address_neighborhood')}
                    />
                    <Input
                      label={isCepLoading ? 'CEP (buscando...)' : 'CEP'}
                      placeholder="00000-000"
                      {...register('address_zip')}
                      onBlur={(e) => fetchCep(e.target.value)}
                      disabled={isCepLoading}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Cidade"
                      {...register('address_city')}
                    />
                    <Input
                      label="UF"
                      placeholder="ES"
                      maxLength={2}
                      {...register('address_state')}
                    />
                  </div>
                </div>
              )}

              {/* Bank Tab */}
              {activeTab === 'bank' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nome do Banco"
                      placeholder="Banco do Brasil"
                      {...register('bank_name')}
                    />
                    <Input
                      label="Agência"
                      placeholder="0000-0"
                      {...register('bank_agency')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Número da Conta"
                      placeholder="00000-0"
                      {...register('bank_account')}
                    />
                    <PrelineSelect
                      label="Tipo de Conta"
                      options={bankAccountTypes}
                      value={watch('bank_account_type')}
                      onChange={(val) => setValue('bank_account_type', val)}
                      placeholder="Selecione..."
                    />
                  </div>
                  <Input
                    label="Chave PIX"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    {...register('bank_pix')}
                  />
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="text-center py-8 dark:text-spark-dark-text text-spark-gray">
                  <FileText className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Upload de documentos será disponibilizado em breve.</p>
                  <p className="text-xs mt-1 opacity-70">ASO, certificados, CTPS digital, etc.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/employees')}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  <Save className="size-4 mr-2" />
                  {isEditing ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
