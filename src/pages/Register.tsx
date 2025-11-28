import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Role = "student" | "teacher";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Student fields
  const [studentClass, setStudentClass] = useState("");
  const [studentSchool, setStudentSchool] = useState("");

  // Teacher fields
  const [teacherPost, setTeacherPost] = useState("");
  const [teacherSchool, setTeacherSchool] = useState("");
  const [teacherUdise, setTeacherUdise] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "student") {
      if (!studentClass.trim() || !studentSchool.trim()) {
        setError("Please fill Class and School for student.");
        return;
      }
    } else {
      if (
        !teacherPost.trim() ||
        !teacherSchool.trim() ||
        !teacherUdise.trim()
      ) {
        setError("Please fill Post, School and UDISE code for teacher.");
        return;
      }
    }

    setLoading(true);
    try {
      const baseProfile: any = {
        fullName,
        role,
        createdAt: new Date().toISOString(),
      };

      if (role === "student") {
        baseProfile.class = studentClass;
        baseProfile.school = studentSchool;
      } else {
        baseProfile.post = teacherPost;
        baseProfile.school = teacherSchool;
        baseProfile.udiseCode = teacherUdise;
      }

      await signup(email, password, baseProfile);

      // after signup, user is logged in → go to Classroom
      navigate("/classroom");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-2">
          Create account
        </h1>
        <p className="text-center text-slate-500 text-sm mb-6">
          Choose if you are a student or a teacher, then sign up.
        </p>

        {/* Role toggle */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition
              ${
                role === "student"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
          >
            🎓 I&apos;m a student
          </button>
          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex-1 rounded-full border px-3 py-2 text-sm font-medium transition
              ${
                role === "teacher"
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
          >
            🧑‍🏫 I&apos;m a teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              type="text"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          {/* Student-specific questions */}
          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Class
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8, 9, 10, 11 Science"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  School
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={studentSchool}
                  onChange={(e) => setStudentSchool(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Teacher-specific questions */}
          {role === "teacher" && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Post
                </label>
                <input
                  type="text"
                  placeholder="e.g. TGT Maths, PGT Physics"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={teacherPost}
                  onChange={(e) => setTeacherPost(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  School
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={teacherSchool}
                  onChange={(e) => setTeacherSchool(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  School UDISE code
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                  value={teacherUdise}
                  onChange={(e) => setTeacherUdise(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Email & passwords (common) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (Gmail)
            </label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
