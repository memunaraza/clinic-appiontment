import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import { clearSession, readSession, writeSession } from "../utils/session.js";
import AuthContext from "./authContext.js";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readSession());

  const saveAuth = useCallback((data) => {
    const nextSession = { token: data.token, user: data.user };
    writeSession(nextSession);
    setSession(nextSession);
    return data.user;
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post("/auth/login", credentials);
    return saveAuth(data);
  }, [saveAuth]);

  const register = useCallback(async (details) => {
    const { data } = await api.post("/auth/register", details);
    return saveAuth(data);
  }, [saveAuth]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setSession((current) => {
      if (!current) return current;
      const nextSession = { ...current, user: { ...current.user, ...updates } };
      writeSession(nextSession);
      return nextSession;
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setSession(null);
    window.addEventListener("clinicflow:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("clinicflow:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token && session?.user),
    login,
    register,
    updateUser,
    logout
  }), [session, login, register, updateUser, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
