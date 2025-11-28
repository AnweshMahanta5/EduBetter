// src/components/ProfileMenu.tsx
import { useEffect, useState, ChangeEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";

type Role = "student" | "teacher" | null;

interface UserProfile {
  fullName?: string;
  role?: Role;
  class?: string;
  school?: string;
  post?: string;
  udiseCode?: string;
  photoURL?: string;
}

export default function ProfileMenu() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({});
  const [editMode, setEditMode] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      setLoading(true);
      setStatusMsg(null);
      setStatusError(null);

      try {
        const refDoc = doc(db, "users", user.uid);
        const snap = await getDoc(refDoc);
        const data = (snap.data() || {}) as any;

        const merged: UserProfile = {
          fullName: data.fullName || data.name || "",
          role: (data.role as Role) ?? null,
          class: data.class || "",
          school: data.school || "",
          post: data.post || "",
          udiseCode: data.udiseCode || "",
          photoURL: data.photoURL || user.photoURL || "",
        };

        setProfile(merged);
      } catch (err) {
        console.error("Failed to load profile", err);
        setStatusError("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  if (!user) return null; // no icon if not logged in

  const isStudent = profile.role === "student";
  const isTeacher = profile.role === "teacher";

  const initialLetter =
    profile.fullName?.trim()?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  const handleChangeField = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    setStatusMsg(null);
    setStatusError(null);

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // update auth user
      await updateProfile(user, { photoURL: url });
      // update Firestore
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: url },
        { merge: true }
      );

      setProfile((prev) => ({ ...prev, photoURL: url }));
      setStatusMsg("Profile photo updated.");
    } catch (err) {
      console.error("Failed to upload photo", err);
      setStatusError("Failed to upload photo.");
    } finally {
      setSaving(false);
      // reset file input
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setStatusMsg(null);
    setStatusError(null);

    try {
      const update: any = {
        fullName: profile.fullName || "",
      };

      // we do NOT allow changing role here; it's set at signup
      // so we just re-save existing role
      if (profile.role) update.role = profile.role;

      if (isStudent) {
        update.class = profile.class || "";
        update.school = profile.school || "";
      } else if (isTeacher) {
        update.post = profile.post || "";
        update.school = profile.school || "";
        // UDISE is NOT editable; we never overwrite it from here
      }

      await setDoc(doc(db, "users", user.uid), update, { merge: true });

      setStatusMsg("Profile updated.");
      setEditMode(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      setStatusError("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden text-xs font-semibold text-indigo-700"
      >
        {profile.photoURL ? (
          <img
            src={profile.photoURL}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          initialLetter
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-slate-100 p-4 z-30">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center overflow-hidden text-sm font-semibold text-indigo-700">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                initialLetter
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">
                {profile.fullName || "Your name"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
              {profile.role && (
                <p className="text-[11px] text-indigo-600 font-medium">
                  {profile.role === "student" ? "Student" : "Teacher"}
                </p>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-4 flex justify-center">
              <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {/* Upload photo */}
              <div className="text-xs">
                <label className="block font-medium mb-1">
                  Profile photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={saving}
                  className="block w-full text-[11px] text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {/* Name */}
              <div className="text-xs">
                <label className="block font-medium mb-1">Full name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                  disabled={saving}
                  value={profile.fullName || ""}
                  onChange={(e) =>
                    handleChangeField("fullName", e.target.value)
                  }
                />
              </div>

              {/* Role-specific details */}
              {isStudent && (
                <>
                  <div className="text-xs">
                    <label className="block font-medium mb-1">Class</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      disabled={saving}
                      value={profile.class || ""}
                      onChange={(e) =>
                        handleChangeField("class", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-xs">
                    <label className="block font-medium mb-1">School</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      disabled={saving}
                      value={profile.school || ""}
                      onChange={(e) =>
                        handleChangeField("school", e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              {isTeacher && (
                <>
                  <div className="text-xs">
                    <label className="block font-medium mb-1">Post</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      disabled={saving}
                      value={profile.post || ""}
                      onChange={(e) =>
                        handleChangeField("post", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-xs">
                    <label className="block font-medium mb-1">School</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                      disabled={saving}
                      value={profile.school || ""}
                      onChange={(e) =>
                        handleChangeField("school", e.target.value)
                      }
                    />
                  </div>
                  <div className="text-xs">
                    <label className="block font-medium mb-1">
                      School UDISE code
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs bg-slate-50 text-slate-500"
                      value={profile.udiseCode || ""}
                      disabled // 👈 cannot edit UDISE (as you asked)
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Contact support to change UDISE code.
                    </p>
                  </div>
                </>
              )}

              {/* Messages */}
              {statusMsg && (
                <p className="text-[11px] text-emerald-600">{statusMsg}</p>
              )}
              {statusError && (
                <p className="text-[11px] text-red-600">{statusError}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="flex-1 rounded-full bg-indigo-600 text-white text-xs font-medium py-2 hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
