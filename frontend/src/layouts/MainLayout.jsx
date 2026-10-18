import { Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/navigation/AppHeader';

function MainLayout() {
  return (
    <>
      <AppHeader />
      <Container sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </>
  );
}

export default MainLayout;
