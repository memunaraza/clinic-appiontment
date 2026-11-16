const SESSION_KEY = "clinicflow.session";

export const readSession = () => {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.token || !session?.user) {
      window.localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const writeSession = (session) => {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  window.localStorage.removeItem(SESSION_KEY);
};

export const getSessionToken = () => readSession()?.token ?? null;
