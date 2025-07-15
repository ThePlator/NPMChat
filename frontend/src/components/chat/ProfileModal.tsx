import React, { useRef } from 'react';

export default function ProfileModal({
  open,
  onClose,
  profileDraft,
  setProfileDraft,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  profileDraft: any;
  setProfileDraft: (p: any) => void;
  onSave: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProfileDraft((p: any) => ({
          ...p,
          avatarUrl: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  }
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
      <div className="relative bg-white border-4 border-black rounded-lg p-4 md:p-8 w-full max-w-xs md:max-w-md shadow-lg flex flex-col gap-4 md:gap-6">
        <button
          className="absolute top-3 right-3 text-black font-extrabold text-2xl hover:text-[#39ff14]"
          onClick={onClose}
          aria-label="Close">
          ×
        </button>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-24 h-24 rounded-full bg-[#b39ddb] flex items-center justify-center border-4 border-black cursor-pointer hover:bg-[#39ff14]"
            onClick={() => fileInputRef.current?.click()}
            title="Change photo">
            {profileDraft.avatarUrl ? (
              <img
                src={profileDraft.avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-3xl font-bold text-black">
                {profileDraft.name[0]}
              </span>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <span className="text-xs text-gray-500">Click to change photo</span>
        </div>
        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Name
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[#39ff14] transition-all rounded-lg"
            type="text"
            value={profileDraft.name}
            onChange={(e) =>
              setProfileDraft((p: any) => ({ ...p, name: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Bio
          <textarea
            className="border-2 border-black px-4 py-2 text-lg bg-[#eaffea] focus:bg-[#39ff14]/40 focus:outline-none focus:border-[#b39ddb] transition-all rounded-lg min-h-[60px]"
            value={profileDraft.bio}
            onChange={(e) =>
              setProfileDraft((p: any) => ({ ...p, bio: e.target.value }))
            }
          />
        </label>
        <button
          className="border-2 border-black bg-[#39ff14] text-black font-extrabold text-lg py-2 rounded-lg transition-all hover:bg-[#b39ddb] hover:text-white focus:outline-none shadow"
          onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
}
