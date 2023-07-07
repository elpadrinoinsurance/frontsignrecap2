import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { Link, useHistory } from 'react-router-dom';
import './style.scss'
import { clearCachedUserInfo, getRol, roles, routes, Session } from '../../helper';

const drawerWidth = 240;
const navItems = [
  { name: 'Inicio', route: routes.dashboard },
  { name: 'Formulario', route: '/admin/form' },
  { name: 'Diseñar', route: '/admin/designer' }
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const history = useHistory()
  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const logout = async () => {
    const resp = await Session.delete()
    if(!resp) return
    clearCachedUserInfo()
    history.push(routes.login)
  }

  const onSettings = () => history.push(routes.settings)

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Herramienta PDF
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Link className='navbar-link' to={item.route} key={item.name}>
            <ListItem disablePadding>
              <ListItemButton sx={{ textAlign: 'center' }}>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          </Link>
        ))}
        {getRol() === roles.ADMIN && (<Button onClick={onSettings} sx={{ color: 'black' }}>
          Cuentas
        </Button>)}
        <Button onClick={logout} sx={{ color: 'black' }}>
          Salir
        </Button>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar component="nav">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            Herramienta PDF
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            {navItems.map((item) => (
              <Link key={item.name} className='navbar-link' to={item.route}>
                <Button sx={{ color: '#fff' }}>
                  {item.name}
                </Button>
              </Link>
            ))}
            {getRol() === roles.ADMIN && (<Button onClick={onSettings} sx={{ color: '#fff' }}>
              Cuentas
            </Button>)}
            <Button onClick={logout} sx={{ color: '#fff' }}>
              Salir
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}
