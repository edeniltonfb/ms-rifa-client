export enum TipoPremio {
  P10 = '10P',
  P06 = '06P',
  RAP = 'RAP',
  P09 = '09P',
  P08 = '08P',
  P05 = '05P',
}

export const tipoPremioDescricao: Record<TipoPremio, string> = {
  [TipoPremio.P10]: '10 Pontos',
  [TipoPremio.P06]: 'Sena no 1º Sorteio',
  [TipoPremio.RAP]: 'Rapidinha',
  [TipoPremio.P09]: '09 Pontos',
  [TipoPremio.P08]: '08 Pontos',
  [TipoPremio.P05]: 'Quina no 1º Sorteio',
};

export const tipoPremioCores: Record<TipoPremio, string> = {
  [TipoPremio.P10]: 'border-l-8 border-yellow-500',
  [TipoPremio.P06]: 'border-l-8 border-green-600',
  [TipoPremio.RAP]: 'border-l-8 border-purple-500',
  [TipoPremio.P09]: 'border-l-8 border-yellow-400',
  [TipoPremio.P08]: 'border-l-8 border-pink-400',
  [TipoPremio.P05]: 'border-l-8 border-blue-400',
};

export function getClasseCor(tipo: string): string {
  const key = tipo.toUpperCase() as TipoPremio;
  return tipoPremioCores[key] ?? 'border-l-8 border-gray-400';
}

export function getDescricaoTipo(tipo: string): string {
  const key = tipo.toUpperCase() as TipoPremio;
  return tipoPremioDescricao[key] ?? tipo;
}
