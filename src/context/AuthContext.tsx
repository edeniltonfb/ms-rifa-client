// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

// 1. Tipos para o Contexto
interface UserData {
    userId: number;
    login: string;
    name: string;
    profile: string;
    token: string;
    // Outros campos do seu retorno da API podem ser adicionados aqui
}

interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    login: (credentials: { login: string; password: string }) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean; // Para gerenciar o estado de carregamento inicial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Provedor (AuthProvider)
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true para verificar token
    const router = useRouter();

    // Verifica o token no localStorage ao carregar a aplicação
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        if (storedToken && storedUser) {
            try {
                const parsedUser: UserData = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (e) {
                console.error("Failed to parse stored user data", e);
                logout(); // Limpa dados inválidos
            }
        }
        setIsLoading(false); // Finaliza o carregamento inicial
    }, []);

    const login = async (credentials: { login: string; password: string }): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await fetch('https://multisorteios.dev/msrifaadmin/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const result = await response.json();

            if (result.success && result.data) {
                const userData: UserData = {
                    userId: result.data.userId,
                    login: result.data.login,
                    name: result.data.name,
                    profile: result.data.profile,
                    token: result.data.token,
                };
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('authToken', userData.token); // Armazena o token
                localStorage.setItem('authUser', JSON.stringify(userData)); // Armazena dados do usuário
                setIsLoading(false);
                return true;
            } else {
                console.error('Login failed:', result.errorMessage || 'Unknown error');
                setIsLoading(false);
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error);
            setIsLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        router.push('/login'); // Redireciona para a página de login
    };

    // 3. Opcional: Efeito para redirecionar após logout ou se não autenticado em rotas protegidas
    useEffect(() => {
        if (!isLoading && !isAuthenticated && router.pathname !== '/login') {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);


    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Hook Customizado para Usar o Contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};