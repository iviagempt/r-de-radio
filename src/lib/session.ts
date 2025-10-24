// Gera ou recupera um ID de sessão único para o usuário
export function getUserSession(): string {
  if (typeof window === "undefined") return "";
  
  let session = localStorage.getItem("rdr_user_session");
  
  if (!session) {
    session = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("rdr_user_session", session);
  }
  
  return session;
}
