// types/Cobrador.ts
export interface Cobrador {
    id: number;
    nome: string;
    ativo: boolean;
    login: string;
    comissao: number | null;
    email: string | null;
    whatsapp: string | null;
}

export interface CobradorApiResponse {
    success: boolean;
    errorMessage?: string;
    // Remova 'data: Cobrador[];' daqui se a nova API sempre retornar um objeto com paginação
    // Adicione a nova estrutura para paginação
    data?: {
        content: Cobrador[]; // A lista de cobradores para a página atual
        totalElements: number; // O número total de cobradores (todos os dados, não apenas na página)
        totalPages: number;    // O número total de páginas
        page: number;          // O número da página atual (0-indexed ou 1-indexed, conforme o backend)
        size: number;          // O número de itens por página
    };
}