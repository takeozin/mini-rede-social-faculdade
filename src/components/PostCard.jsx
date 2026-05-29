"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase/client";
import { useAuth } from "./AuthProvider";

export default function PostCard({ postId, postUserId, autor, conteudo, data, initialLikes = 0, initialCommentsCount = 0, onDelete }) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  
  const { user } = useAuth();
  const supabase = createClient();

  // Verifica se o usuário atual já curtiu o post
  useEffect(() => {
    if (!user || !postId) return;
    
    const checkLike = async () => {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
        
      if (data) setIsLiked(true);
    };
    
    checkLike();
  }, [user, postId, supabase]);

  const handleLike = async () => {
    if (!user) return alert("Faça login para curtir!");
    
    if (isLiked) {
      // Remover curtida
      await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLikes(prev => prev - 1);
      setIsLiked(false);
    } else {
      // Adicionar curtida
      await supabase.from('likes').insert([{ post_id: postId, user_id: user.id }]);
      setLikes(prev => prev + 1);
      setIsLiked(true);
    }
  };

  const toggleComments = async () => {
    setShowComments(!showComments);
    if (!showComments && comments.length === 0) {
      // Carregar comentários
      const { data } = await supabase
        .from('comments')
        .select(`
          id, conteudo, created_at,
          profiles:user_id ( nome )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
        
      if (data) setComments(data);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    const { data: insertedComment, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, user_id: user.id, conteudo: newComment }])
      .select(`id, conteudo, created_at, profiles:user_id ( nome )`)
      .single();

    if (!error && insertedComment) {
      setComments([...comments, insertedComment]);
      setNewComment("");
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    setIsDeleting(true);
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      console.error("Erro ao excluir post:", error);
      setIsDeleting(false);
      return;
    }

    if (onDelete) onDelete(postId);
  };

  const isOwner = user && postUserId && user.id === postUserId;

  return (
    <article className={`post-card ${isDeleting ? 'post-deleting' : ''}`}>
      <div className="post-header">
        <Link href={`/perfil/${postUserId}`} className="post-author-link">
          <div className="post-avatar">
            {autor.charAt(0).toUpperCase()}
          </div>
          <div className="post-meta">
            <h2 className="post-author">{autor}</h2>
            <time className="post-time">{data}</time>
          </div>
        </Link>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="delete-btn"
            disabled={isDeleting}
            title="Excluir post"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        )}
      </div>
      <p className="post-content">{conteudo}</p>
      
      <div className="post-actions">
        <button 
          onClick={handleLike} 
          className={`action-btn ${isLiked ? 'liked' : ''}`}
        >
          {isLiked ? '❤️' : '🤍'} {likes} Curtidas
        </button>
        <button onClick={toggleComments} className="action-btn">
          💬 {showComments ? 'Ocultar Comentários' : `${initialCommentsCount} Comentários`}
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map(c => (
              <div key={c.id} className="comment-item">
                <strong>{c.profiles?.nome}</strong>
                <span>{c.conteudo}</span>
              </div>
            ))}
            {comments.length === 0 && <p className="no-comments">Nenhum comentário ainda.</p>}
          </div>
          
          {user ? (
            <form onSubmit={handleAddComment} className="comment-form">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva um comentário..."
                className="comment-input"
              />
              <button type="submit" className="comment-submit">Enviar</button>
            </form>
          ) : (
            <p className="login-prompt-small">Faça login para comentar.</p>
          )}
        </div>
      )}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <p className="modal-title">Excluir post</p>
            <p className="modal-text">Tem certeza que deseja excluir este post? Essa ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="modal-btn modal-btn-confirm" onClick={confirmDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
