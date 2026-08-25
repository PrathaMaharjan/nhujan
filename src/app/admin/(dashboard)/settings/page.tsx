"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setName(data.name || "");
          setEmail(data.email || "");
          setCurrentEmail(data.email || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    const isChangingEmail = email.trim().toLowerCase() !== currentEmail.toLowerCase();
    if (isChangingEmail && !profileCurrentPassword) {
      setProfileMessage({
        type: "error",
        text: "Please enter your current password to confirm changing your email address.",
      });
      return;
    }

    setProfileSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          currentPassword: profileCurrentPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileMessage({ type: "error", text: data.error || "Failed to update profile." });
      } else {
        setCurrentEmail(email.trim().toLowerCase());
        setProfileCurrentPassword("");
        if (data.emailChanged) {
          setProfileMessage({
            type: "success",
            text: "Email updated successfully! Use this new email for future logins.",
          });
        } else {
          setProfileMessage({ type: "success", text: "Profile details updated successfully." });
        }
        router.refresh();
      }
    } catch {
      setProfileMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password." });
      } else {
        setPasswordMessage({ type: "success", text: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <p className="text-white/30 text-xs tracking-widest uppercase">Loading settings...</p>;
  }

  const isEmailChanged = email.trim().toLowerCase() !== currentEmail.toLowerCase();

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-12">
        <p className="text-[10px] tracking-[0.3em] text-white/40 mb-2 uppercase">Account & Security</p>
        <h1 className="text-3xl font-extralight tracking-tight text-white">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Email & Profile Section */}
        <section className="border border-white/10 p-6 md:p-8 bg-white/[0.01]">
          <h2 className="text-sm tracking-[0.2em] uppercase text-white/80 mb-1">Admin Profile</h2>
          <p className="text-xs text-white/40 mb-6">Manage your admin display name and login email.</p>

          {profileMessage && (
            <div
              className={`text-xs p-3 mb-6 border ${
                profileMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/40 border-red-500/30 text-red-300"
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                className="w-full bg-black border border-white/20 px-3.5 py-2.5 text-sm text-white focus:border-white/60 outline-none transition"
              />
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-2">
                Login Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-black border border-white/20 px-3.5 py-2.5 text-sm text-white focus:border-white/60 outline-none transition"
              />
            </div>

            {isEmailChanged && (
              <div className="pt-2">
                <label className="text-[10px] tracking-[0.2em] uppercase text-amber-400/80 block mb-2">
                  Confirm with Current Password
                </label>
                <div className="relative">
                  <input
                    type={showProfilePassword ? "text" : "password"}
                    required
                    value={profileCurrentPassword}
                    onChange={(e) => setProfileCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-black border border-amber-500/40 px-3.5 py-2.5 pr-10 text-sm text-white focus:border-amber-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword((prev) => !prev)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                    aria-label={showProfilePassword ? "Hide password" : "Show password"}
                  >
                    {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="mt-2 text-xs tracking-[0.2em] uppercase bg-white text-black py-2.5 px-6 font-medium hover:bg-white/90 disabled:opacity-40 transition cursor-pointer self-start"
            >
              {profileSaving ? "Saving..." : "Save Profile"}
            </button>
          </form>
        </section>

        {/* Change Password Section */}
        <section className="border border-white/10 p-6 md:p-8 bg-white/[0.01]">
          <h2 className="text-sm tracking-[0.2em] uppercase text-white/80 mb-1">Change Password</h2>
          <p className="text-xs text-white/40 mb-6">Ensure your account uses a secure password.</p>

          {passwordMessage && (
            <div
              className={`text-xs p-3 mb-6 border ${
                passwordMessage.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/40 border-red-500/30 text-red-300"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/20 px-3.5 py-2.5 pr-10 text-sm text-white focus:border-white/60 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-black border border-white/20 px-3.5 py-2.5 pr-10 text-sm text-white focus:border-white/60 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40 block mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-black border border-white/20 px-3.5 py-2.5 pr-10 text-sm text-white focus:border-white/60 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="mt-2 text-xs tracking-[0.2em] uppercase bg-white text-black py-2.5 px-6 font-medium hover:bg-white/90 disabled:opacity-40 transition cursor-pointer self-start"
            >
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
