import React, { useState, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as TransactionsIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

interface LayoutProps {
  children: ReactNode;
  toggleDarkMode?: () => void;
  darkMode?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  toggleDarkMode, 
  darkMode = false 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const router = useRouter();

  const drawerWidth = 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Transactions', icon: <TransactionsIcon />, path: '/transactions' },
    { text: 'Categories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Budget Tool
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={router.pathname === item.path}
              onClick={() => {
                if (isMobile) {
                  setDrawerOpen(false);
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === router.pathname)?.text || 'Budget Tool'}
          </Typography>
          {toggleDarkMode && (
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerOpen ? drawerWidth : 0 }, flexShrink: { sm: 0 } }}
      >
        {/* Mobile drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          /* Desktop drawer */
          <Drawer
            variant="persistent"
            open={drawerOpen}
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 0}px)` },
          ml: { sm: `${drawerOpen ? drawerWidth : 0}px` },
          mt: { xs: '56px', sm: '64px' }, // Toolbar height
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout; 