'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/contexts/AuthContext';
import { useAppContext } from 'src/contexts/AppContext';
import { motion } from 'framer-motion';
import { sha256 } from 'js-sha256';

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login: authLogin, isAuthenticated } = useAuth();
  const router = useRouter();
  const { setSorteio } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const hashedPassword = sha256(password);
      const success = await authLogin(login, hashedPassword);
      if (success) {
        setSorteio(null);
        router.push('/');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Ocorreu um erro durante o login');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
        className="w-full max-w-md p-10 space-y-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold text-blue-700">Acesso Parceiro</h2>
          <p className="mt-2 text-sm text-gray-500">Entre com suas credenciais para continuar</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          >
            {error}
          </motion.div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                Login
              </label>
              <input
                id="login"
                name="login"
                type="number"
                maxLength={11}
                size={11}
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileTap={{ scale: 0.98 }}
              animate={isLoading ? { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1.2 } } : {}}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${isLoading ? 'opacity-80 cursor-not-allowed' : ''
                }`}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-t-2 border-white rounded-full animate-spin"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              ) : (
                'Entrar'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
