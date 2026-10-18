import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import chakraTheme from './theme/chakraTheme';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <ChakraProvider theme={chakraTheme}>
      <CSSReset />
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
