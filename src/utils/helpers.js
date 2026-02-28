// src/utils/helpers.js

export const calculateAge = (dobString) => {
  if (!dobString) return null;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const calculateIMC = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  const imc = weight / (heightInMeters * heightInMeters);
  return parseFloat(imc.toFixed(2));
};

export const getIMCClassification = (imc) => {
  if (!imc) return "N/A";
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 24.9) return "Peso normal";
  if (imc < 29.9) return "Sobrepeso";
  if (imc < 34.9) return "Obesidade Grau I";
  if (imc < 39.9) return "Obesidade Grau II";
  return "Obesidade Grau III";
};

export const formatDecimalMinutes = (decimalMinutes) => {
  if (isNaN(decimalMinutes) || decimalMinutes === Infinity || decimalMinutes < 0) {
    return '---';
  }
  const totalSeconds = Math.round(decimalMinutes * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};