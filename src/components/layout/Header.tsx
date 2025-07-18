// src/components/layout/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion'; // Importe motion

interface HeaderProps {
  drawerWidth: number;
  handleDrawerToggle?: () => void;
}

const Header: React.FC<HeaderProps> = ({ drawerWidth, handleDrawerToggle }) => {
  const { logout, user } = useAuth();

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Ícone de Menu com feedback de hover e clique */}
        <motion.div
          whileHover={{ scale: 1.1 }} // Animação ao passar o mouse
          whileTap={{ scale: 0.9 }} // Animação ao clicar
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </motion.div>

        <Typography variant="h6" noWrap component="div">
          Painel de Administração
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {user && (
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Olá, {user.name}
          </Typography>
        )}
        {/* Botão Sair com feedback de clique */}
        <motion.div
          whileTap={{ scale: 0.95 }}
        >
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<LogoutIcon />}
          >
            Sair
          </Button>
        </motion.div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;