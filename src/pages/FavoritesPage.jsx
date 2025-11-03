import { useState, useEffect } from 'react';
import FavoriteButton from '../components/common/FavoriteButton';
import { ResepMakanan } from '../data/makanan';
import { ResepMinuman } from '../data/minuman';
import { useReviews, useCreateReview } from '../hooks/useReviews';
import { getUserIdentifier } from '../hooks/useFavorites';

export default function FavoritesPage({ onRecipeClick }) {
  const [favorites, setFavorites] = useState([]);
  const [openReviewFor, setOpenReviewFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const favsData = JSON.parse(localStorage.getItem('favoritesData') || '{}');
    // Map to objects { key, category, id, recipe }
    const items = favs.map((key) => {
      // Try to use stored metadata first
      const data = favsData[key];
      if (data) {
        return { key, category: data.category, id: data.id, recipe: { id: data.id, name: data.name, image_url: data.image_url } };
      }

      const parts = String(key).split('-');
      let category = parts[0];
      let id = Number(parts[1]);
      let recipe = null;

      // Handle legacy numeric-only keys (e.g. '3') by treating them as makanan
      if (parts.length < 2 || Number.isNaN(id)) {
        id = Number(key);
        category = 'makanan';
      }

      if (category === 'makanan') {
        recipe = Object.values(ResepMakanan.resep).find(r => r.id === id);
      } else if (category === 'minuman') {
        recipe = Object.values(ResepMinuman.resep).find(r => r.id === id);
      }

      return { key, category, id, recipe };
    }).filter(i => i.recipe);

    setFavorites(items);
  }, []);

  const refreshFavorites = () => {
    const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
    const items = favs.map((key) => {
      const parts = String(key).split('-');
      const category = parts[0];
      const id = Number(parts[1]);
      let recipe = null;

      if (category === 'makanan') {
        recipe = Object.values(ResepMakanan.resep).find(r => r.id === id);
      } else if (category === 'minuman') {
        recipe = Object.values(ResepMinuman.resep).find(r => r.id === id);
      }

      return { key, category, id, recipe };
    }).filter(i => i.recipe);

    setFavorites(items);
  };

  const handleToggle = (recipeId, category, newState) => {
    // After toggle (which updates localStorage), refresh list
    refreshFavorites();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-indigo-50 pb-20 md:pb-8">
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Favorites</h1>
          <p className="text-slate-600 mt-2">Daftar makanan & minuman yang telah Anda tandai sebagai favorit.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-500">Belum ada favorit. Tandai resep untuk menambahkannya ke halaman ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((item) => (
              <div key={item.key} className="bg-white rounded-2xl p-4 shadow-md border border-white/40">
                <div className="flex gap-4">
                  <img src={item.recipe.image_url} alt={item.recipe.name} className="w-28 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-slate-800">{item.recipe.name}</h3>
                        <p className="text-sm text-slate-500 mt-1">{item.category === 'makanan' ? 'Makanan' : 'Minuman'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <FavoriteButton recipeId={item.id} category={item.category} size="sm" onToggle={handleToggle} />
                        <button onClick={() => onRecipeClick && onRecipeClick(item.id, item.category)} className="text-sm text-blue-600 hover:underline">Lihat</button>
                      </div>
                    </div>

                    {/* Review section for this favorite */}
                    <div className="mt-4">
                      <ReviewSection recipeId={item.id} keySuffix={item.key} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ReviewSection({ recipeId, keySuffix }) {
  const { reviews, loading, error, refetch } = useReviews(recipeId);
  const { createReview, loading: creating } = useCreateReview();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      user_identifier: getUserIdentifier(),
      rating,
      comment: comment.trim()
    };
    const res = await createReview(recipeId, data);
    if (res) {
      setComment('');
      setRating(5);
      setOpen(false);
      refetch();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-700">Ulasan ({reviews?.length || 0})</h4>
        <button onClick={() => setOpen(o => !o)} className="text-sm text-blue-600">{open ? 'Batal' : 'Tulis Ulasan'}</button>
      </div>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 bg-gray-50 p-3 rounded-lg">
          <div className="mb-2">
            <label className="block text-sm text-slate-600">Rating</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)} className={`${s <= rating ? 'text-amber-400' : 'text-slate-300'} text-2xl`}>⭐</button>
              ))}
            </div>
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="w-full p-2 border rounded-md mb-2" placeholder="Tulis komentar..." />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={creating || !comment.trim()} className="px-3 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50">Kirim</button>
            <button type="button" onClick={() => setOpen(false)} className="text-sm text-slate-600">Tutup</button>
          </div>
        </form>
      )}

      <div className="mt-3 space-y-2">
        {loading ? (
          <p className="text-slate-500">Memuat ulasan...</p>
        ) : reviews && reviews.length > 0 ? (
          reviews.map(r => (
            <div key={r.id || `${keySuffix}-${r.user_identifier}`} className="p-2 bg-white rounded-md border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-700">{r.user_identifier}</p>
                  <div className="text-yellow-400">{Array.from({length: r.rating}).map((_,i)=> '⭐')}</div>
                </div>
                <div className="text-sm text-slate-500">{new Date(r.created_at || Date.now()).toLocaleDateString()}</div>
              </div>
              {r.comment && <p className="mt-2 text-slate-700">{r.comment}</p>}
            </div>
          ))
        ) : (
          <p className="text-slate-500">Belum ada ulasan untuk resep ini.</p>
        )}
      </div>
    </div>
  );
}
