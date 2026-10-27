import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    // Redireciona para página de login se não estiver autenticado
    return <Navigate to="/cadastro" replace />;
  }

  return children;
}