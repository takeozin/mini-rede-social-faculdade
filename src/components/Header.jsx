"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import SearchBar from "./SearchBar";

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Mini Rede Social</h1>
        
        {user && <SearchBar />}

        <nav className="nav-links">
          {user ? (
            <>
              <Link href="/">Home</Link>
              <Link href="/perfil">Perfil</Link>
              <div className="user-menu">
                <span className="user-name">Olá, {profile?.nome || user.email.split('@')[0]}</span>
                <button onClick={signOut} className="logout-button">Sair</button>
              </div>
            </>
          ) : (
            !loading && <Link href="/login">Entrar</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
