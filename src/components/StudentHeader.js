import React, { useMemo } from 'react';


// Importamos as ferramentas que criamos antes
import { calculateAge, calculateIMC, getIMCClassification } from '../utils/helpers';

// --- Componentes da Visão de Prescrição (Sem Alterações) ---
const StudentHeader = ({ student }) => {
  const age = useMemo(() => calculateAge(student.data_nascimento), [student.data_nascimento]);
  const imc = useMemo(() => calculateIMC(student.peso_kg, student.altura_cm), [student.peso_kg, student.altura_cm]);
  const imcClass = useMemo(() => getIMCClassification(imc), [imc]);
  const lastTest = student.tests && student.tests.length > 0 ? student.tests[0] : null;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-indigo-700">{student.nome_completo}</h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-700">
        <span><strong>Idade:</strong> {age || 'N/A'} anos</span>
        <span><strong>IMC:</strong> {imc || 'N/A'} ({imcClass})</span>
        <span><strong>VO2 Max (Último):</strong> {lastTest ? `${parseFloat(lastTest.vo2max).toFixed(2)} (${lastTest.classificacao})` : 'Nenhum teste'}</span>
      </div>
    </div>
  );
};

export default StudentHeader;