import React, { useState, useMemo, useEffect } from 'react';
import { 
  calculateAge, 
  calculateIMC, 
  getIMCClassification, 
  formatDecimalMinutes 
} from './utils/helpers';
import LoginScreen from './components/LoginScreen';
import Navbar from './utils/Navbar';
import StudentHeader from './components/StudentHeader';
import VolumeChart from './components/VolumeChart';

// --- (Constante da URL da API) ---
const API_URL = 'https://motor-3v-runclub.onrender.com';

// --- Componente da Aba Gerenciar Alunos (Sem Alterações) ---
const GerenciarAlunosTab = ({ students, setStudents, professorId }) => {
  const [modo, setModo] = useState('adicionar');
  const [alunoAtual, setAlunoAtual] = useState(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const limparFormulario = () => {
    setNome(''); setEmail(''); setSexo('Masculino');
    setDataNascimento(''); setPeso(''); setAltura('');
    setPassword('');
    setModo('adicionar'); setAlunoAtual(null); setError('');
  };

  const handleEditarClick = (aluno) => {
    setModo('editar');
    setAlunoAtual(aluno);
    setNome(aluno.nome_completo);
    setEmail(aluno.email || '');
    setSexo(aluno.sexo || 'Masculino');
    setDataNascimento(aluno.data_nascimento ? new Date(aluno.data_nascimento).toISOString().split('T')[0] : '');
    setPeso(aluno.peso_kg || '');
    setAltura(aluno.altura_cm || '');
    window.scrollTo(0, 0);
  };

  const handleDeletarClick = async (alunoId) => {
    if (!window.confirm('Tem certeza que deseja deletar este aluno? Todos os testes e prescrições dele serão perdidos.')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/alunos/${alunoId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar aluno');
      setStudents(prevStudents => prevStudents.filter(s => s.id !== alunoId));
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const dadosAluno = {
      professor_id: professorId, nome_completo: nome, sexo: sexo,
      data_nascimento: dataNascimento, email: email || null,
      peso_kg: parseFloat(peso) || null, altura_cm: parseFloat(altura) || null,
      password: password || null
    };
    
    try {
      let url = `${API_URL}/api/alunos`;
      let method = 'POST';
      if (modo === 'editar') {
        url = `${API_URL}/api/alunos/${alunoAtual.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAluno),
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao salvar aluno');
      }
      
      const alunoSalvo = await response.json();
      
      if (modo === 'adicionar') {
        setStudents(prevStudents => [{ ...alunoSalvo, tests: [] }, ...prevStudents]);
      } else {
        setStudents(prevStudents => prevStudents.map(s => 
          s.id === alunoSalvo.id ? { ...s, ...alunoSalvo, tests: s.tests } : s
        ));
      }
      limparFormulario();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          {modo === 'adicionar' ? 'Adicionar Novo Aluno' : `Editando: ${alunoAtual.nome_completo}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            {/* --- BLOCO NOVO --- */}
            <div>
              <label htmlFor="password_aluno" className="block text-sm font-medium text-gray-700">
                Senha Provisória (para Aluno)
              </label>
              <input 
                type="password" 
                id="password_aluno" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder={modo === 'editar' ? 'Deixe em branco para manter a senha atual' : 'Opcional'}
              />
            </div>
            {/* --- FIM DO BLOCO NOVO --- */}
            <div>
              <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">Sexo</label>
              <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label htmlFor="peso" className="block text-sm font-medium text-gray-700">Peso (kg)</label>
              <input type="number" step="0.1" id="peso" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ex: 80.5" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="altura" className="block text-sm font-medium text-gray-700">Altura (cm)</label>
              <input type="number" step="0.1" id="altura" value={altura} onChange={(e) => setAltura(e.target.value)} placeholder="Ex: 175.0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex space-x-4">
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (modo === 'adicionar' ? 'Adicionar Aluno' : 'Salvar Alterações')}
            </button>
            {modo === 'editar' && (
              <button type="button" onClick={limparFormulario} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md shadow-sm hover:bg-gray-400">
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Meus Alunos ({students.length})</h2>
        <div className="space-y-4">
          {students.map(aluno => (
            <div key={aluno.id} className="p-4 border rounded-md flex justify-between items-center">
              <div>
                <p className="font-semibold text-lg">{aluno.nome_completo}</p>
                <p className="text-sm text-gray-600">{aluno.email || 'Sem email'}</p>
                <p className="text-sm text-gray-600">
                  {calculateAge(aluno.data_nascimento)} anos | {aluno.peso_kg || 'N/A'} kg | {aluno.altura_cm || 'N/A'} cm
                </p>
              </div>
              <div className="space-x-2">
                <button onClick={() => handleEditarClick(aluno)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600">
                  Editar
                </button>
                <button onClick={() => handleDeletarClick(aluno.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700">
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const TestesAerobios = ({ student, onTestSaved }) => {
  const [testType, setTestType] = useState('cooper');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [testValue, setTestValue] = useState('');
  const [error, setError] = useState('');

  const calculateVO2max = (type, value) => {
    if (!value || value <= 0) return 0;
    switch (type) {
      case 'cooper': return (value - 504.9) / 44.73;
      case '2400m': return (28980 / value) + 3.5;
      case 'lima_vianna': return (3.333 * value) + 3.5;
      case '3600m': return 40.0;
      default: return 0;
    }
  };
  const getVO2Classification = (vo2max, age, sex) => {
    if (vo2max > 45) return "Excelente";
    if (vo2max > 38) return "Bom";
    if (vo2max > 30) return "Médio";
    return "Baixo";
  };
  const handleSaveTest = async (e) => {
    e.preventDefault();
    setError('');
    const age = calculateAge(student.data_nascimento);
    const sex = student.sexo;
    const valueNum = parseFloat(testValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setError('Por favor, insira um valor numérico válido e positivo.');
      return;
    }
    const vo2max = calculateVO2max(testType, valueNum);
    const classification = getVO2Classification(vo2max, age, sex);
    const newTest = {
        aluno_id: student.id, date: testDate, type: testType,
        value: valueNum, vo2max: vo2max, classification: classification
    };
    try {
      await onTestSaved(newTest);
      setTestValue('');
      setTestDate(new Date().toISOString().split('T')[0]);
      setTestType('cooper');
    } catch (error) {
      console.error("Erro ao salvar o teste:", error);
      let errorMsg = `Erro ao salvar: ${error.message}`;
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
          errorMsg += ' (O backend em http://localhost:3001 está rodando?)';
      }
      setError(errorMsg);
    }
  };
  const getTestInputLabel = () => {
    switch (testType) {
      case 'cooper': return 'Distância (m) em 12 min:';
      case '2400m': return 'Tempo (segundos) para 2400m:';
      case '3600m': return 'Tempo (segundos) para 3600m:';
      case 'lima_vianna': return 'Velocidade (km/h) último estágio:';
      default: return 'Valor:';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Registrar Novo Teste</h3>
      <form onSubmit={handleSaveTest} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="testType" className="block text-sm font-medium text-gray-700">Tipo de Teste</label>
            <select id="testType" value={testType} onChange={(e) => setTestType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="cooper">Cooper 12 min</option>
              <option value="2400m">Teste 2400m</option>
              <option value="3600m">Teste 3600m</option>
              <option value="lima_vianna">Teste Lima e Vianna</option>
            </select>
          </div>
          <div>
            <label htmlFor="testDate" className="block text-sm font-medium text-gray-700">Data do Teste</label>
            <input type="date" id="testDate" value={testDate} onChange={(e) => setTestDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" required />
          </div>
          <div>
            <label htmlFor="testValue" className="block text-sm font-medium text-gray-700">{getTestInputLabel()}</label>
            <input type="number" step="0.1" id="testValue" value={testValue} onChange={(e) => setTestValue(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Insira o valor" required />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Salvar Teste
        </button>
      </form>
      <hr className="my-6" />
      <h3 className="text-xl font-semibold mb-4">Histórico de Testes</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teste</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VO2 Max</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classificação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!student.tests || student.tests.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Nenhum teste registrado.</td></tr>
            ) : (
              student.tests.map(test => (
                <tr key={test.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(test.data_teste).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.tipo_teste}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.valor_metric}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{parseFloat(test.vo2max).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.classificacao}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- (MODIFICADO) Componente de Prescrição ---
// Atualizado com a lógica de Vianna 2025 e campos calculados
// --- (CORRIGIDO) Componente de Prescrição ---
// Mantém a lógica visual nova (Tempo vs Distância) mas usa o salvamento antigo (Seguro)
// --- (CORRIGIDO FINAL) Componente de Prescrição COMPLETO ---
// Agora com TODAS as seções (1, 2, 3, 4 e 5) visíveis
// --- (COM GRÁFICO) Componente de Prescrição COMPLETO ---
const PrescricaoAerobia = ({ 
  student, progressionData, setProgressionData, 
  plannedSessions, setPlannedSessions, initialPlanning
}) => {
  
  // 1. CONSTANTES
  const recomendacoesVianna = useMemo(() => ({
    'sedentario': { horas: '50 - 75', duracaoSemanal: 'Aprox. 150 min', frequencia: '2 - 5 sessões' },
    'iniciante': { horas: '100 - 150', duracaoSemanal: '4 - 5 horas', frequencia: '3 - 5 sessões' },
    'intermediario': { horas: '150 - 180', duracaoSemanal: '6 - 8 horas', frequencia: '4 - 6 sessões' },
    'atleta': { horas: 'Mais de 200', duracaoSemanal: '8 - 12 horas', frequencia: '5 - 8 sessões' }
  }), []);

  const intensityZones = useMemo(() => [
    { label: '170%', value: 1.7 }, { label: '160%', value: 1.6 }, { label: '150%', value: 1.5 },
    { label: '110%', value: 1.1 }, { label: '105%', value: 1.05 }, { label: '100%', value: 1.0 },
    { label: '95%', value: 0.95 }, { label: '90%', value: 0.9 }, { label: '85%', value: 0.85 },
    { label: '80%', value: 0.8 }, { label: '75%', value: 0.75 }, { label: '70%', value: 0.7 },
    { label: '65%', value: 0.65 }, { label: '60%', value: 0.6 },
  ], []);

  const lastTest = student.tests.length > 0 ? student.tests[0] : null;
  const vo2max = lastTest ? parseFloat(lastTest.vo2max) : 0;

  // 2. ESTADOS
  const [distanciaCorrida, setDistanciaCorrida] = useState(1000);
  const [tipoPeriodizacao, setTipoPeriodizacao] = useState(initialPlanning?.tipo_periodizacao || 'linear');
  const [classificacaoVianna, setClassificacaoVianna] = useState(initialPlanning?.classificacao_vianna || 'sedentario');
  
  const [duracaoSemana, setDuracaoSemana] = useState(initialPlanning?.duracao_semana_min || 150);
  const [frequenciaSemanal, setFrequenciaSemanal] = useState(initialPlanning?.frequencia_semanal || 3);
  const [numSessoes, setNumSessoes] = useState(initialPlanning?.num_sessoes_total || 72);
  const [tempoSessaoMedio, setTempoSessaoMedio] = useState(initialPlanning?.tempo_sessao_medio_min || 50);

  // Estados da Sessão
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedSession, setSelectedSession] = useState(1);
  const [saveMessage, setSaveMessage] = useState('');
  const [sessionBlocks, setSessionBlocks] = useState([]);
  const [error, setError] = useState('');

  // Estados do Bloco (Lógica Tempo vs Distância)
  const [blockType, setBlockType] = useState('aquecimento');
  const [blockLabel, setBlockLabel] = useState('60%'); 
  const [blockDuration, setBlockDuration] = useState(10); 
  const [blockDistance, setBlockDistance] = useState(0); 
  const [targetType, setTargetType] = useState('time'); 
  const [customDescription, setCustomDescription] = useState(''); 

  // 3. CÁLCULOS
  const recomendacaoAtual = useMemo(() => {
    return recomendacoesVianna[classificacaoVianna] || recomendacoesVianna['sedentario'];
  }, [classificacaoVianna, recomendacoesVianna]);

  const horasCalculadas = useMemo(() => {
    const totalMinutosCorreto = (tempoSessaoMedio || 0) * (numSessoes || 0);
    return parseFloat((totalMinutosCorreto / 60).toFixed(2));
  }, [tempoSessaoMedio, numSessoes]);

  const calculatedRows = useMemo(() => {
    if (!vo2max) return []; 
    return intensityZones.map(zone => {
      const vo2Alvo = vo2max * zone.value;
      const mPerMin = (vo2Alvo - 3.5) / 0.2;
      const kmPerHour = (mPerMin * 60) / 1000;
      const minPerKm = 60 / kmPerHour;
      const tempoPerDistancia = distanciaCorrida / mPerMin;
      const isValid = mPerMin > 0 && kmPerHour > 0;
      return {
        label: zone.label, 
        vo2Alvo: vo2Alvo.toFixed(2),
        mPerMin: isValid ? mPerMin.toFixed(2) : '---',
        kmPerHour: isValid ? kmPerHour.toFixed(2) : '---',
        minPerKm: isValid ? formatDecimalMinutes(minPerKm) : '---',
        tempoPerDistancia: (isValid && distanciaCorrida > 0) ? formatDecimalMinutes(tempoPerDistancia) : '---',
      };
    });
  }, [vo2max, distanciaCorrida, intensityZones]);

  const selectedBlockData = useMemo(() => {
    if (!blockLabel || !calculatedRows) return null;
    return calculatedRows.find(row => row.label === blockLabel);
  }, [blockLabel, calculatedRows]);

  const sessionOptions = useMemo(() => {
    if (frequenciaSemanal <= 0) return [];
    return Array.from({ length: frequenciaSemanal }, (_, i) => i + 1);
  }, [frequenciaSemanal]);

  const selectedWeekFocus = useMemo(() => {
    return progressionData.find(row => row.week === selectedWeek)?.intensity || 'N/A';
  }, [selectedWeek, progressionData]);

  // 4. EFEITOS
  useEffect(() => {
    if (classificacaoVianna === 'sedentario') { setDuracaoSemana(150); setTempoSessaoMedio(50); setFrequenciaSemanal(3); } 
    else if (classificacaoVianna === 'iniciante') { setDuracaoSemana(240); setTempoSessaoMedio(60); setFrequenciaSemanal(4); } 
    else if (classificacaoVianna === 'intermediario') { setDuracaoSemana(360); setTempoSessaoMedio(60); setFrequenciaSemanal(5); } 
    else if (classificacaoVianna === 'atleta') { setDuracaoSemana(480); setTempoSessaoMedio(60); setFrequenciaSemanal(5); }
  }, [classificacaoVianna]);

  useEffect(() => {
    const key = `${selectedWeek}-${selectedSession}`;
    setSessionBlocks(plannedSessions[key] || []);
    setSaveMessage('');
  }, [selectedWeek, selectedSession, plannedSessions]);

  useEffect(() => { setSelectedSession(1); }, [frequenciaSemanal]);

  // 5. AÇÕES
  const handleCalculateProgression = async () => {
    setError('');
    
    const freq = Number(frequenciaSemanal);
    const dur = Number(duracaoSemana);
    const sessoes = Number(numSessoes);

    if (!freq || freq <= 0 || !dur || dur <= 0) {
      setError("Preencha Frequência e Duração com números válidos.");
      return;
    }

    let progressionParams = { startVolumeFactor: 0.8, endVolumeFactor: 1.2, startIntensity: 60, endIntensity: 70 };
    if (classificacaoVianna === 'intermediario') { progressionParams = { startVolumeFactor: 0.9, endVolumeFactor: 1.1, startIntensity: 70, endIntensity: 85 }; } 
    else if (classificacaoVianna === 'atleta') { progressionParams = { startVolumeFactor: 1.0, endVolumeFactor: 1.0, startIntensity: 75, endIntensity: 95 }; }

    const totalWeeks = Math.ceil(sessoes / freq);
    let newProgressionData = [];
    
    for (let week = 1; week <= totalWeeks; week++) {
      const progressFactor = (totalWeeks > 1) ? (week - 1) / (totalWeeks - 1) : 1;
      const currentVolume = dur * (progressionParams.startVolumeFactor + (progressionParams.endVolumeFactor - progressionParams.startVolumeFactor) * progressFactor);
      const currentIntensity = progressionParams.startIntensity + (progressionParams.endIntensity - progressionParams.startIntensity) * progressFactor;
      
      let intensityFocus = '';
      
      // 1. Se for Ondulatória (Para qualquer nível)
      if (tipoPeriodizacao === 'ondulatoria') {
         // Criamos uma variação simples (ex: +/- 5%) para não ficar reto
         const oscilacao = (week % 2 === 0) ? 5 : -5; // Semana par sobe, ímpar desce (exemplo simples)
         const intOndulatoria = currentIntensity + oscilacao;
         intensityFocus = `Ondulatória (Var. ~${intOndulatoria.toFixed(0)}%)`;
      } 
      // 2. Se for Linear (Padrão)
      else {
         intensityFocus = `Linear (Foco em ~${currentIntensity.toFixed(0)}%)`;
      }

      // (Mantém a lógica especial de Atleta se você quiser, ou usa a geral acima)
      if (classificacaoVianna === 'atleta' && tipoPeriodizacao === 'ondulatoria') {
        const focusFacil = (progressionParams.startIntensity + (currentIntensity - progressionParams.startIntensity) * 0.5).toFixed(0);
        const focusDificil = (currentIntensity).toFixed(0);
        intensityFocus = `Ondulatório (ex: 2x ${focusFacil}%, 1x ${focusDificil}%)`;
      }

      newProgressionData.push({ week: week, volume: currentVolume.toFixed(0), intensity: intensityFocus });
    }

    // Atualiza a tela
    setProgressionData(newProgressionData); 
    setSelectedWeek(1); setSelectedSession(1); setSessionBlocks([]);

    try {
      const planningData = {
        aluno_id: student.id, 
        tipo_periodizacao: tipoPeriodizacao,
        classificacao_vianna: classificacaoVianna, 
        horas_semestre: horasCalculadas, 
        duracao_semana_min: dur, 
        frequencia_semanal: freq,
        num_sessoes_total: sessoes, 
        progression_data_json: JSON.stringify(newProgressionData)
      };
      
      const response = await fetch(`${API_URL}/api/periodizacao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planningData)
      });
      if (!response.ok) throw new Error(`Erro ${response.status} ao salvar.`);
      
      console.log("Salvo com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      setError(`Cálculo realizado, mas erro ao salvar: ${error.message}`);
    }
  };

  const handleAddBlock = () => {
    let newBlock = { id: crypto.randomUUID(), type: blockType, duration: blockDuration };
    
    if (blockType === 'principal') {
      if (!selectedBlockData) return;
      newBlock = {
        ...newBlock,
        label: blockLabel,
        distance: blockDistance,
        speed: selectedBlockData.kmPerHour,
        pace: selectedBlockData.minPerKm,
        description: null
      };
    } else {
      newBlock = {
        ...newBlock,
        label: 'Livre', distance: 0, speed: '-', pace: '-',
        description: customDescription || 'Sem descrição'
      };
    }
    setSessionBlocks(prev => [...prev, newBlock]);
    setBlockDuration(10); setBlockDistance(0); setCustomDescription('');
  };

  const handleRemoveBlock = (blockId) => {
    setSessionBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSaveSession = async () => {
    const key = `${selectedWeek}-${selectedSession}`;
    setSaveMessage(''); setError('');
    try {
      const sessionData = {
        aluno_id: student.id, semana: selectedWeek, sessao: selectedSession,
        blocos_json: JSON.stringify(sessionBlocks)
      };
      const response = await fetch(`${API_URL}/api/sessao`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });
      if (!response.ok) throw new Error(`Falha ao salvar sessão (${response.status})`);
      setPlannedSessions(prev => ({ ...prev, [key]: sessionBlocks }));
      setSaveMessage('Sessão salva com sucesso!');
      setTimeout(() => setSaveMessage(''), 2000);
      const nextSession = selectedSession + 1;
      if (nextSession <= frequenciaSemanal) { setSelectedSession(nextSession); } 
      else {
        const nextWeek = selectedWeek + 1;
        if (nextWeek <= progressionData.length) { setSelectedWeek(nextWeek); setSelectedSession(1); } 
        else { setSaveMessage('Periodização completa!'); }
      }
    } catch (error) {
      console.error("Erro:", error);
      setError(`Falha ao salvar sessão: ${error.message}`);
    }
  };

  // --- JSX (VISUAL) ---
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Prescrição de Treino Aeróbio</h3>
      
      {/* Cabeçalho */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold">Dados do Aluno:</h4>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span><strong>Aluno:</strong> {student.nome_completo}</span>
            <span><strong>VO2 Max:</strong> {lastTest ? parseFloat(lastTest.vo2max).toFixed(2) : 'N/A'}</span>
            <span><strong>Classificação:</strong> {lastTest ? lastTest.classificacao : 'N/A'}</span>
        </div>
      </div>
      {error && <p className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {/* SEÇÃO 1: PLANEJAMENTO */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">1. Planejamento Semestral</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de Periodização</label>
            <select value={tipoPeriodizacao} onChange={(e) => setTipoPeriodizacao(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="linear">Linear</option> <option value="ondulatoria">Ondulatória</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Classificação</label>
            <select value={classificacaoVianna} onChange={(e) => setClassificacaoVianna(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              {Object.keys(recomendacoesVianna).map(k => (<option key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duração/Semana (min)</label>
            <input type="number" value={duracaoSemana} onChange={(e) => setDuracaoSemana(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Frequência Semanal</label>
            <input type="number" value={frequenciaSemanal} onChange={(e) => setFrequenciaSemanal(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Sessões</label>
            <input type="number" value={numSessoes} onChange={(e) => setNumSessoes(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tempo Médio (min)</label>
            <input type="number" value={tempoSessaoMedio} onChange={(e) => setTempoSessaoMedio(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
        </div>
        <button type="button" onClick={handleCalculateProgression} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
          {initialPlanning ? 'Re-Calcular Progressão' : 'Calcular Progressão'}
        </button>
      </div>

      {/* --- AQUI ENTRA O GRÁFICO (NOVO!) --- */}
      {progressionData.length > 0 && (
        <VolumeChart progressionData={progressionData} />
      )}

      {/* SEÇÃO 2: TABELA DE PROGRESSÃO */}
      {progressionData.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">2. Sugestão de Progressão Semestral</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Semana</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Volume Total (min)</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Foco Intensidade (% VO2)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {progressionData.map(row => (
                  <tr key={row.week}>
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{row.week}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">~{row.volume} min</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{row.intensity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEÇÃO 3: CALCULADORA (Com destaque automático do Foco) */}
      <div className="bg-yellow-100 p-4 rounded-lg shadow-inner mb-6">
        <h4 className="text-lg font-semibold text-yellow-900 mb-4">3. Tabela de Cálculos de Intensidade (Ferramenta)</h4>
        
        {/* Input da Distância de Referência */}
        <div className="mb-4">
          <label htmlFor="distancia" className="block text-sm font-medium text-gray-700">Distância (m) para Cálculo de Tempo:</label>
          <input type="number" id="distancia" value={distanciaCorrida} onChange={(e) => setDistanciaCorrida(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm" placeholder="Ex: 1000" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-yellow-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-yellow-900 uppercase">Rótulo</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-yellow-900 uppercase">VO2 Alvo</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-yellow-900 uppercase">km/h</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-yellow-900 uppercase">Pace</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-yellow-900 uppercase">Tempo ({distanciaCorrida}m)</th>
              </tr>
            </thead>
            <tbody className="bg-yellow-50 divide-y divide-yellow-200">
              {calculatedRows.map(row => {
                // --- LÓGICA DO DESTAQUE ---
                // 1. Tenta achar o número % no texto do foco (ex: "~60%")
                const match = selectedWeekFocus ? selectedWeekFocus.match(/(\d+)%/) : null;
                const focoNumero = match ? match[1] : null; // Pega o "60"

                // 2. Verifica se a linha atual é a do foco
                const ehFoco = focoNumero && row.label.includes(focoNumero);
                
                // 3. Verifica se a linha atual é a selecionada no dropdown "Adicionar Bloco"
                const ehSelecionado = row.label === blockLabel;

                return (
                  <tr key={row.label} className={ehFoco ? "bg-yellow-200 border-l-4 border-indigo-600 transition-colors duration-300" : ""}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ehFoco ? '👉 ' : ''} 
                      {ehSelecionado ? '✅ ' : ''} 
                      {row.label}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{row.vo2Alvo}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{row.kmPerHour}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{row.minPerKm}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{row.tempoPerDistancia}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEÇÃO 4: ZONAS */}
      <div className="bg-rose-100 p-4 rounded-lg shadow-inner mb-6">
        <h4 className="text-lg font-semibold text-rose-900 mb-4">4. Guia de Zonas de Treinamento</h4>
        <div className="text-sm text-rose-800">
          <p><strong>170-150%:</strong> Potência Aeróbia (Tiros Curtos)</p>
          <p><strong>110-100%:</strong> VO2 Max (Intervalados)</p>
          <p><strong>95-90%:</strong> Limiar Anaeróbio (Ritmo Forte)</p>
          <p><strong>85-75%:</strong> Aeróbio Moderado (Ritmo Confortável)</p>
          <p><strong>70-60%:</strong> Endurance/Recuperação (Longo/Leve)</p>
        </div>
      </div>

      {/* SEÇÃO 5: MONTAR TREINO */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold">5. Montar Treino da Sessão</h4>
        {progressionData.length === 0 ? (
          <p className="text-gray-500 bg-gray-100 p-4 rounded-md">Calcule a progressão primeiro.</p>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg shadow">
            
            {/* Seletores Semana/Sessão */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Semana</label>
                <select value={selectedWeek} onChange={(e) => setSelectedWeek(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  {progressionData.map(row => (<option key={row.week} value={row.week}>{row.week}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sessão</label>
                <select value={selectedSession} onChange={(e) => setSelectedSession(Number(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  {sessionOptions.map(n => (<option key={n} value={n}>{n}</option>))}
                </select>
              </div>
              <div className="md:col-span-1 p-2 bg-indigo-100 text-indigo-800 rounded-md flex items-center">
                <span className="text-sm font-semibold">Foco: {selectedWeekFocus}</span>
              </div>
            </div>

            {/* Formulário de Adição */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-md font-semibold text-gray-800 mb-2">Adicionar Bloco</h5>
              
              {/* Linha 1: Tipo */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Tipo de Bloco</label>
                <select value={blockType} onChange={(e) => setBlockType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="aquecimento">Aquecimento</option>
                  <option value="principal">Principal</option>
                  <option value="volta_calma">Volta à Calma</option>
                </select>
              </div>

              {/* Condicional: Se Principal */}
              {blockType === 'principal' ? (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Intensidade (% VO2)</label>
                      <select value={blockLabel} onChange={(e) => setBlockLabel(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        {intensityZones.map(z => (<option key={z.label} value={z.label}>{z.label}</option>))}
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-6">
                      <span className="text-sm font-bold text-gray-700">Definir Meta por:</span>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="radio" checked={targetType === 'time'} onChange={() => setTargetType('time')} className="form-radio text-indigo-600" />
                        <span className="ml-2 text-sm">Tempo</span>
                      </label>
                      <label className="inline-flex items-center cursor-pointer">
                        <input type="radio" checked={targetType === 'distance'} onChange={() => setTargetType('distance')} className="form-radio text-indigo-600" />
                        <span className="ml-2 text-sm">Distância</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Duração (min)</label>
                      <input type="number" value={blockDuration} 
                        disabled={targetType === 'distance'}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setBlockDuration(val);
                          if (selectedBlockData && val > 0) {
                             setBlockDistance(Math.round(val * parseFloat(selectedBlockData.mPerMin)));
                          }
                        }}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${targetType === 'distance' ? 'bg-gray-200' : 'bg-white'}`} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Distância (m)</label>
                      <input type="number" value={blockDistance} 
                        disabled={targetType === 'time'}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setBlockDistance(val);
                          if (selectedBlockData && val > 0) {
                             const t = val / parseFloat(selectedBlockData.mPerMin);
                             setBlockDuration(parseFloat(t.toFixed(1)));
                          }
                        }}
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${targetType === 'time' ? 'bg-gray-200' : 'bg-white'}`} 
                      />
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 flex space-x-4">
                    <span>Velocidade: <strong>{selectedBlockData?.kmPerHour} km/h</strong></span>
                    <span>Pace: <strong>{selectedBlockData?.minPerKm} min/km</strong></span>
                  </div>
                </div>
              ) : (
                /* Condicional: Se Aquecimento/Volta */
                <div className="bg-gray-100 p-4 rounded-md">
                   <label className="block text-sm font-medium text-gray-700">Duração Estimada (min)</label>
                   <input type="number" value={blockDuration} onChange={(e) => setBlockDuration(Number(e.target.value))} className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm" />
                   
                   <label className="block text-sm font-medium text-gray-700 mt-3">Descrição do Exercício</label>
                   <textarea value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows={2} placeholder="Ex: Trote leve, alongamento..." />
                </div>
              )}

              <button type="button" onClick={handleAddBlock} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                Adicionar Bloco
              </button>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-4">
              <h5 className="text-md font-semibold text-gray-800 mb-2">Resumo da Sessão</h5>
              <ul className="divide-y divide-gray-300 bg-white rounded-md border border-gray-300">
                {sessionBlocks.map((block, index) => (
                  <li key={block.id} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase text-indigo-600 block">{block.type}</span>
                      {block.type === 'principal' ? (
                         <span className="text-gray-800">{block.duration} min | {block.distance}m @ {block.label} <span className="text-gray-500 text-sm">({block.pace}/km)</span></span>
                      ) : (
                         <span className="text-gray-800">{block.duration} min - {block.description}</span>
                      )}
                    </div>
                    <button onClick={() => handleRemoveBlock(block.id)} className="text-red-600 text-sm hover:underline">Remover</button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center mt-6">
              <button type="button" onClick={handleSaveSession} disabled={sessionBlocks.length === 0} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400">
                Salvar Sessão
              </button>
              {saveMessage && <span className="ml-4 text-green-600 text-sm">{saveMessage}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ResumoPeriodizacao = ({ progressionData, plannedSessions, student }) => {
  const printStyles = `
    @media print { body * { visibility: hidden; } #printable-summary, #printable-summary * { visibility: visible; }
      #printable-summary { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; font-family: Arial, sans-serif; }
      .no-print { display: none; } .page-break { page-break-after: always; }
      #printable-summary h1 { font-size: 28px; color: black; margin-bottom: 10px; }
      #printable-summary h2 { font-size: 24px; color: black; border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
      #printable-summary h4 { font-size: 16px; color: #555; font-weight: bold; }
      #printable-summary ul { list-style-type: none; padding-left: 0; margin-top: 10px; }
      #printable-summary li { font-size: 14px; margin-bottom: 5px; }
      #printable-summary .session-summary p { font-size: 14px; color: #444; }
    }`;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <style>{printStyles}</style>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Resumo da Periodização</h3>
        <button onClick={() => window.print()} className="no-print px-4 py-2 bg-gray-600 text-white rounded-md shadow-sm hover:bg-gray-700">
          Imprimir Resumo
        </button>
      </div>
      {progressionData.length === 0 ? (
        <p className="text-gray-500">Nenhum dado de progressão calculado. Vá para a aba "Prescrição" e calcule a sugestão.</p>
      ) : (
        <div id="printable-summary">
          <h1 className="text-3xl font-bold mb-4">Plano de Treino - {student.nome_completo}</h1>
          {progressionData.map((weekData) => {
            const sessionsForWeek = Object.keys(plannedSessions)
              .filter(key => key.startsWith(`${weekData.week}-`))
              .sort((a, b) => parseInt(a.split('-')[1]) - parseInt(b.split('-')[1]));
            return (
              <div key={weekData.week} className="mb-8 p-4 border border-gray-200 rounded-lg page-break">
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">Semana {weekData.week}</h2>
                <p className="text-md text-gray-600 mb-4"><strong>Foco da Semana:</strong> {weekData.intensity}</p>
                {sessionsForWeek.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma sessão montada para esta semana.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sessionsForWeek.map(sessionKey => {
                      const sessionNum = sessionKey.split('-')[1];
                      const blocks = plannedSessions[sessionKey] || [];
                      const totalDuration = blocks.reduce((sum, b) => sum + (b.duration || 0), 0);
                      const totalDistance = blocks.reduce((sum, b) => sum + (b.distance || 0), 0);
                      return (
                        <div key={sessionKey} className="bg-gray-50 p-4 rounded-md shadow-sm session-summary">
                          <h4 className="text-lg font-semibold text-gray-800">Sessão {sessionNum}</h4>
                          <div className="text-sm text-gray-700 mt-2 space-y-1">
                            <p><strong>Tempo Total:</strong> {totalDuration} min</p>
                            <p><strong>Volume Total:</strong> {totalDistance} m</p>
                          </div>
                          <ul className="mt-4 space-y-2">
                            {blocks.map((block, index) => (
                              <li key={block.id} className="text-sm border-t border-gray-200 pt-2">
                                <span className="block text-xs font-medium uppercase text-indigo-600">{block.type}</span>
                                <span className="font-semibold">{index + 1}. </span>
                                {block.duration > 0 && <span>{block.duration} min </span>}
                                {block.distance > 0 && <span>{block.distance} m </span>}
                                <span className="text-gray-700">@ {block.label}</span>
                                <span className="text-xs text-gray-500 block"> (≅ {block.speed} km/h | {block.pace} min/km)</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- (MODIFICADO) Componente da Periodização Vianna (v2025) ---
// (Adicionado Lógica para SALVAR e CARREGAR o plano)
const ViannaPeriodizacaoTab = ({ student }) => {
  // --- Definições (Baseado no seu input) ---
  const classificacaoInfo = useMemo(() => ({
    'sedentario': { id: 'sedentario', nome: 'Aluno Sedentário', horas: '50 - 99' },
    'iniciante': { id: 'iniciante', nome: 'Aluno Iniciante', horas: '100 - 149' },
    'intermediario': { id: 'intermediario', nome: 'Aluno Intermediário', horas: '150 - 199' },
    'atleta': { id: 'atleta', nome: 'Atleta Recreacional', horas: '>= 200' },
  }), []);

  const macroModelos = useMemo(() => ({
    'vianna_6': {
      nome: 'Sugestão Vianna (6 Meses)',
      meses: 6,
      percentuais: [70, 80, 90, 100, 90, 80]
    },
    'custom': {
      nome: 'Customizado (Não implementado)',
      meses: 0,
      percentuais: []
    }
  }), []);
  
  const mesoTipos = useMemo(() => ([
    { id: 'aquisicao_1', nome: 'Aquisição I (Ass)', semanas: [
      { perc: 20, micro: 'Adp' }, { perc: 25, micro: 'Int' }, { perc: 30, micro: 'Int' }, { perc: 25, micro: 'Rec' }
    ]},
    { id: 'aquisicao_2', nome: 'Aquisição II (Ass)', semanas: [
      { perc: 22, micro: 'Adp' }, { perc: 26, micro: 'Int' }, { perc: 30, micro: 'Int' }, { perc: 22, micro: 'Rec' }
    ]},
    { id: 'transformacao_1', nome: 'Transformação I (Tra)', semanas: [
      { perc: 25, micro: 'Est' }, { perc: 25, micro: 'Int' }, { perc: 28, micro: 'Int' }, { perc: 22, micro: 'Rec' }
    ]},
    { id: 'transformacao_2', nome: 'Transformação II (Tra)', semanas: [
      { perc: 26, micro: 'Int' }, { perc: 24, micro: 'Est' }, { perc: 28, micro: 'Int' }, { perc: 22, micro: 'Rec' }
    ]},
    { id: 'realizacao', nome: 'Realização (Rea)', semanas: [
      { perc: 26, micro: 'Int' }, { perc: 24, micro: 'Est' }, { perc: 26, micro: 'Int' }, { perc: 24, micro: 'Rec' }
    ]},
    { id: 'estabilizador', nome: 'Estabilizador (Est)', semanas: [
      { perc: 25, micro: 'Est' }, { perc: 25, micro: 'Est' }, { perc: 25, micro: 'Est' }, { perc: 25, micro: 'Est' }
    ]},
    { id: 'transitorio', nome: 'Transitório (Trs)', semanas: [
      { perc: 0, micro: 'Trs' }, { perc: 0, micro: 'Trs' }, { perc: 0, micro: 'Trs' }, { perc: 0, micro: 'Trs' }
    ]},
  ]), []);

  
  // --- Estados do Formulário ---
  const [classificacao, setClassificacao] = useState(classificacaoInfo.sedentario.id);
  const [horasAlvo, setHorasAlvo] = useState(75);
  const [duracaoMacro, setDuracaoMacro] = useState(6);
  const [modeloMacro, setModeloMacro] = useState(macroModelos.vianna_6.nome);
  const [mesociclos, setMesociclos] = useState([]);
  const [planoMestre, setPlanoMestre] = useState([]);
  
  // (NOVO) Estados de loading e feedback
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(''); // 'Salvando...', 'Salvo!', 'Erro'

  const recomendacaoAtual = classificacaoInfo[classificacao];

  
  // --- Lógica do Componente ---

  // (MODIFICADO) useEffect para CARREGAR DADOS SALVOS
  useEffect(() => {
    const carregarPlanoSalvo = async () => {
      if (!student || !student.id) return;
      
      setIsLoading(true);
      setPlanoMestre([]);
      setSaveStatus('');
      
      try {
        const response = await fetch(`${API_URL}/api/plano-vianna/${student.id}`);
        
        if (response.ok) {
          // (NOVO) Se encontrou um plano, preenche os estados!
          const planoSalvo = await response.json();
          const secao1 = JSON.parse(planoSalvo.inputs_secao1_json);
          const secao2 = JSON.parse(planoSalvo.inputs_secao2_json);
          const secao3 = JSON.parse(planoSalvo.plano_mestre_json);
          
          setClassificacao(secao1.classificacao);
          setHorasAlvo(secao1.horasAlvo);
          setDuracaoMacro(secao1.duracaoMacro);
          setModeloMacro(secao1.modeloMacro);
          setMesociclos(secao2);
          setPlanoMestre(secao3);
          
        } else {
          // (NOVO) Se não encontrou (404), reseta o formulário
          // (Isso é importante ao trocar de aluno)
          setClassificacao(classificacaoInfo.sedentario.id);
          setHorasAlvo(75);
          setDuracaoMacro(6);
          setModeloMacro(macroModelos.vianna_6.nome);
          // O useEffect de 'duracaoMacro' vai recriar o 'mesociclos'
        }
      } catch (err) {
        console.error("Erro ao carregar plano Vianna", err);
      }
      setIsLoading(false);
    };
    
    carregarPlanoSalvo();
  // (MODIFICADO) Roda toda vez que o 'student' (aluno selecionado) mudar
  }, [student, classificacaoInfo, macroModelos]);


  useEffect(() => {
    // Ajusta a duração do macro se o modelo mudar
    const modelo = Object.values(macroModelos).find(m => m.nome === modeloMacro);
    if (modelo && modelo.meses > 0) {
      setDuracaoMacro(modelo.meses);
    }
  }, [modeloMacro, macroModelos]);
  
  useEffect(() => {
    // Recria a configuração dos mesociclos quando a duração mudar
    // (NOVO) Só recria se NÃO estiver carregando um plano
    if (!isLoading) {
      const novosMesos = Array.from({ length: duracaoMacro }, (_, index) => ({
        mes: index + 1,
        tipoMesoId: mesoTipos[0].id, // Default para 'Aquisição I'
        sessoesPorSemana: 3 // Default para 3 sessões
      }));
      setMesociclos(novosMesos);
    }
  }, [duracaoMacro, mesoTipos, isLoading]);

  const handleMesoChange = (indexDoMes, campo, valor) => {
    const novosMesos = [...mesociclos];
    novosMesos[indexDoMes][campo] = valor;
    setMesociclos(novosMesos);
  };
  
  const handleCalcularPlano = () => {
    const modelo = Object.values(macroModelos).find(m => m.nome === modeloMacro);
    if (!modelo || modelo.nome === 'Customizado') {
      alert("Por favor, selecione um modelo de macrociclo válido.");
      return;
    }
    
    const somaPercentuaisMacro = modelo.percentuais.reduce((soma, perc) => soma + perc, 0);
    if (somaPercentuaisMacro === 0) {
        alert("Modelo de macro inválido, soma dos percentuais é zero.");
        return;
    }
    const razaoHoras = horasAlvo / somaPercentuaisMacro;
    
    let planoCalculado = [];
    let semanaGlobal = 1;

    for (let i = 0; i < duracaoMacro; i++) {
      const mesConfig = mesociclos[i];
      const mesPercentual = modelo.percentuais[i];
      
      const horasTotaisMes = razaoHoras * mesPercentual;
      
      const tipoMesoInfo = mesoTipos.find(t => t.id === mesConfig.tipoMesoId);
      if (!tipoMesoInfo) continue;

      for (let j = 0; j < 4; j++) {
        const semanaInfo = tipoMesoInfo.semanas[j];
        
        const volumeHorasSemana = horasTotaisMes * (semanaInfo.perc / 100);
        
        const sessoes = mesConfig.sessoesPorSemana;
        if (sessoes <= 0) continue;
        
        const volumeHorasSessao = volumeHorasSemana / sessoes;
        const volumeMinutosSessao = Math.round(volumeHorasSessao * 60);
        const volumeMinutosSemana = Math.round(volumeHorasSemana * 60);

        planoCalculado.push({
          id: semanaGlobal,
          mes: mesConfig.mes,
          semanaDoMes: j + 1,
          semanaGlobal: semanaGlobal,
          tipoMeso: tipoMesoInfo.nome,
          microciclo: `${semanaInfo.perc}% (${semanaInfo.micro})`,
          // (MODIFICADO) Salvando os números puros
          volumeSemana_min: volumeMinutosSemana,
          sessoes: sessoes,
          volumeSessao_min: volumeMinutosSessao
        });
        semanaGlobal++;
      }
    }
    setPlanoMestre(planoCalculado);
    setSaveStatus(''); // Reseta o status de salvo
  };

  // (NOVO) Função para SALVAR o plano no backend
  const handleSalvarPlano = async () => {
    if (planoMestre.length === 0) {
      alert("Calcule o plano primeiro antes de salvar.");
      return;
    }
    
    setSaveStatus('Salvando...');
    
    // 1. Agrupa os inputs da Seção 1
    const inputs_secao1 = {
      classificacao, horasAlvo, duracaoMacro, modeloMacro
    };
    
    // 2. Os inputs da Seção 2 são o estado 'mesociclos'
    
    // 3. Os resultados da Seção 3 são o estado 'planoMestre'
    
    try {
      const response = await fetch(`${API_URL}/api/plano-vianna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: student.id,
          inputs_secao1_json: JSON.stringify(inputs_secao1),
          inputs_secao2_json: JSON.stringify(mesociclos),
          plano_mestre_json: JSON.stringify(planoMestre)
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o plano no servidor.');
      }
      
      setSaveStatus('Plano salvo com sucesso!');
      
    } catch (err) {
      console.error(err);
      setSaveStatus(`Erro ao salvar: ${err.message}`);
    }
  };

  
  // --- Renderização ---

  if (!student) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
        Por favor, selecione um aluno na aba "Prescrição de Alunos" para começar.
      </div>
    );
  }
  
  // (NOVO) Tela de Loading
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Carregando plano salvo...
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <StudentHeader student={student} />
      
      {/* --- Seção 1: Configuração do Macrociclo (Inputs) --- */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-6 border-b pb-3 text-indigo-700">
          Seção 1: Configuração do Macrociclo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div>
            <label htmlFor="classVianna" className="block text-sm font-medium text-gray-700">
              1. Perfil do Aluno
            </label>
            <select 
              id="classVianna" 
              value={classificacao} 
              onChange={(e) => setClassificacao(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.values(classificacaoInfo).map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="horasAlvo" className="block text-sm font-medium text-gray-700">
              2. Horas/Semestre (Alvo)
            </label>
            <input 
              type="number" 
              id="horasAlvo" 
              value={horasAlvo} 
              onChange={(e) => setHorasAlvo(Number(e.target.value))} 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
            />
            <p className="text-xs text-gray-600 mt-1">
              (Recomendado: {recomendacaoAtual.horas} horas)
            </p>
          </div>
          
          <div>
            <label htmlFor="duracaoMacro" className="block text-sm font-medium text-gray-700">
              3. Duração do Macro (Meses)
            </label>
            <select 
              id="duracaoMacro" 
              value={duracaoMacro} 
              onChange={(e) => setDuracaoMacro(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={modeloMacro !== macroModelos.custom.nome}
            >
              <option value={3}>3 Meses</option>
              <option value={4}>4 Meses</option>
              <option value={5}>5 Meses</option>
              <option value={6}>6 Meses</option>
              <option value={12}>12 Meses</option>
            </select>
          </div>

          <div>
            <label htmlFor="modeloMacro" className="block text-sm font-medium text-gray-700">
              4. Modelo de Volume do Macro
            </label>
            <select 
              id="modeloMacro" 
              value={modeloMacro} 
              onChange={(e) => setModeloMacro(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {Object.values(macroModelos).map(m => (
                <option key={m.nome} value={m.nome}>{m.nome}</option>
              ))}
            </select>
          </div>
          
        </div>
      </div>
      
      {/* --- Seção 2: Configuração dos Mesociclos (Inputs) --- */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-6 border-b pb-3 text-indigo-700">
          Seção 2: Configuração dos Mesociclos
        </h3>
        
        <div className="grid grid-cols-3 gap-4 px-4 mb-2">
          <span className="text-sm font-medium text-gray-500">Mês</span>
          <span className="text-sm font-medium text-gray-500">Tipo de Mesociclo</span>
          <span className="text-sm font-medium text-gray-500">Sessões/Semana</span>
        </div>
        
        <div className="space-y-4">
          {mesociclos.map((meso, index) => (
            <div key={meso.mes} className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 border">
              
              <div className="flex items-center">
                <span className="text-lg font-semibold text-gray-800">Mês {meso.mes}</span>
              </div>
              
              <div>
                <select 
                  value={meso.tipoMesoId}
                  onChange={(e) => handleMesoChange(index, 'tipoMesoId', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {mesoTipos.map(tipo => (
                    <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
                  ))}
                </select>
              </div>
              
              <div>
                 <input 
                  type="number" 
                  value={meso.sessoesPorSemana}
                  onChange={(e) => handleMesoChange(index, 'sessoesPorSemana', Number(e.target.value))}
                  className="block w-full rounded-md border-gray-300 shadow-sm" 
                  min="1"
                  max="10"
                />
              </div>

            </div>
          ))}
        </div>
      </div>
      
      {/* --- (MODIFICADO) Seção 3: Plano Mestre (Botão e Tabela) --- */}
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-6 border-b pb-3 text-indigo-700">
          Seção 3: Plano Mestre (Resultado)
        </h3>
        
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <button 
            type="button" 
            onClick={handleCalcularPlano}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Calcular / Recalcular Plano
          </button>
          
          {/* (NOVO) Botão de Salvar */}
          <button 
            type="button" 
            onClick={handleSalvarPlano}
            disabled={planoMestre.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Salvar Plano
          </button>
          
          {/* (NOVO) Feedback de Status */}
          {saveStatus && (
            <span className={`text-sm font-medium ${saveStatus.includes('Erro') ? 'text-red-600' : 'text-green-600'}`}>
              {saveStatus}
            </span>
          )}
        </div>
        
        {planoMestre.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sem. (Global)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Micro (% / Tipo)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume (Semana)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessões</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-bold">Volume / Sessão</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {planoMestre.map(semana => (
                  <tr key={semana.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{semana.mes}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{semana.semanaGlobal}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{semana.tipoMeso}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{semana.microciclo}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{semana.volumeSemana_min} min</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{semana.sessoes}x</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{semana.volumeSessao_min} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};

// --- (ATUALIZADO) Visão de Prescrição do Professor ---
// Agora inclui o PAINEL DE AUDITORIA
const PrescricaoView = ({ student, onTestSaved }) => {
  const [activeTab, setActiveTab] = useState('testes');
  const [progressionData, setProgressionData] = useState([]);
  const [plannedSessions, setPlannedSessions] = useState({});
  const [initialPlanning, setInitialPlanning] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Novos estados para a Auditoria
  const [auditWeek, setAuditWeek] = useState(1);
  const [auditSession, setAuditSession] = useState(1);
  const [auditResult, setAuditResult] = useState(null);

  useEffect(() => {
    const carregarDadosPeriodizacao = async () => {
      if (!student || !student.id) return;
      setIsLoading(true);
      setError('');
      setProgressionData([]);
      setPlannedSessions({});
      setInitialPlanning(null);
      try {
        const periodizacaoResponse = await fetch(`${API_URL}/api/periodizacao/${student.id}`);
        if (periodizacaoResponse.ok) {
          const data = await periodizacaoResponse.json();
          setInitialPlanning(data);
          if (data && data.progression_data_json) {
            setProgressionData(JSON.parse(data.progression_data_json));
          }
        } else if (periodizacaoResponse.status !== 404) {
          throw new Error('Falha ao buscar periodização');
        }
        const sessoesResponse = await fetch(`${API_URL}/api/sessoes/${student.id}`);
        if (sessoesResponse.ok) {
          const sessoes = await sessoesResponse.json();
          const sessoesObjeto = sessoes.reduce((acc, sessao) => {
            const key = `${sessao.semana}-${sessao.sessao}`;
            try { acc[key] = JSON.parse(sessao.blocos_json); } 
            catch (e) { acc[key] = []; }
            return acc;
          }, {});
          setPlannedSessions(sessoesObjeto);
        } else {
           throw new Error('Falha ao buscar sessões');
        }
      } catch (error) {
        console.error("Erro ao carregar dados do aluno:", error);
        let errorMsg = `Erro ao carregar dados: ${error.message}`;
        setError(errorMsg);
      }
      setIsLoading(false);
    };
    carregarDadosPeriodizacao();
    setActiveTab('testes');
  }, [student]); 

  // --- FUNÇÃO DE AUDITORIA (Agora no Professor) ---
  const handleAuditar = async () => {
    setAuditResult(null); // Limpa resultado anterior
    try {
      // 1. Busca o planejamento selecionado nos dropdowns
      const sessionKey = `${auditWeek}-${auditSession}`;
      const sessionBlocks = plannedSessions[sessionKey];

      if (!sessionBlocks || sessionBlocks.length === 0) {
        alert(`Não existe treino planejado para Semana ${auditWeek}, Sessão ${auditSession}.`);
        return;
      }

      // 2. Procura o bloco PRINCIPAL
      const mainBlock = sessionBlocks.find(b => b.type === 'principal');

      if (!mainBlock) {
        alert("Este treino existe, mas não tem um bloco 'Principal' com metas definidas.");
        return;
      }

      // 3. Cria a meta para o robô
      // Função auxiliar para ajustar pace (ex: +/- 15s)
      const adjustPace = (p, seconds) => {
        const [m, s] = p.split(':').map(Number);
        const total = m * 60 + s + seconds;
        const min = Math.floor(total / 60);
        const sec = total % 60;
        return `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
      };

      const metaReal = {
        distancia_km: mainBlock.distance / 1000, 
        pace_min: adjustPace(mainBlock.pace, -20), // Tolerância 20s mais rápido
        pace_max: adjustPace(mainBlock.pace, 20),  // Tolerância 20s mais lento
        tipo_treino: "CONTINUO"
      };

      console.log("Enviando meta para auditoria:", metaReal); // DEBUG

      // 4. Chama o Robô
      const response = await fetch(`${API_URL}/api/auditoria/checar-hoje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          aluno_id: student.id, 
          prescricao: metaReal 
        })
      });

      const data = await response.json();
      console.log("Resposta do Robô:", data); // DEBUG
      
      if (data.erro) {
         alert("Erro do Robô: " + data.erro);
      } else {
         setAuditResult(data);
      }

    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o auditor: " + error.message);
    }
  };

  if (isLoading) return (<div className="p-8 text-center text-gray-500">Carregando...</div>);
  if (error) return (<div className="p-8 text-center text-red-600">{error}</div>);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <StudentHeader student={student} />
      
      {/* --- NOVO: PAINEL DE AUDITORIA DO PROFESSOR --- */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg shadow-sm mb-6 no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
               🤖 Auditoria de Carga (RealLoad)
            </h3>
            <p className="text-sm text-indigo-700">
              Selecione um treino planejado e compare com o Strava do aluno.
            </p>
          </div>
          
          <div className="flex gap-2 items-center bg-white p-2 rounded shadow-sm">
             <label className="text-xs font-bold text-gray-500">PLANEJADO:</label>
             <select 
               value={auditWeek} onChange={(e) => setAuditWeek(Number(e.target.value))}
               className="text-sm border-gray-300 rounded-md py-1"
             >
               {progressionData.length > 0 ? (
                 progressionData.map(p => <option key={p.week} value={p.week}>Semana {p.week}</option>)
               ) : <option value={1}>Semana 1</option>}
             </select>
             
             <select 
               value={auditSession} onChange={(e) => setAuditSession(Number(e.target.value))}
               className="text-sm border-gray-300 rounded-md py-1"
             >
               {[1,2,3,4,5,6,7].map(n => <option key={n} value={n}>Sessão {n}</option>)}
             </select>

             <button 
               onClick={handleAuditar}
               className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-1 px-4 rounded transition-colors"
             >
               Verificar
             </button>
          </div>
        </div>

        {/* Resultado da Auditoria */}
        {auditResult && (
          <div className="mt-4 bg-white p-4 rounded border border-indigo-100 animate-pulse-once">
            {auditResult.status === 'SUCESSO' ? (
              <div className="whitespace-pre-line text-gray-800">
                 {auditResult.relatorio_texto}
              </div>
            ) : (
              <p className="text-red-600 font-medium">⚠️ {auditResult.mensagem || auditResult.erro}</p>
            )}
          </div>
        )}
      </div>
      {/* --- FIM DO PAINEL DE AUDITORIA --- */}


      <div className="mb-4 border-b border-gray-200 no-print">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('testes')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'testes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Testes Aeróbios
          </button>
          <button onClick={() => setActiveTab('prescricao')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'prescricao' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} disabled={student.tests.length === 0}>
            Prescrição (Montagem)
          </button>
          <button onClick={() => setActiveTab('resumo')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'resumo' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`} disabled={progressionData.length === 0}>
            Resumo da Periodização
          </button>
        </nav>
      </div>
      <div>
        {activeTab === 'testes' && (
          <TestesAerobios student={student} onTestSaved={onTestSaved} />
        )}
        {activeTab === 'prescricao' && student.tests.length > 0 && (
          <PrescricaoAerobia 
            student={student} progressionData={progressionData} setProgressionData={setProgressionData}
            plannedSessions={plannedSessions} setPlannedSessions={setPlannedSessions}
            initialPlanning={initialPlanning}
          />
        )}
        {activeTab === 'prescricao' && student.tests.length === 0 && (
            <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg text-center">
                Por favor, registre pelo menos um teste aeróbio para habilitar a prescrição.
            </div>
        )}
        {activeTab === 'resumo' && (
          <ResumoPeriodizacao 
              student={student} progressionData={progressionData} plannedSessions={plannedSessions} 
          />
        )}
      </div>
    </div>
  );
};

// --- (ATUALIZADO) Componente da Visão de Gerência ---
// Inclui o PAINEL DO PREGUIÇOSO e botões de Editar/Excluir
const GerenciaView = ({ professor }) => {
  const [mainTab, setMainTab] = useState('usuarios'); 
  const [professores, setProfessores] = useState([]);
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  
  // Novos estados para controlar Adição vs Edição
  const [modo, setModo] = useState('adicionar');
  const [usuarioAtual, setUsuarioAtual] = useState(null);

  // Estados do formulário de usuários
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cref, setCref] = useState('');
  const [formacao, setFormacao] = useState('Graduado');
  const [role, setRole] = useState('PROFESSOR');
  const [password, setPassword] = useState('');
  
  // --- Estados do Painel de Alunos ---
  const [todosAlunos, setTodosAlunos] = useState([]);
  const [isLoadingAlunos, setIsLoadingAlunos] = useState(true);
  const [errorAlunos, setErrorAlunos] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);

  // Função para carregar dados
  const carregarDados = async () => {
      if (mainTab === 'usuarios') {
        setIsLoadingUsuarios(true);
        try {
          const response = await fetch(`${API_URL}/api/professores`);
          if (!response.ok) throw new Error('Falha ao buscar professores');
          setProfessores(await response.json());
        } catch (err) { setErrorUsuarios(err.message); }
        setIsLoadingUsuarios(false);
      } 
      
      if (mainTab === 'alunos') {
        setIsLoadingAlunos(true);
        try {
          const response = await fetch(`${API_URL}/api/gerencia/todos-alunos`);
          if (!response.ok) throw new Error('Falha ao buscar alunos');
          setTodosAlunos(await response.json());
        } catch (err) { setErrorAlunos(err.message); }
        setIsLoadingAlunos(false);
      }
  };

  useEffect(() => { carregarDados(); }, [mainTab]);

  const handleSincronizarTudo = async () => {
    setSyncLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/gerencia/sincronizar-tudo`, { method: 'POST' });
      if (!response.ok) throw new Error("Erro ao sincronizar.");
      const data = await response.json();
      alert(`✅ Sincronização completa! ${data.total} alunos atualizados.`);
      carregarDados();
    } catch (error) {
      alert("Erro: " + error.message);
    }
    setSyncLoading(false);
  };
  
  // --- FUNÇÕES DE LIMPAR, EDITAR E DELETAR ---
  const limparFormulario = () => {
    setNome(''); setEmail(''); setCref(''); setFormacao('Graduado'); setRole('PROFESSOR'); setPassword('');
    setModo('adicionar'); setUsuarioAtual(null); setErrorUsuarios('');
  };

  const handleEditarClick = (prof) => {
    setModo('editar');
    setUsuarioAtual(prof);
    setNome(prof.nome_completo);
    setEmail(prof.email);
    setCref(prof.cref || '');
    setFormacao(prof.formacao || 'Graduado');
    setRole(prof.role || 'PROFESSOR');
    setPassword(''); // Deixa em branco para não alterar se não quiser
    window.scrollTo(0, 0); // Sobe a tela para o formulário
  };

  const handleDeletarClick = async (profId) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      const response = await fetch(`${API_URL}/api/professores/${profId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Falha ao deletar usuário. Ele pode ter alunos vinculados.');
      setProfessores(prev => prev.filter(p => p.id !== profId));
    } catch (err) {
      setErrorUsuarios(err.message);
    }
  };

  const handleSubmitUsuario = async (e) => {
    e.preventDefault();
    setErrorUsuarios('');
    const dadosUsuario = { nome_completo: nome, email, cref, formacao, role, password: password || null };
    
    try {
      let url = `${API_URL}/api/professores`;
      let method = 'POST';
      
      if (modo === 'editar') {
        url = `${API_URL}/api/professores/${usuarioAtual.id}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosUsuario),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha ao salvar');
      
      if (modo === 'adicionar') {
        setProfessores(prev => [...prev, data]);
      } else {
        setProfessores(prev => prev.map(p => p.id === usuarioAtual.id ? { ...p, ...data } : p));
      }
      limparFormulario();
    } catch (err) { setErrorUsuarios(err.message); }
  };
  
  const getFarolColor = (status) => {
    switch(status) {
      case 'VERDE': return 'bg-green-500';
      case 'VERMELHO': return 'bg-red-500';
      case 'AMARELO': return 'bg-yellow-400';
      default: return 'bg-gray-300';
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 border-b border-gray-300">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          <button onClick={() => setMainTab('usuarios')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${mainTab === 'usuarios' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Gerenciar Usuários
          </button>
          <button onClick={() => setMainTab('alunos')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${mainTab === 'alunos' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Visão Geral de Alunos
          </button>
        </nav>
      </div>

      {mainTab === 'usuarios' && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-indigo-700 mb-4">
              {modo === 'adicionar' ? 'Cadastrar Novo Usuário' : `Editando: ${usuarioAtual.nome_completo}`}
            </h2>
            <form onSubmit={handleSubmitUsuario} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Nome</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Senha</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={modo === 'adicionar'} placeholder={modo === 'editar' ? 'Deixe em branco para manter a atual' : ''} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>
                <div><label className="block text-sm font-medium text-gray-700">CREF</label><input type="text" value={cref} onChange={(e) => setCref(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Formação</label><select value={formacao} onChange={(e) => setFormacao(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option>Graduado</option><option>Especialização</option><option>Mestrado</option><option>Doutorado</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700">Função</label><select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"><option value="PROFESSOR">Professor</option><option value="GERENCIA">Gerência</option></select></div>
              </div>
              {errorUsuarios && <p className="text-sm text-red-600">{errorUsuarios}</p>}
              <div className="flex space-x-4">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  {modo === 'adicionar' ? 'Cadastrar' : 'Salvar Alterações'}
                </button>
                {modo === 'editar' && (
                  <button type="button" onClick={limparFormulario} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                    Cancelar Edição
                  </button>
                )}
              </div>
            </form>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Usuários ({professores.length})</h2>
            {isLoadingUsuarios ? <p>Carregando...</p> : (
              <div className="space-y-4">{professores.map(prof => (
                  <div key={prof.id} className="p-4 border rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{prof.nome_completo} <span className="text-xs bg-gray-200 px-2 rounded">{prof.role}</span></p>
                      <p className="text-sm text-gray-600">{prof.email}</p>
                    </div>
                    {/* Botoes de Ação */}
                    <div className="space-x-2">
                      <button onClick={() => handleEditarClick(prof)} className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-md shadow-sm hover:bg-yellow-600">Editar</button>
                      <button onClick={() => handleDeletarClick(prof.id)} className="px-3 py-1 text-sm bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700">Excluir</button>
                    </div>
                  </div>
              ))}</div>
            )}
          </div>
        </>
      )}
      
      {mainTab === 'alunos' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Visão Geral de Alunos</h2>
            <button onClick={handleSincronizarTudo} disabled={syncLoading} className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow hover:bg-purple-700 disabled:bg-gray-400">
              {syncLoading ? 'Sincronizando...' : '🔄 Sincronizar Geral (Strava)'}
            </button>
          </div>
          {isLoadingAlunos ? <p>Carregando...</p> : errorAlunos ? <p className="text-red-600">{errorAlunos}</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback do Robô</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todosAlunos.map(aluno => (
                    <tr key={aluno.id}>
                      <td className="px-6 py-4 whitespace-nowrap"><div className={`w-6 h-6 rounded-full border border-gray-200 shadow-sm ${getFarolColor(aluno.status_farol)}`} title={aluno.status_farol || 'Sem dados'}/></td>
                      <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{aluno.nome_completo}</div><div className="text-sm text-gray-500">{aluno.email}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{aluno.professor_nome || '---'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{aluno.ultimo_feedback || <span className="italic text-gray-400">Aguardando sincronização...</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {todosAlunos.length === 0 && <p className="text-center py-4 text-gray-500">Nenhum aluno encontrado.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// --- (NOVO) Componente da Aba "Meu Perfil" (para Professor) ---
const MeuPerfilTab = ({ professor }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.');
      return;
    }
    if (newPassword.length < 4) {
      setError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/mudar-senha/${professor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Falha ao alterar a senha');
      }
      
      setSuccess('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setIsLoading(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          Meu Perfil
        </h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{professor.nome_completo}</h3>
          <p className="text-gray-600">{professor.email}</p>
          <span className="mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            {professor.role}
          </span>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-4 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800">Alterar Senha</h3>
          <div>
            <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">Senha Antiga</label>
            <input type="password" id="old_password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required 
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">Nova Senha</label>
            <input type="password" id="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required 
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
            <input type="password" id="confirm_password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={isLoading}
          >
            {isLoading ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </form>
      </div>
    </div>
  );
};


// --- (MODIFICADO) Componente da Visão de Professor ---
// Adicionada a aba "Periodização (Vianna)"
const ProfessorView = ({ professor }) => {
  // (MODIFICADO) Adiciona a aba 'vianna'
  const [mainTab, setMainTab] = useState('prescricao'); // 'prescricao', 'gerenciar', 'perfil', 'vianna'
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Começa true
  const [error, setError] = useState(null);

  // Efeito para carregar alunos do professor
  useEffect(() => {
    const carregarAlunos = async () => {
      if (!professor || !professor.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_URL}/api/meus-alunos/${professor.id}`);
        if (!response.ok) throw new Error('Falha ao buscar dados dos alunos.');
        const alunos = await response.json();
        
        const alunosComTestes = await Promise.all(
          alunos.map(async (aluno) => {
            const testesResponse = await fetch(`${API_URL}/api/testes/${aluno.id}`);
            if (!testesResponse.ok) {
              console.warn(`Falha ao buscar testes para o aluno ${aluno.id}`);
              return { ...aluno, tests: [] };
            }
            const testes = await testesResponse.json();
            return { ...aluno, tests: testes };
          })
        );
        setStudents(alunosComTestes);
        if (alunosComTestes.length > 0) {
          const alunoAindaExiste = alunosComTestes.some(a => a.id === selectedStudentId);
          if (!selectedStudentId || !alunoAindaExiste) {
             setSelectedStudentId(alunosComTestes[0].id);
          }
        } else {
          setSelectedStudentId(null);
        }
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        setError(error.message);
      }
      setIsLoading(false);
    };
    
    // (MODIFICADO) Só carrega alunos se a aba não for 'perfil'
    if (mainTab !== 'perfil') {
      carregarAlunos();
    } else {
      setIsLoading(false);
    }
  // (MODIFICADO) Roda quando o 'professor' ou a 'mainTab' muda
  }, [professor, mainTab, selectedStudentId]); // Dependências corrigidas

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId || students.length === 0) return null;
    return students.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, students]);

  const handleTestSaved = async (newTest) => {
    const response = await fetch(`${API_URL}/api/testes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTest),
    });
    if (!response.ok) throw new Error('Falha ao salvar o teste no backend');
    const savedTest = await response.json();
    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === savedTest.aluno_id) {
          const updatedTests = [savedTest, ...student.tests];
          return { ...student, tests: updatedTests };
        }
        return student;
      })
    );
  };

  return (
    <>
      {/* (MODIFICADO) Navegação com a aba "Periodização (Vianna)" */}
      <div className="max-w-7xl mx-auto mb-6 border-b border-gray-300 no-print">
        <nav className="flex -mb-px space-x-8" aria-label="Tabs">
          <button
            onClick={() => setMainTab('prescricao')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${
              mainTab === 'prescricao' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            Prescrição (Simples)
          </button>
          
          {/* --- (NOVA ABA) --- */}
          <button
            onClick={() => setMainTab('vianna')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${
              mainTab === 'vianna' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            Periodização (Vianna)
          </button>
          {/* --- FIM DA NOVA ABA --- */}
          
          <button
            onClick={() => setMainTab('gerenciar')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${
              mainTab === 'gerenciar' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            Gerenciar Alunos
          </button>
          <button
            onClick={() => setMainTab('perfil')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-lg ${
              mainTab === 'perfil' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            Meu Perfil
          </button>
        </nav>
      </div>

      <main>
        {error && (
          <div className="max-w-7xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <h3 className="font-bold">Erro</h3>
            <p>{error}</p>
          </div>
        )}
        
        {mainTab === 'prescricao' && (
          <>
            {isLoading && (<div className="text-center text-gray-600">Carregando alunos...</div>)}
            {students.length === 0 && !isLoading && (
              <div className="max-w-3xl mx-auto bg-yellow-100 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-yellow-800">Nenhum aluno encontrado</h3>
                <p className="text-yellow-700 mt-2">
                  Vá para a aba "Gerenciar Alunos" para adicionar seu primeiro aluno.
                </p>
              </div>
            )}
            {students.length > 0 && (
              <>
                <div className="max-w-7xl mx-auto mb-6 no-print">
                  <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione um Aluno:
                  </label>
                  <select
                    id="student-select"
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedStudent ? (
                  <PrescricaoView 
                    student={selectedStudent} 
                    onTestSaved={handleTestSaved} 
                  />
                ) : (
                  <p className="text-center text-gray-500">Por favor, selecione um aluno.</p>
                )}
              </>
            )}
          </>
        )}
        
        {/* --- (NOVA LÓGICA DE RENDERIZAÇÃO) --- */}
        {mainTab === 'vianna' && (
          <>
            {isLoading && (<div className="text-center text-gray-600">Carregando alunos...</div>)}
            
            {students.length > 0 && (
              <>
                <div className="max-w-7xl mx-auto mb-6 no-print">
                  <label htmlFor="student-select-vianna" className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione um Aluno:
                  </label>
                  <select
                    id="student-select-vianna"
                    value={selectedStudentId || ''}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    {students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.nome_completo}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedStudent ? (
                  <ViannaPeriodizacaoTab student={selectedStudent} />
                ) : (
                   <p className="text-center text-gray-500">Por favor, selecione um aluno.</p>
                )}
              </>
            )}
            
            {students.length === 0 && !isLoading && (
              <div className="max-w-3xl mx-auto bg-yellow-100 p-6 rounded-lg text-center">
                <h3 className="font-semibold text-yellow-800">Nenhum aluno encontrado</h3>
                <p className="text-yellow-700 mt-2">
                  Vá para a aba "Gerenciar Alunos" para adicionar seu primeiro aluno.
                </p>
              </div>
            )}
          </>
        )}
        {/* --- FIM DA NOVA LÓGICA --- */}

        
        {mainTab === 'gerenciar' && (
          <GerenciarAlunosTab 
            students={students}
            setStudents={setStudents}
            professorId={professor.id}
          />
        )}
        
        {mainTab === 'perfil' && (
          <MeuPerfilTab professor={professor} />
        )}
      </main>
    </>
  );
};



// --- (MODIFICADO) Componente da Visão do Aluno ---
// Apenas conecta o Strava e vê o treino. Sem auditoria.
const AlunoView = ({ aluno }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressionData, setProgressionData] = useState([]);
  const [plannedSessions, setPlannedSessions] = useState({});
  
  // Função de Conectar Strava (Mantemos aqui, pois a senha é do aluno)
  const handleConnectStrava = () => {
    const clientId = "183830"; 
    const redirectUri = "http://localhost:3000"; 
    const scope = "activity:read_all"; 
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
  };

  // Objeto simples para o resumo
  const studentObject = { ...aluno, tests: [] };

  useEffect(() => {
    const carregarDadosDoAluno = async () => {
      if (!aluno || !aluno.id) return;
      setIsLoading(true);
      setError('');
      try {
        // 1. Carregar Periodização
        const periodizacaoResponse = await fetch(`${API_URL}/api/periodizacao/${aluno.id}`);
        if (periodizacaoResponse.ok) {
          const data = await periodizacaoResponse.json();
          if (data && data.progression_data_json) {
            setProgressionData(JSON.parse(data.progression_data_json));
          }
        }
        // 2. Carregar Sessões
        const sessoesResponse = await fetch(`${API_URL}/api/sessoes/${aluno.id}`);
        if (sessoesResponse.ok) {
          const sessoes = await sessoesResponse.json();
          const sessoesObjeto = sessoes.reduce((acc, sessao) => {
            const key = `${sessao.semana}-${sessao.sessao}`;
            try { acc[key] = JSON.parse(sessao.blocos_json); } 
            catch (e) { acc[key] = []; }
            return acc;
          }, {});
          setPlannedSessions(sessoesObjeto);
        }
      } catch (error) {
        console.error("Erro:", error);
        setError(error.message);
      }
      setIsLoading(false);
    };
    carregarDadosDoAluno();
  }, [aluno]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6 no-print flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">Meu Treino</h2>
          <p className="text-lg text-gray-600">Bem-vindo, {aluno.nome_completo}!</p>
        </div>
        {/* Botão Conectar Strava */}
        <button
            onClick={handleConnectStrava}
            className="bg-[#FC4C02] hover:bg-[#E34402] text-white font-bold py-2 px-4 rounded inline-flex items-center transition-colors"
          >
            <svg role="img" viewBox="0 0 24 24" className="w-5 h-5 mr-2 fill-current" xmlns="http://www.w3.org/2000/svg">
              <title>Strava</title>
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
            Conectar Strava
        </button>
      </div>

      {isLoading && <p className="text-center text-gray-500">Carregando...</p>}
      {error && <p className="text-center text-red-600">Erro: {error}</p>}

      {!isLoading && !error && (
        <ResumoPeriodizacao 
          student={studentObject} 
          progressionData={progressionData} 
          plannedSessions={plannedSessions} 
        />
      )}
    </div>
  );
};

/**
 * (MODIFICADO)
 * Componente Raiz da Aplicação
 * Agora controla o Login e as Abas Principais
 */
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null); // { id, nome_completo, role }
  const [loginError, setLoginError] = useState('');
  
  // 1. EFEITO DE INICIALIZAÇÃO (Recupera o Login)
  useEffect(() => {
    const userSalvo = localStorage.getItem('user');
    if (userSalvo) {
      setUser(JSON.parse(userSalvo));
      setIsLoggedIn(true);
    }
  }, []);

  // 2. EFEITO DO STRAVA (Captura o código da URL)
  useEffect(() => {
    // Só roda se tiver um usuário logado (recuperado do storage)
    if (!user) return;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Limpa a URL para não ficar feia (remove o ?code=...)
      window.history.replaceState({}, document.title, "/");

      // Manda para o Backend
      fetch(`${API_URL}/api/strava/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, aluno_id: user.id })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert("✅ Strava conectado com sucesso!");
        } else {
          alert("❌ Erro ao conectar Strava: " + data.error);
        }
      })
      .catch(err => console.error("Erro Strava:", err));
    }
  }, [user]); // Roda sempre que o 'user' carregar

  const handleLogin = async (email, password) => {
  setLoginError('');
  try {
    // --- (MODIFICADO) TENTATIVA 1: Logar como Professor ---
    const responseProf = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (responseProf.ok) {
      const data = await responseProf.json();
      setUser(data); // Salva { id, nome_completo, role: "PROFESSOR" ou "GERENCIA" }
      setIsLoggedIn(true);
      return; // Sucesso, sai da função
    }

    // Se não for OK (ex: 401 Senha Inválida), joga o erro
    if (responseProf.status === 401) {
       const data = await responseProf.json();
       throw new Error(data.error || 'Senha inválida');
    }

    // --- (NOVO) TENTATIVA 2: Logar como Aluno ---
    // Se chegou aqui, é porque deu 404 (Usuário não encontrado) como Professor
    if (responseProf.status === 404) {
      const responseAluno = await fetch(`${API_URL}/api/aluno/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (responseAluno.ok) {
        const data = await responseAluno.json();
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data); // Salva { id, nome_completo, role: "ALUNO" }
        setIsLoggedIn(true);
        return; // Sucesso, sai da função
      }

      // Se não for OK, joga o erro do aluno
      const data = await responseAluno.json();
      throw new Error(data.error || 'Falha no login');
    }

    // Se não foi 200, 401 ou 404, foi outro erro
    const data = await responseProf.json();
    throw new Error(data.error || 'Falha no login');

  } catch (err) {
    console.error(err);
    setLoginError(err.message);
  }
};
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setLoginError('');
  };

  // --- Renderização Principal ---

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} error={loginError} />;
  }
  
  // (MODIFICADO) Roteamento com Navbar centralizada e Footer
  return (
    // (MODIFICADO) Agora é flex-col para ter o footer
    <div className="min-h-screen bg-gray-100 flex flex-col">
      
      {/* (MODIFICADO) Conteúdo principal que "cresce" */}
      <div className="flex-grow">
        {/* 1. Navbar no topo, sempre presente */}
        <Navbar user={user} onLogout={handleLogout} />
        
        {/* 2. Conteúdo da página com padding */}
        <main className="p-4 md:p-8">
          {user.role === 'GERENCIA' && (
            <GerenciaView professor={user} />
          )}
          {user.role === 'PROFESSOR' && (
            <ProfessorView professor={user} />
          )}
          {user.role === 'ALUNO' && (
            <AlunoView aluno={user} />
          )}
        </main>
      </div>
      
      
      {/* --- (NOVO) Footer --- */}
      <footer className="text-center p-4 text-gray-500 text-sm no-print">
        Sistema Desenvolvido por VD System - Copyright @ 2026.
      </footer>
      {/* --- Fim do Footer --- */}
      
    </div>
  );
}