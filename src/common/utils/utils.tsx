import { CidadeIBGE, OptionType } from "@common/data";

export function formatPhoneNumber(phone: string) {
  if (!phone) return '';

  // Remove todos os caracteres não numéricos
  const cleaned = phone.toString().replace(/\D/g, '');

  // Verifica se o telefone tem 11 dígitos (formato comum no Brasil com DDD e nono dígito)
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2$3-$4');
  }

  // Caso tenha apenas 10 dígitos (sem o nono dígito)
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  // Retorna o número sem formatação se não tiver 10 ou 11 dígitos
  return phone;
}

export function currencyFormat(num: any) {
  const parsedNum = Number(num); // Garante que seja um número
  if (isNaN(parsedNum)) {
    return 'R$ 0,00'; // Valor padrão em caso de erro
  }
  return 'R$ ' + parsedNum.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}


export function removePhoneMask(telefone: string) {
  if (telefone == null) {
    return '';
  }
  return telefone
    .replace('(', '')
    .replace(')', '')
    .replace(' ', '')
    .replace('-', '');
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}


export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa em 0
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export const fetchCidades = async (inputValue: string): Promise<OptionType[]> => {
  if (inputValue.length < 3) return [];

  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/municipios`);
    const data: CidadeIBGE[] = await response.json();

    const inputLower = inputValue.toLowerCase();

    const cidadesFiltradas = data.map(cidade => ({
      nome: cidade.nome,
      uf: cidade.microrregiao?.mesorregiao?.UF.sigla ?? '',
    }));

    // Filtra e ordena de acordo com a prioridade:
    const comecaCom = cidadesFiltradas.filter(c =>
      c.nome.toLowerCase().startsWith(inputLower)
    );
    const contem = cidadesFiltradas.filter(c =>
      !c.nome.toLowerCase().startsWith(inputLower) &&
      c.nome.toLowerCase().includes(inputLower)
    );

    const ordenadas = [...comecaCom, ...contem];

    // Prioriza cidades da Bahia (UF === "BA")
    const daBahia = ordenadas.filter(c => c.uf === "BA");
    const outras = ordenadas.filter(c => c.uf !== "BA");

    const final = [...daBahia, ...outras].slice(0, 20);

    return final.map(c => ({
      value: c.nome,
      label: `${c.nome} - ${c.uf}`,
    }));
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

