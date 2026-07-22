import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Input, Card, CardContent, PrelineSelect } from '../../components/ui';

interface PostOption { id: string; name: string; code: string }
interface EmployeeOption { id: string; full_name: string; registration_number: string }

export function ScheduleGeneratePage() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);
  const [templateOptions, setTemplateOptions] = useState<{ value: string; label: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);

  const [postId, setPostId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (postId) {
      setTemplateOptions([]);
      setTemplateId('');
      api.get(`/schedules/templates?post_id=${postId}`)
        .then((res) => {
          const raw = res.data as any;
          const list = Array.isArray(raw) ? raw : raw?.data;
          if (Array.isArray(list)) {
            setTemplateOptions(list.map((t: any) => ({ value: t.id, label: t.name })));
          }
        })
        .catch(() => toast.error('Erro ao carregar modelos'));
    }
  }, [postId]);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: PostOption[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: `${p.name} (${p.code || ''})` })));
    } catch { toast.error('Erro ao carregar postos'); }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ data: EmployeeOption[] }>('/employees?limit=200&status=ATIVO');
      setEmployeeOptions(res.data.data.map(e => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })));
    } catch { toast.error('Erro ao carregar colaboradores'); }
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const handleGenerate = async () => {
    if (!postId || !templateId || !startDate || !endDate || selectedEmployees.length === 0) {
      toast.warning('Preencha todos os campos e selecione pelo menos um colaborador');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.post('/schedules/generate', {
        post_id: postId,
        schedule_id: templateId,
        start_date: startDate,
        end_date: endDate,
        employee_ids: selectedEmployees,
      });
      toast.success(`${res.data.generated} escalas geradas com sucesso!`);
      navigate('/schedules');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao gerar escalas');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Gerar Escala"
        subtitle="Gere escalas automaticamente para um período"
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
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4 flex items-center gap-2">
                  <Calendar className="size-4" />
                  Configuração
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <PrelineSelect
                    label="Posto *"
                    options={postOptions}
                    value={postId}
                    onChange={setPostId}
                    placeholder="Selecione o posto"
                  />
                   <PrelineSelect
                    label="Modelo de Escala *"
                    options={templateOptions}
                    value={templateId}
                    onChange={setTemplateId}
                    placeholder={postId ? "Selecione o modelo" : "Selecione um posto primeiro"}
                    disabled={!postId}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Data Início *"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    label="Data Fim *"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium dark:text-white text-spark-dark mb-4">
                  Colaboradores * ({selectedEmployees.length} selecionados)
                </h3>
                <div className="max-h-64 overflow-y-auto border dark:border-spark-dark-border border-gray-200 rounded-lg">
                  {employeeOptions.map((emp) => (
                    <label
                      key={emp.value}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-spark-dark-surface border-b dark:border-spark-dark-border border-gray-100 last:border-0 ${
                        selectedEmployees.includes(emp.value) ? 'bg-spark-primary/5' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(emp.value)}
                        onChange={() => toggleEmployee(emp.value)}
                        className="rounded border-gray-300 dark:border-spark-dark-border text-spark-primary focus:ring-spark-primary"
                      />
                      <span className="text-sm dark:text-white text-spark-dark">{emp.label}</span>
                    </label>
                  ))}
                  {employeeOptions.length === 0 && (
                    <p className="px-4 py-3 text-sm dark:text-spark-dark-text text-spark-gray">Nenhum colaborador ativo encontrado</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-spark-dark-border border-gray-200">
              <Button variant="ghost" onClick={() => navigate('/schedules')}>
                Cancelar
              </Button>
              <Button onClick={handleGenerate} isLoading={isGenerating}>
                <Calendar className="size-4 mr-2" />
                Gerar Escalas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
