"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { createClient } from "../../../lib/supabase/client";
import PostCard from "../../../components/PostCard";

export default function PerfilUsuario({ params }) {
  const { id } = use(params);
  const { user, profile: myProfile } = useAuth();
  const supabase = createClient();

  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ posts: 0, curtidas: 0, comentarios: 0 });
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edição de bio (apenas para o próprio perfil)
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isOwnProfile = user && user.id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      // Buscar perfil do usuário
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, nome, bio')
        .eq('id', id)
        .single();

      setProfileData(prof);
      if (prof) setBioInput(prof.bio || "");

      // Buscar stats
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', id);

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
        .eq('user_id', id)
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

      setLoading(false);
    };

    fetchProfile();
  }, [id, supabase]);

  const handleSaveBio = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ bio: bioInput })
      .eq('id', user.id);

    setIsSaving(false);
    if (!error) {
      setIsEditing(false);
      setProfileData(prev => ({ ...prev, bio: bioInput }));
    } else {
      alert("Erro ao salvar bio!");
    }
  };

  const handleDeletePost = (deletedId) => {
    setUserPosts(prev => prev.filter(p => p.id !== deletedId));
    setStats(prev => ({ ...prev, posts: prev.posts - 1 }));
  };

  if (loading) {
    return (
      <div className="perfil-page-wrapper">
        <div className="perfil-container">
          <p className="empty-state">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="perfil-page-wrapper">
        <div className="perfil-container">
          <p className="empty-state">Usuário não encontrado.</p>
        </div>
      </div>
    );
  }

  const nomeExibicao = profileData.nome || 'Anônimo';
  const bioExibicao = profileData.bio || "Sem bio ainda.";

  return (
    <div className="perfil-page-wrapper">
      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-header-bg"></div>
          <div className="perfil-info">
            <div className="perfil-avatar-large">
              {nomeExibicao.charAt(0).toUpperCase()}
            </div>
            <h2 className="perfil-nome">{nomeExibicao}</h2>

            {isOwnProfile && isEditing ? (
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
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="action-btn"
                    style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem", border: "1px solid var(--border-color)", borderRadius: "4px" }}
                  >
                    ✏️ Editar Bio
                  </button>
                )}
              </div>
            )}

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

      {/* Posts do usuário */}
      <section className="perfil-posts-section">
        <h3 className="perfil-posts-title">
          {isOwnProfile ? "Seus Posts" : `Posts de ${nomeExibicao}`}
        </h3>
        <div className="feed">
          {userPosts.length === 0 ? (
            <p className="empty-state">Nenhum post ainda.</p>
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
