"use client";

import { useAuth } from "../../components/AuthProvider";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import PostCard from "../../components/PostCard";

export default function Perfil() {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const [stats, setStats] = useState({ posts: 0, curtidas: 0, comentarios: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Conta posts
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Conta curtidas que o usuário deu
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Conta comentários
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setStats({
        posts: postsCount || 0,
        curtidas: likesCount || 0,
        comentarios: commentsCount || 0,
      });

      // Buscar posts do usuário
      const { data: posts } = await supabase
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (posts) {
        setUserPosts(posts.map(post => ({
          id: post.id,
          user_id: post.user_id,
          autor: post.profiles?.nome || 'Anônimo',
          conteudo: post.conteudo,
          data: new Date(post.created_at).toLocaleString("pt-BR"),
          likesCount: post.likes[0]?.count || 0,
          commentsCount: post.comments[0]?.count || 0,
        })));
      }
    };

    fetchData();
  }, [user, supabase]);

  useEffect(() => {
    if (profile) {
      setBioInput(profile.bio || "");
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="perfil-page-wrapper">
        <div className="perfil-container">
          <p className="empty-state">Você precisa estar logado para ver seu perfil.</p>
        </div>
      </div>
    );
  }

  const handleSaveBio = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioInput })
      .eq('id', user.id);
      
    setIsSaving(false);
    if (!error) {
      setIsEditing(false);
      window.location.reload();
    } else {
      alert("Erro ao salvar bio!");
    }
  };

  const handleDeletePost = (deletedId) => {
    setUserPosts(prev => prev.filter(p => p.id !== deletedId));
    setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
  };

  const nomeExibicao = profile?.nome || user.email.split('@')[0];
  const bioExibicao = profile?.bio || "Entusiasta de tecnologia e desenvolvimento web. Aprendendo Next.js com Supabase!";

  return (
    <div className="perfil-page-wrapper">
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-header-bg"></div>
          <div className="perfil-info">
            <img
              className="perfil-avatar-large"
              src={`https://ui-avatars.com/api/?name=${nomeExibicao}&background=random&size=100`}
              alt={nomeExibicao}
            />
            <h2 className="perfil-nome">{nomeExibicao}</h2>
            
            {isEditing ? (
              <div style={{ width: "100%", marginBottom: "2rem" }}>
                <textarea 
                  className="post-input" 
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Escreva algo sobre você..."
                  rows={3}
                  style={{ marginBottom: "0.5rem" }}
                />
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button 
                    onClick={() => setIsEditing(false)} 
                    className="logout-button"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveBio} 
                    className="post-button"
                    disabled={isSaving}
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
                <p className="perfil-bio" style={{ marginBottom: "0.5rem" }}>{bioExibicao}</p>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="action-btn"
                  style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px" }}
                >
                  ✏️ Editar Bio
                </button>
              </div>
            )}
            <p className="perfil-email">{user.email}</p>
            
            <div className="perfil-stats">
              <div className="stat">
                <span className="stat-value">{stats.posts}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.curtidas}</span>
                <span className="stat-label">Curtidas</span>
              </div>
              <div className="stat">
                <span className="stat-value">{stats.comentarios}</span>
                <span className="stat-label">Comentários</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seus Posts */}
      <section className="perfil-posts-section">
        <h3 className="perfil-posts-title">Seus Posts</h3>
        <div className="feed">
          {userPosts.length === 0 ? (
            <p className="empty-state">Você ainda não publicou nenhum post.</p>
          ) : (
            userPosts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                postUserId={post.user_id}
                autor={post.autor}
                conteudo={post.conteudo}
                data={post.data}
                initialLikes={post.likesCount}
                initialCommentsCount={post.commentsCount}
                onDelete={handleDeletePost}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
