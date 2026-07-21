import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { Role } from '../lib/constants';

export function useAuth() {
  const navigate = useNavigate();
  const { user, token, setAuth, logout: storeLogout } = useAuthStore();

  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback(
    (role: Role) => {
      if (!user) return false;
      return user.role === role;
    },
    [user],
  );

  const hasAnyRole = useCallback(
    (roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role as Role);
    },
    [user],
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    setAuth,
    logout,
  };
}
