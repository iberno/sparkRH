import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import { PageHeader } from '../../components/custom';
import { Button, Card, CardContent, PrelineSelect } from '../../components/ui';

interface PostOption { id: string; name: string; code: string }
interface EmployeeOption { id: string; full_name: string; registration_number: string }

export function TimeClockRegisterPage() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [postOptions, setPostOptions] = useState<{ value: string; label: string }[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<{ value: string; label: string }[]>([]);
  const [postId, setPostId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [clockType, setClockType] = useState('');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
    fetchEmployees();
    requestGps();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await api.get<{ data: PostOption[] }>('/work-posts?limit=100');
      setPostOptions(res.data.data.map(p => ({ value: p.id, label: `${p.name} (${p.code || ''})` })));
    } catch { /* empty */ }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<{ data: EmployeeOption[] }>('/employees?limit=200&status=ATIVO');
      setEmployeeOptions(res.data.data.map(e => ({ value: e.id, label: `${e.full_name} (${e.registration_number})` })));
    } catch { /* empty */ }
  };

  const requestGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsLoading(false);
        toast.warning('GPS não disponível. O ponto será registrado sem localização.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleRegister = async () => {
    if (!postId || !employeeId) {
      toast.warning('Selecione o posto e o colaborador');
      return;
    }

    try {
      setIsRegistering(true);
      await api.post('/time-clocks', {
        employee_id: employeeId,
        post_id: postId,
        clock_type: clockType || undefined,
        latitude: gps?.lat,
        longitude: gps?.lng,
        source: 'WEB',
      });
      toast.success('Ponto registrado com sucesso!');
      navigate('/time-clocks');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar ponto');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Registrar Ponto"
        subtitle="Marque sua entrada, saída ou intervalo"
        actions={
          <Button variant="ghost" onClick={() => navigate('/time-clocks')}>
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
        }
      />

      <div className="max-w-lg mx-auto">
        <Card>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center size-24 rounded-full bg-spark-primary/10 mb-4">
                  <Clock className="size-12 text-spark-primary" />
                </div>
                <p className="text-sm dark:text-spark-dark-text text-spark-gray">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-2xl font-bold dark:text-white text-spark-dark font-mono mt-1">
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              <div className="space-y-4">
                <PrelineSelect
                  label="Posto *"
                  options={postOptions}
                  value={postId}
                  onChange={setPostId}
                  placeholder="Selecione o posto"
                />
                <PrelineSelect
                  label="Colaborador *"
                  options={employeeOptions}
                  value={employeeId}
                  onChange={setEmployeeId}
                  placeholder="Selecione o colaborador"
                />
                <PrelineSelect
                  label="Tipo de Marcação"
                  options={[
                    { value: '', label: 'Automático (próxima marcação)' },
                    { value: 'ENTRADA', label: 'Entrada' },
                    { value: 'ALMOCO_SAIDA', label: 'Almoço Saída' },
                    { value: 'ALMOCO_RETORNO', label: 'Almoço Retorno' },
                    { value: 'SAIDA', label: 'Saída' },
                  ]}
                  value={clockType}
                  onChange={setClockType}
                  placeholder="Automático"
                />
              </div>

              <div className="flex items-center gap-2 text-sm dark:text-spark-dark-text text-spark-gray">
                <MapPin className="size-4" />
                {gpsLoading ? (
                  <span>Obtendo localização...</span>
                ) : gps ? (
                  <span>GPS: {gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</span>
                ) : (
                  <span>GPS indisponível</span>
                )}
              </div>

              <Button onClick={handleRegister} isLoading={isRegistering} className="w-full" size="lg">
                <Clock className="size-5 mr-2" />
                Registrar Ponto
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
