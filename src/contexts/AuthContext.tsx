'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContextType, AuthResponse, EmptyResponse, User } from '@common/data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verifica token no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        const isValid = await validateToken(parsedUser.token); // <== aqui

        if (isValid) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Função para fazer login
  const login = async (login: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch('https://multisorteios.dev/msrifaadmin/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ login, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const authResponse: AuthResponse = await response.json();

      if (!authResponse.success) {
        //throw new Error(authResponse.errorMessage ?? 'Erro desconhecido');
        return false;
      }

      const data = authResponse.data;
      const userData = {
        login: data!.login,
        name: data!.name,
        token: data!.token,
        profile: data!.profile,
        userId: data!.userId,
        senhaAlterada: data!.senhaAlterada,
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Função para validar token
  const validateToken = async (tokenToValidate?: string): Promise<boolean> => {
    const token = tokenToValidate || user?.token;

    if (!token) return false;

    try {
      const response = await fetch(
        `https://multisorteios.dev/msrifaadmin/api/validatetoken?token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        //throw new Error('Token inválido');
        return false;
      }

      const authResponse: EmptyResponse = await response.json();

      if (!authResponse.success) {
        //throw new Error(authResponse.errorMessage ?? 'Erro desconhecido');

        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };


  // Função para logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        profile: user?.profile,
        login,
        logout,
        validateToken,
        isLoading,
        senhaAlterada: user?.senhaAlterada ?? false
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
