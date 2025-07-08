export interface ApiResult {
    success: boolean;
    errorMessage?: string;
    data?: any;
}

export interface Sorteio {
    id: number;
    dataSorteio: string;
    situacaoId: number;
    situacao: string;
    valorBilhete: number;
    titulo: string;
    tipo: string;
    modalidade: string;
    horario: string;
    imageUrl: string;
}


export interface AppContextType {
    sorteio: Sorteio | null;
    setSorteio: (sorteio: Sorteio | null) => void;

    loading: boolean;
    showLoader: () => void;
    hideLoader: () => void;
}




export interface User {
    login: string;
    name: string;
    token: string;
    profile: string;
    userId: number;
    senhaAlterada: boolean;
}

export interface AuthResponse {
    data?: AuthData;
    success: boolean;
    errorMessage?: string;
}

export interface AuthData {
    login: string;
    name: string;
    token: string;
    profile: string;
    userId: number;
    senhaAlterada: boolean;
}

export interface EmptyResponse {
    success: boolean;
    errorMessage?: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    profile?: string;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    validateToken: () => Promise<boolean>;
    isLoading: boolean;
    senhaAlterada: boolean;
}

export interface Cambista {
    id: number;
    nome: string;
    ativo: boolean;
    comissao: number;
    email: string;
    whatsapp: string;
    rotaId: number;
}

export interface Rota {
    id: number;
    nome: string;
}