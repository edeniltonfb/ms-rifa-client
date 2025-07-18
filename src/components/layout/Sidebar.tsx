// src/components/layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { AppBar, Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import CategoryIcon from '@mui/icons-material/Category';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactElement;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: <DashboardIcon /> },
  { name: 'Itens', href: '/items', icon: <CategoryIcon /> },
  { name: 'Configurações', href: '/settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const router = useRouter();

  const drawer = (
    <Box>
      <Toolbar sx={{ backgroundColor: 'primary.main' }}>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
          Admin MUI
        </Typography>
      </Toolbar>
      <List>
        {navItems.map((item) => (
          <Link href={item.href} key={item.name} passHref legacyBehavior>
            <ListItem disablePadding>
              <ListItemButton selected={router.pathname === item.href} sx={{
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)', // Cor de seleção no Material Design
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)', // Cor de hover
                },
              }}>
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Versão mobile do Drawer */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Melhora a performance em mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'primary.dark', color: 'white', marginTop: '57px' },
        }}
      >
        {drawer}
      </Drawer>
      {/* Versão desktop do Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'primary.dark', color: 'white', marginTop: '65px' },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box >
  );
};

export default Sidebar;