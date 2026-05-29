"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: nome,
            }
          }
        });
        if (error) throw error;
        setSuccessMsg("Enviamos um link de confirmação para o seu e-mail! Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta, depois volte aqui e faça login.");
        setIsLogin(true); // Opcionalmente, já volta pro form de login
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">Mini Rede Social</h1>
        <h2>{isLogin ? "Entrar" : "Criar Conta"}</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message" style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem" }}>{successMsg}</div>}

        <form onSubmit={handleAuth} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required={!isLogin}
                placeholder="Seu nome"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="post-button login-button" disabled={loading}>
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <button
              type="button"
              className="link-button"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Cadastre-se" : "Faça Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
