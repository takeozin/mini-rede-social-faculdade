"use client";

import { useState, useEffect } from "react";
import PostCard from "../components/PostCard";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "../components/AuthProvider";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [novoPostConteudo, setNovoPostConteudo] = useState("");
  const { user, profile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          conteudo,
          created_at,
          profiles:user_id ( nome ),
          likes ( count ),
          comments ( count )
        `)
        .order('created_at', { ascending: false });

      if (data) {
        // Formatar os dados para o formato esperado pelo PostCard
        const formattedPosts = data.map(post => ({
          id: post.id,
          user_id: post.user_id,
          autor: post.profiles?.nome || 'Anônimo',
          conteudo: post.conteudo,
          data: new Date(post.created_at).toLocaleString("pt-BR"),
          likesCount: post.likes[0]?.count || 0,
          commentsCount: post.comments[0]?.count || 0
        }));
        
        setPosts(formattedPosts);
        
        // Salva os posts no LocalStorage
        localStorage.setItem("miniRedeSocialPosts", JSON.stringify(formattedPosts));
      }
    };

    fetchPosts();
  }, [supabase]);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!novoPostConteudo.trim() || !user) return;

    const conteudo = novoPostConteudo;
    setNovoPostConteudo(""); // Limpa o input rápido

    // 1. Salvar no Supabase (Real)
    const { data: insertedPost, error } = await supabase
      .from('posts')
      .insert([
        { user_id: user.id, conteudo }
      ])
      .select(`
        id,
        conteudo,
        created_at,
        profiles:user_id ( nome )
      `)
      .single();

    if (error) {
      console.error("Erro ao postar:", error);
      return;
    }

    // Formatar o novo post
    const formattedNewPost = {
      id: insertedPost.id,
      user_id: user.id,
      autor: insertedPost.profiles?.nome || profile?.nome || user.email,
      conteudo: insertedPost.conteudo,
      data: new Date(insertedPost.created_at).toLocaleString("pt-BR"),
      likesCount: 0,
      commentsCount: 0
    };

    // Atualizar estado
    const updatedPosts = [formattedNewPost, ...posts];
    setPosts(updatedPosts);
    
    // Salva no LocalStorage
    localStorage.setItem("miniRedeSocialPosts", JSON.stringify(updatedPosts));
  };

  return (
    <div className="feed-container">
      <section className="create-post">
        <h2>Criar nova postagem</h2>
        <form onSubmit={handlePublish} className="post-form">
          <input
            type="text"
            placeholder="No que você está pensando?"
            value={novoPostConteudo}
            onChange={(e) => setNovoPostConteudo(e.target.value)}
            className="post-input"
            disabled={!user}
          />
          <button type="submit" className="post-button" disabled={!user}>
            {user ? "Publicar" : "Faça login para publicar"}
          </button>
        </form>
      </section>

      <section className="feed">
        {posts.length === 0 ? (
          <p className="empty-state">Nenhum post encontrado. Seja o primeiro a publicar!</p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              postId={post.id}
              postUserId={post.user_id}
              autor={post.autor}
              conteudo={post.conteudo}
              data={post.data}
              initialLikes={post.likesCount}
              initialCommentsCount={post.commentsCount}
              onDelete={(deletedId) => {
                const updatedPosts = posts.filter(p => p.id !== deletedId);
                setPosts(updatedPosts);
                localStorage.setItem("miniRedeSocialPosts", JSON.stringify(updatedPosts));
              }}
            />
          ))
        )}
      </section>
    </div>
  );
}
