import { motion } from 'framer-motion';
import { FaLock, FaHome, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/router';

const AccessDenied = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800 flex flex-col items-center justify-center p-4 text-white">
      {/* Animação do ícone */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-white rounded-full blur-md opacity-30 animate-pulse"></div>
          <FaLock className="text-6xl md:text-8xl relative z-10" />
        </div>
      </motion.div>

      {/* Mensagem principal */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-5xl font-bold text-center mb-4"
      >
        Acesso Negado
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-center max-w-md mb-8"
      >
        Você não tem permissão para acessar esta página. Se isso for um erro, entre em contato com o administrador.
      </motion.p>

      {/* Botões de ação */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-2 bg-white text-purple-900 hover:bg-purple-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FaHome className="text-lg" />
          Página Inicial
        </button>
        {/**
        <button
          onClick={() => window.location.href = 'mailto:suporte@multisorteios.dev'}
          className="flex items-center justify-center gap-2 bg-transparent border-2 border-white hover:bg-white hover:bg-opacity-10 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <FaEnvelope className="text-lg" />
          Contatar Suporte
        </button>
         */}
      </motion.div>

      {/* Efeito de partículas decorativas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.3, 0],
              y: [0, -100],
              x: [0, Math.random() * 100 - 50]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: 'white',
              borderRadius: '50%'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AccessDenied;