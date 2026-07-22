import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, HandCoins } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, PrelineSelect, DatePicker } from '../../components/ui';

const overtimeSchema = z.object({
  employee_id: z.string().min(1, 'Colaborador é obrigatório'),
  post_id: z.string().min(1, 'Posto é obrigatório'),
  request_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Horário início é obrigatório'),
  end_time: z.string().min(1, 'Horário fim é obrigatório'),
  overtime_type: z.string().min(1, 'Tipo é obrigatório'),
  reason: z.string().optional().or(z.literal('')),
});

type OvertimeFormData = z.infer<typeof overtimeSchema>;

const TYPE_OPTIONS = [
  { value: 'HE50', label: 'HE 50%' },
  { value: 'HE100', label: 'HE 100%' },
  { value: 'ADICIONAL_NOTURNO', label: 'Adicional Noturno' },
];

export function OvertimeFormPage() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OvertimeFormData>({
    resolver: zodResolver(overtimeSchema),
    defaultValues: {
      request_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    fetchPosts();
    fetchEmployees();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: { id: string; name: string }[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: p.name })));
    } catch { /* empty */ }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ data: { id: string; full_name: string; registration_number: string }[] }>('/employees?limit=200&status=ATIVO');
      setEmployeeOptions(res.data.data.map(e => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })));
    } catch { /* empty */ }
  };

  const onSubmit = async (data: OvertimeFormData) => {
    try {
      setIsSaving(true);
      await api.post('/overtime', data);
      toast.success('Solicitação criada com sucesso!');
      navigate('/overtime');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao criar solicitação');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Nova Solicitação de HE"
        subtitle="Solicitar horas extras"
        actions={
          <Button variant="ghost" onClick={() => navigate('/overtime')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4 flex items-center gap-2">
                    <HandCoins className="size-4" />
                    Dados da Solicitação
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PrelineSelect
                      label="Colaborador *"
                      options={employeeOptions}
                      value={watch('employee_id')}
                      onChange={(val) => setValue('employee_id', val)}
                      placeholder="Selecione o colaborador"
                      error={errors.employee_id?.message}
                    />
                    <PrelineSelect
                      label="Posto *"
                      options={postOptions}
                      value={watch('post_id')}
                      onChange={(val) => setValue('post_id', val)}
                      placeholder="Selecione o posto"
                      error={errors.post_id?.message}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <DatePicker
                      label="Data *"
                      value={watch('request_date')}
                      onChange={(val) => setValue('request_date', val)}
                      error={errors.request_date?.message}
                    />
                    <Input
                      label="Horário Início *"
                      type="time"
                      error={errors.start_time?.message}
                      {...register('start_time')}
                    />
                    <Input
                      label="Horário Fim *"
                      type="time"
                      error={errors.end_time?.message}
                      {...register('end_time')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <PrelineSelect
                      label="Tipo *"
                      options={TYPE_OPTIONS}
                      value={watch('overtime_type')}
                      onChange={(val) => setValue('overtime_type', val)}
                      placeholder="Selecione o tipo"
                      error={errors.overtime_type?.message}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Justificativa
                  </h3>
                  <textarea
                    className="w-full rounded-lg border dark:border-spark-dark-border border-gray-300 bg-white dark:bg-spark-dark-card px-4 py-2.5 text-sm dark:text-white text-spark-dark placeholder:text-spark-gray dark:placeholder:text-spark-dark-text focus:border-spark-primary focus:ring-1 focus:ring-spark-primary outline-none"
                    rows={3}
                    placeholder="Motivo da solicitação de horas extras..."
                    {...register('reason')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button type="button" variant="ghost" onClick={() => navigate('/overtime')}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  <Save className="size-4 mr-2" />
                  Solicitar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
