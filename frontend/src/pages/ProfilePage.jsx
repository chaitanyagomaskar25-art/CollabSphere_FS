
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  KeyRound,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
const [serverError, setServerError] = useState("");

  const [statusMessage, setStatusMessage] = useState({
    type: "",
    text: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
      currentPassword: "",
      newPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  // Keep form values in sync with the authenticated user.
  useEffect(() => {
    reset({
      name: user?.name || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
      currentPassword: "",
      newPassword: "",
    });
  }, [user?._id, reset]);

 

const onSubmit = async (formData) => {
  setServerError("");
  clearErrors("currentPassword");

  try {
    const result = await updateProfile(formData);

    if (!result.success) {
      const message =
        result.error || "Failed to update profile";

      setServerError(message);

      if (message.toLowerCase().includes("current password")) {
        setError("currentPassword", {
          type: "server",
          message,
        });
      }

      return;
    }

    setStatusMessage({
      type: "success",
      text: result.message || "Profile updated successfully",
    });

    setServerError("");

    reset({
      name: result.user.name || "",
      bio: result.user.bio || "",
      avatar: result.user.avatar || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    setServerError(
      error.response?.data?.message ||
      error.message ||
      "Something went wrong"
    );
  }
};

  const inputClass = (hasError = false) =>
    `w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800
    border ${
      hasError
        ? "border-rose-500"
        : "border-slate-200 dark:border-slate-700"
    } rounded-xl text-slate-900 dark:text-white text-sm
    focus:outline-none focus:ring-2 ${
      hasError ? "focus:ring-rose-500" : "focus:ring-indigo-500"
    }`;

  const fieldErrorClass =
    "mt-1.5 text-sm text-rose-600 dark:text-rose-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Account Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your personal profile, role identity, and security preferences
        </p>
      </div>

      {/* Success and backend error messages */}
      {statusMessage.text && (
        <div
          role="alert"
          aria-live="assertive"
          className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}

          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card Preview */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold shadow-md shadow-indigo-500/20 uppercase overflow-hidden">
            {watch("avatar") ? (
              <img
                src={watch("avatar")}
                alt={watch("name") || "User avatar"}
                className="w-full h-full object-cover"
              />
            ) : (
              (watch("name") || "U").charAt(0)
            )}
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white truncate">
            {watch("name") || "Anonymous User"}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user?.email}
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            <Shield className="w-3.5 h-3.5" />
            {user?.role === "admin" ? "Platform Admin" : "Collaborator"}
          </div>

          <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 italic">
            "{watch("bio") || "No bio specified yet."}"
          </p>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-6"
          >

            {serverError && (
  <div
    role="alert"
    className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
  >
    {serverError}
  </div>
)}

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                <input
                  type="text"
                  {...register("name", {
                    required: "Full name is required.",
                    validate: (value) =>
                      value.trim().length > 0 ||
                      "Full name cannot be empty.",
                  })}
                  className={`pl-10 ${inputClass(!!errors.name)}`}
                  aria-invalid={!!errors.name}
                />
              </div>

              {errors.name && (
                <p className={fieldErrorClass}>{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Email Address (Read-only)
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />

                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Avatar Image URL (Optional)
              </label>

              <input
                type="url"
                {...register("avatar", {
                 
                })}
                placeholder="https://example.com/avatar.png"
                className={inputClass(!!errors.avatar)}
                aria-invalid={!!errors.avatar}
              />

              {errors.avatar && (
                <p className={fieldErrorClass}>{errors.avatar.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Bio / Specialization
              </label>

              <textarea
                rows={3}
                {...register("bio")}
                placeholder="Senior Architect working on distributed systems..."
                className={`${inputClass()} resize-none`}
              />
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-500" />
                Change Password (Leave blank to keep unchanged)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    Current Password
                  </label>

                  <input
                    type="password"
                    autoComplete="current-password"
                    {...register("currentPassword", {
                      validate: (value) =>
                        !newPassword ||
                        value.trim().length > 0 ||
                        "Please enter your current password.",
                    })}
                    onChange={(event) => {
                      clearErrors("currentPassword");
                      setStatusMessage({ type: "", text: "" });
                      register("currentPassword").onChange(event);
                    }}
                    placeholder="Enter current password"
                    className={inputClass(!!errors.currentPassword)}
                    aria-invalid={!!errors.currentPassword}
                  />

                  {errors.currentPassword && (
                    <p role="alert" className={fieldErrorClass}>
                      {errors.currentPassword.message}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                    New Password
                  </label>

                  <input
                    type="password"
                    autoComplete="new-password"
                    {...register("newPassword", {
                      validate: (value) =>
                        !value ||
                        value.length >= 6 ||
                        "New password must be at least 6 characters long.",
                    })}
                    placeholder="Enter new password"
                    className={inputClass(!!errors.newPassword)}
                    aria-invalid={!!errors.newPassword}
                    onChange={(event) => {
                      setStatusMessage({ type: "", text: "" });
                      register("newPassword").onChange(event);
                    }}
                  />

                  {errors.newPassword && (
                    <p role="alert" className={fieldErrorClass}>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 shadow-sm flex items-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
