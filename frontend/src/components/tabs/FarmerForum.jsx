import { useState, useEffect } from 'react';
import { forumApi } from '../../services/api';

const FORUM_CATEGORIES = [
  "All",
  "Pest & Disease Control",
  "Agronomy & Sowing",
  "Government Schemes",
  "Market Prices & APMC",
  "Irrigation & Soil",
  "General Advice"
];

export default function FarmerForum({ user, t, setView }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'Pest & Disease Control', cropTag: 'All Crops' });
  const [replyText, setReplyText] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDiscussions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await forumApi.getAll({ category: selectedCategory });
      setPosts(response.data || []);
    } catch (err) {
      setError('Failed to fetch forum discussions from MongoDB.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please sign in to publish a discussion.");
      setView('login');
      return;
    }
    setSubmitting(true);
    try {
      const response = await forumApi.create(newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '', category: 'Pest & Disease Control', cropTag: 'All Crops' });
      setShowPostModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit discussion.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!user) {
      alert("Please sign in to like discussions.");
      setView('login');
      return;
    }
    try {
      const res = await forumApi.like(postId);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplySubmit = async (postId) => {
    const text = replyText[postId];
    if (!text || !text.trim()) return;
    if (!user) {
      alert("Please sign in to reply.");
      setView('login');
      return;
    }
    try {
      const res = await forumApi.reply(postId, { comment: text });
      setPosts(posts.map(p => p._id === postId ? res.data : p));
      setReplyText({ ...replyText, [postId]: '' });
    } catch (err) {
      alert("Failed to submit reply.");
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ color: '#202124', marginBottom: '6px', fontSize: '24px', fontWeight: '400', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬</span> {t.forumTitle}
          </h2>
          <p style={{ color: '#5f6368', margin: 0, fontSize: '14px' }}>
            {t.forumSub}
          </p>
        </div>
        <button
          onClick={() => {
            if (!user) {
              alert("Please sign in to post discussions.");
              setView('login');
              return;
            }
            setShowPostModal(!showPostModal);
          }}
          style={{
            padding: '10px 20px',
            background: '#188038',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <span>✍️</span> {t.startDiscussion}
        </button>
      </div>

      {/* CREATE POST MODAL / DRAWER */}
      {showPostModal && (
        <div style={{ background: '#f8f9fa', border: '1px solid #dadce0', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#202124' }}>
            New Agricultural Discussion
          </h3>
          <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  {t.filterCategory}
                </label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px', background: 'white' }}
                >
                  {FORUM_CATEGORIES.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  {t.cropTagLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomato, Rice, Cotton"
                  value={newPost.cropTag}
                  onChange={(e) => setNewPost({ ...newPost, cropTag: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Title
              </label>
              <input
                type="text"
                required
                placeholder={t.postTitlePlaceholder}
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5f6368', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                Content / Question
              </label>
              <textarea
                required
                rows="4"
                placeholder={t.postContentPlaceholder}
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #dadce0', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowPostModal(false)}
                style={{ padding: '8px 16px', background: 'white', border: '1px solid #dadce0', borderRadius: '4px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 20px', background: '#188038', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                {submitting ? 'Publishing...' : t.postBtn}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY TABS FILTER */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '24px' }}>
        {FORUM_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid #188038' : '1px solid #dadce0',
              background: selectedCategory === cat ? '#e6f4ea' : 'white',
              color: selectedCategory === cat ? '#137333' : '#5f6368',
              fontSize: '13px',
              fontWeight: selectedCategory === cat ? '600' : '400',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && (
        <p style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
          Loading farmer discussions from MongoDB...
        </p>
      )}

      {error && (
        <div style={{ padding: '16px', background: '#fce8e6', color: '#c5221f', borderRadius: '8px', border: '1px solid #fad2cf' }}>
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p style={{ textAlign: 'center', color: '#5f6368', padding: '40px 0' }}>
          No discussions found in this category. Be the first to start one!
        </p>
      )}

      {/* DISCUSSIONS LIST */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {posts.map((post) => (
            <div
              key={post._id}
              style={{
                background: 'white',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 2px rgba(60,64,67,0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '12px' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#1a73e8', background: '#e8f0fe', padding: '2px 8px', borderRadius: '4px', marginRight: '8px' }}>
                    {post.category}
                  </span>
                  {post.cropTag && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#188038', background: '#e6f4ea', padding: '2px 8px', borderRadius: '4px' }}>
                      🌱 {post.cropTag}
                    </span>
                  )}
                  <h3 style={{ margin: '10px 0 6px 0', fontSize: '18px', color: '#202124', fontWeight: '600' }}>
                    {post.title}
                  </h3>
                </div>
                <span style={{ fontSize: '12px', color: '#80868b', whiteSpace: 'nowrap' }}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#3c4043', lineHeight: '1.6' }}>
                {post.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f3f4', paddingTop: '12px', fontSize: '13px', color: '#5f6368' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  👤 <strong>{post.author}</strong>
                </span>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#188038', fontWeight: '600', fontSize: '13px' }}
                  >
                    👍 {post.likes || 0} Upvotes
                  </button>
                  <span>💬 {post.replies?.length || 0} {t.repliesLabel}</span>
                </div>
              </div>

              {/* REPLIES SECTION */}
              {post.replies && post.replies.length > 0 && (
                <div style={{ marginTop: '16px', paddingLeft: '16px', borderLeft: '3px solid #e8f0fe', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {post.replies.map((reply, rIdx) => (
                    <div key={rIdx} style={{ background: '#f8f9fa', padding: '10px 14px', borderRadius: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ color: '#202124' }}>{reply.author}</strong>
                        <span style={{ color: '#80868b', fontSize: '11px' }}>{new Date(reply.date).toLocaleDateString()}</span>
                      </div>
                      <p style={{ margin: 0, color: '#444', lineHeight: '1.4' }}>{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* REPLY INPUT */}
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder={t.writeReply}
                  value={replyText[post._id] || ''}
                  onChange={(e) => setReplyText({ ...replyText, [post._id]: e.target.value })}
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #dadce0', borderRadius: '4px', fontSize: '13px' }}
                />
                <button
                  onClick={() => handleReplySubmit(post._id)}
                  style={{ padding: '8px 16px', background: '#1a73e8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}
                >
                  {t.sendReply}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
