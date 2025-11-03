// src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import userService from '../services/userService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(() => userService.getUserProfile());
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const p = userService.getUserProfile();
    setProfile(p);
    setUsername(p.username || '');
    setBio(p.bio || '');
    setAvatarPreview(p.avatar || null);
  }, []);

  const handleSave = () => {
    const newProfile = {
      ...profile,
      username: username.trim() || 'Pengguna',
      bio: bio.trim(),
      avatar: avatarPreview || null,
    };

    const res = userService.saveUserProfile(newProfile);
    if (res && res.success) {
      setProfile(res.data);
      setEditing(false);
      alert('Profil berhasil disimpan');
    } else {
      alert('Gagal menyimpan profil');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setAvatarPreview(null);
    // also update stored profile
    const res = userService.updateAvatar(null);
    if (res && res.success) {
      setProfile(res.data);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Profil Saya</h1>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-6">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400">No Avatar</div>
              )}
            </div>

            <div className="flex-1">
              {!editing ? (
                <>
                  <div className="text-2xl font-semibold">{profile.username}</div>
                  <p className="text-sm text-slate-600 mt-1">{profile.bio || 'Tambahkan bio singkat tentang diri Anda.'}</p>
                  <div className="mt-4">
                    <button onClick={() => setEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md">Edit Profil</button>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Username</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 px-3 py-2 border rounded-md" />

                  <label className="block text-sm font-medium text-slate-700 mt-4">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 border rounded-md" />

                  <label className="block text-sm font-medium text-slate-700 mt-4">Avatar</label>
                  <div className="flex items-center gap-3 mt-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} />
                    <button onClick={handleResetAvatar} type="button" className="text-sm text-red-600">Hapus Avatar</button>
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-md">Simpan</button>
                    <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 rounded-md">Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
