import { Sorteio } from "@common/data";

type SorteioCardProps = {
  sorteio: Sorteio;
};

const situacao = [

  { label: 'Em Andamento', value: 'CRIADO' },
  { label: 'Vendas Abertas', value: 'AND' },
  { label: 'Vendas Encerradas', value: 'VEN' },
  { label: 'Finalizado', value: 'FIN' },
];

export function SorteioCard({ sorteio }: SorteioCardProps) {
  return (
    <div className="w-full rounded-xl bg-gray-900 border border-gray-700 hover:border-blue-500 shadow-md p-4 transition-all duration-200 hover:shadow-lg">
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-bold text-gray-400">Data: {sorteio.dataSorteio}</p>
        <p className="text-lg font-semibold text-white truncate">Tipo: {sorteio.tipo}</p>
        <p className="text-sm text-gray-300">Modalidade de Venda: {sorteio.modalidade}</p>
        <p className={`text-xl font-bold mt-1 ${sorteio.situacao === 'AND' ? 'text-green-400' : 'text-yellow-400'
          }`}>
          {situacao.find(h => h.value === sorteio.situacao)?.label}
        </p>
      </div>
    </div>
  );
}
