"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchRef = useRef(null);
  const supabase = createClient();

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efeito de busca com debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome, bio')
        .ilike('nome', `%${searchTerm}%`)
        .limit(5);

      if (data) {
        setResults(data);
        setIsOpen(true);
      }
      setLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, supabase]);

  return (
    <div className="search-container" ref={searchRef}>
      <input
        type="text"
        className="search-input"
        placeholder="Pesquisar usuários..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => {
          if (searchTerm.trim() && results.length > 0) setIsOpen(true);
        }}
      />
      
      {isOpen && searchTerm.trim() && (
        <div className="search-dropdown">
          {loading ? (
            <div className="search-status">Buscando...</div>
          ) : results.length > 0 ? (
            results.map((user) => (
              <Link 
                href={`/perfil/${user.id}`} 
                key={user.id} 
                className="search-item"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <div className="search-item-avatar">
                  {user.nome ? user.nome.charAt(0).toUpperCase() : '?'}
                </div>
                <div className="search-item-info">
                  <div className="search-item-name">{user.nome || "Usuário"}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="search-status">Nenhum usuário encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
}
