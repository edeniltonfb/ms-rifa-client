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

// NOVO: Interface para a estrutura 'pageable' dentro da resposta
export interface PageableInfo {
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

// NOVO: Interface para a estrutura 'sort' dentro da resposta
export interface SortInfo {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
}

// NOVO: Interface para a estrutura 'data' dentro da resposta principal
export interface PagedCobradorData {
    content: Cobrador[];
    pageable: PageableInfo;
    last: boolean;
    totalElements: number;
    totalPages: number;
    sort: SortInfo;
    first: boolean;
    number: number; // Este é o número da página atual (0-indexed)
    numberOfElements: number;
    size: number; // Este é o tamanho da página (rowsPerPage)
    empty: boolean;
}

// Interface principal da resposta da API
export interface CobradorApiResponse {
    success: boolean;
    errorMessage: string | null;
    data: PagedCobradorData | null; // Agora 'data' é do tipo PagedCobradorData
}

export interface CobradorLookup {
    id: number;
    label: string;
}