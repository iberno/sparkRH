import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { z } from 'zod';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, Spinner, DatePicker } from '../../components/ui';
import { PrelineSelect } from '../../components/ui/preline-select';

const vehicleSchema = z.object({
  plate: z.string().min(7, 'Placa é obrigatória'),
  model: z.string().min(1, 'Modelo é obrigatório'),
  brand: z.string().optional().or(z.literal('')),
  year: z.coerce.number().int().min(1900, 'Ano inválido').max(2100, 'Ano inválido').optional().or(z.nan()),
  color: z.string().optional().or(z.literal('')),
  fuel_type: z.string().optional().or(z.literal('')),
  km_current: z.coerce.number().int().min(0, 'KM deve ser positivo').optional().or(z.nan()),
  insurance_expiry: z.string().optional().or(z.literal('')),
  licensing_expiry: z.string().optional().or(z.literal('')),
  status: z.string().optional(),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

const statusOptions = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'INATIVO', label: 'Inativo' },
];

const fuelTypeOptions = [
  { value: 'FLEX', label: 'Flex' },
  { value: 'GASOLINA', label: 'Gasolina' },
  { value: 'ETANOL', label: 'Etanol' },
  { value: 'DIELETRICO', label: 'Diesel Elétrico' },
  { value: 'ELETRICO', label: 'Elétrico' },
];

export function VehicleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: 'ATIVO',
    },
  });

  useEffect(() => {
    if (isEditing) fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/vehicles/${id}`);
      const v = response.data;
      reset({
        plate: v.plate,
        model: v.model,
        brand: v.brand || '',
        year: v.year || undefined,
        color: v.color || '',
        fuel_type: v.fuel_type || '',
        km_current: v.km_current ?? undefined,
        insurance_expiry: v.insurance_expiry?.split('T')[0] || '',
        licensing_expiry: v.licensing_expiry?.split('T')[0] || '',
        status: v.status,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao carregar veículo');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setIsSaving(true);

      const payload: Record<string, any> = {
        ...data,
        plate: data.plate.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      };

      if (isNaN(payload.year)) payload.year = null;
      if (isNaN(payload.km_current)) payload.km_current = null;

      if (isEditing) {
        await api.put(`/vehicles/${id}`, payload);
        toast.success('Veículo atualizado com sucesso!');
        navigate('/vehicles');
      } else {
        const response = await api.post('/vehicles', payload);
        toast.success('Veículo criado com sucesso!');
        navigate(`/vehicles/${response.data.id}/edit`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar veículo');
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
        title={isEditing ? 'Editar Veículo' : 'Novo Veículo'}
        subtitle={isEditing ? 'Atualize os dados do veículo' : 'Cadastre um novo veículo'}
        actions={
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Placa *"
                    placeholder="ABC1D23"
                    error={errors.plate?.message}
                    {...register('plate')}
                  />
                  <Input
                    label="Modelo *"
                    placeholder="Ex: Gol, Onix, HB20"
                    error={errors.model?.message}
                    {...register('model')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Marca"
                    placeholder="Ex: Volkswagen, Chevrolet"
                    error={errors.brand?.message}
                    {...register('brand')}
                  />
                  <Input
                    label="Ano"
                    type="number"
                    placeholder="2024"
                    error={errors.year?.message}
                    {...register('year')}
                  />
                  <Input
                    label="Cor"
                    placeholder="Ex: Branco, Preto"
                    error={errors.color?.message}
                    {...register('color')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <PrelineSelect
                    label="Combustível"
                    options={fuelTypeOptions}
                    value={watch('fuel_type')}
                    onChange={(val) => setValue('fuel_type', val)}
                    placeholder="Selecione..."
                  />
                  <Input
                    label="KM Atual"
                    type="number"
                    placeholder="0"
                    error={errors.km_current?.message}
                    {...register('km_current')}
                  />
                  <PrelineSelect
                    label="Status"
                    options={statusOptions}
                    value={watch('status')}
                    onChange={(val) => setValue('status', val)}
                    placeholder="Selecione..."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DatePicker
                    label="Validade do Seguro"
                    value={watch('insurance_expiry')}
                    onChange={(val) => setValue('insurance_expiry', val)}
                    error={errors.insurance_expiry?.message}
                  />
                  <DatePicker
                    label="Validade do Licenciamento"
                    value={watch('licensing_expiry')}
                    onChange={(val) => setValue('licensing_expiry', val)}
                    error={errors.licensing_expiry?.message}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/vehicles')}
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
