import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft, CalendarDays } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner, PrelineSelect } from '../../components/ui';

const scheduleSchema = z.object({
  post_id: z.string().min(1, 'Posto é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  start_time: z.string().min(1, 'Horário início é obrigatório'),
  end_time: z.string().min(1, 'Horário fim é obrigatório'),
  days_of_week: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
  schedule_type: z.string().default('FIXA'),
  rotation_pattern: z.string().optional().or(z.literal('')),
  rotation_offset: z.coerce.number().optional().default(0),
  is_default: z.boolean().optional().default(false),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const DAYS = [
  { value: '1', label: 'Seg' },
  { value: '2', label: 'Ter' },
  { value: '3', label: 'Qua' },
  { value: '4', label: 'Qui' },
  { value: '5', label: 'Sex' },
  { value: '6', label: 'Sáb' },
  { value: '0', label: 'Dom' },
];

const TYPE_OPTIONS = [
  { value: 'FIXA', label: 'Fixa' },
  { value: 'ROTATIVA', label: 'Rotativa' },
  { value: 'ANOTADA', label: 'Anotada' },
];

const ROTATION_OPTIONS = [
  { value: '4x2', label: '4x2' },
  { value: '5x1', label: '5x1' },
  { value: '6x1', label: '6x1' },
  { value: '5x2', label: '5x2' },
  { value: '12x36', label: '12x36' },
];

export function ScheduleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      schedule_type: 'FIXA',
      rotation_offset: 0,
      is_default: false,
      days_of_week: [],
    },
  });

  const selectedDays = watch('days_of_week') || [];

  useEffect(() => {
    fetchPosts();
    if (isEditing) fetchSchedule();
  }, [id]);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: { id: string; name: string }[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: p.name })));
    } catch { toast.error('Erro ao carregar postos'); }
  };

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/schedules/templates/${id}`);
      const t = res.data;
      reset({
        post_id: t.post_id,
        name: t.name,
        start_time: t.start_time,
        end_time: t.end_time,
        days_of_week: t.days_of_week.split(','),
        schedule_type: t.schedule_type,
        rotation_pattern: t.rotation_pattern || '',
        rotation_offset: t.rotation_offset || 0,
        is_default: t.is_default,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar escala');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const current = selectedDays;
    if (current.includes(day)) {
      setValue('days_of_week', current.filter(d => d !== day), { shouldValidate: true });
    } else {
      setValue('days_of_week', [...current, day], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      setIsSaving(true);
      if (isEditing) {
        await api.put(`/schedules/templates/${id}`, data);
        toast.success('Modelo atualizado com sucesso!');
      } else {
        await api.post('/schedules/templates', data);
        toast.success('Modelo criado com sucesso!');
      }
      navigate('/schedules');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar modelo');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Modelo de Escala' : 'Novo Modelo de Escala'}
        subtitle="Configure os parâmetros da escala"
        actions={
          <Button variant="ghost" onClick={() => navigate('/schedules')}>
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
                    <CalendarDays className="size-4" />
                    Dados da Escala
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PrelineSelect
                      label="Posto *"
                      options={postOptions}
                      value={watch('post_id')}
                      onChange={(val) => setValue('post_id', val)}
                      placeholder="Selecione o posto"
                      error={errors.post_id?.message}
                    />
                    <Input
                      label="Nome *"
                      placeholder="Ex: Turno Manhã"
                      error={errors.name?.message}
                      {...register('name')}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
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
                    <PrelineSelect
                      label="Tipo de Escala"
                      options={TYPE_OPTIONS}
                      value={watch('schedule_type')}
                      onChange={(val) => setValue('schedule_type', val)}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Dias da Semana *
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedDays.includes(day.value)
                            ? 'bg-spark-primary text-white'
                            : 'bg-gray-100 dark:bg-spark-dark-card dark:text-spark-dark-text text-spark-gray hover:bg-gray-200 dark:hover:bg-spark-dark-surface'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                  {errors.days_of_week && (
                    <p className="text-xs text-red-500 mt-1">{errors.days_of_week.message}</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                    Configuração da Rotação
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <PrelineSelect
                      label="Padrão de Rotação"
                      options={ROTATION_OPTIONS}
                      value={watch('rotation_pattern')}
                      onChange={(val) => setValue('rotation_pattern', val)}
                      placeholder="Selecione o padrão"
                    />
                    <Input
                      label="Offset (dias)"
                      type="number"
                      min="0"
                      placeholder="0"
                      error={errors.rotation_offset?.message}
                      {...register('rotation_offset')}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_default"
                    className="rounded border-gray-300 dark:border-spark-dark-border text-spark-primary focus:ring-spark-primary"
                    {...register('is_default')}
                  />
                  <label htmlFor="is_default" className="text-sm dark:text-spark-dark-text text-spark-gray">
                    Definir como escala padrão do posto
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button type="button" variant="ghost" onClick={() => navigate('/schedules')}>
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
