import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, PrelineSelect } from '../../components/ui';

interface EmployeeOption { id: string; full_name: string; registration_number: string }

export function TimeSheetCalculatePage() {
  const navigate = useNavigate();
  const [isCalculating, setIsCalculating] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ data: EmployeeOption[] }>('/employees?limit=200&status=ATIVO');
      setEmployeeOptions(res.data.data.map(e => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })));
    } catch { /* empty */ }
  };

  const handleCalculate = async () => {
    if (!employeeId || !periodStart || !periodEnd) {
      toast.warning('Preencha todos os campos');
      return;
    }

    try {
      setIsCalculating(true);
      await api.post('/time-sheets/calculate', {
        employee_id: employeeId,
        period_start: periodStart,
        period_end: periodEnd,
      });
      toast.success('Espelho calculado com sucesso!');
      navigate('/time-sheets');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao calcular espelho');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Calcular Espelho de Ponto"
        subtitle="Calcular horas trabalhadas, HE e adicionais"
        actions={
          <Button variant="ghost" onClick={() => navigate('/time-sheets')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-spark-primary/10 mb-4">
                  <Calculator className="size-8 text-spark-primary" />
                </div>
                <p className="text-sm dark:text-spark-dark-text text-spark-gray">
                  Selecione o colaborador e o período para calcular o espelho de ponto.
                </p>
              </div>

              <div className="space-y-4">
                <PrelineSelect
                  label="Colaborador *"
                  options={employeeOptions}
                  value={employeeId}
                  onChange={setEmployeeId}
                  placeholder="Selecione o colaborador"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Data Início *"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                  <Input
                    label="Data Fim *"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleCalculate} isLoading={isCalculating} className="w-full" size="lg">
                <Calculator className="size-5 mr-2" />
                Calcular Espelho
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
