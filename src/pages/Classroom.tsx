// src/pages/Classroom.tsx
import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  serverTimestamp,
  orderBy,
  setDoc,
} from "firebase/firestore";

type Role = "student" | "teacher" | null;

interface ClassItem {
  id: string;
  className: string;
  classCode: string;
  description?: string;
}

interface Announcement {
  id: string;
  text: string;
  createdAt?: Date | null;
  authorName?: string;
}

interface Material {
  id: string;
  title: string;
  url: string;
  createdAt?: Date | null;
}

interface StudentInfo {
  id: string;
  name?: string;
  email?: string;
}

export default function Classroom() {
  const { user } = useAuth();

  const [role, setRole] = useState<Role>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Teacher: create class
  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [creatingClass, setCreatingClass] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Student: join class
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);

  // Selected class details
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // New announcement / material (teacher only)
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [postingAnnouncement, setPostingAnnouncement] = useState(false);
  const [newMaterialTitle, setNewMaterialTitle] = useState("");
  const [newMaterialUrl, setNewMaterialUrl] = useState("");
  const [postingMaterial, setPostingMaterial] = useState(false);

  // --------------------------------------------------
  // Load role and classes on mount / when user changes
  // --------------------------------------------------
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setRole(null);
        setRoleLoading(false);
        setClasses([]);
        setClassesLoading(false);
        return;
      }

      setRoleLoading(true);
      setClassesLoading(true);

      try {
        // 1) Get role from user document
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = (userSnap.data() || {}) as any;
        const savedRole = (userData.role as Role) ?? null;
        setRole(savedRole);

        // 2) Fetch classes for this user based on role
        if (savedRole === "teacher") {
          await loadTeacherClasses(user.uid);
        } else if (savedRole === "student") {
          await loadStudentClasses(user.uid);
        } else {
          setClasses([]);
        }
      } catch (err) {
        console.error("Failed to load role/classes", err);
      } finally {
        setRoleLoading(false);
        setClassesLoading(false);
      }
    };

    loadData();
  }, [user]);

  const loadTeacherClasses = async (teacherId: string) => {
    const q = query(
      collection(db, "classes"),
      where("teacherId", "==", teacherId),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const list: ClassItem[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as any;
      list.push({
        id: docSnap.id,
        className: data.className || "Untitled class",
        classCode: data.classCode || "",
        description: data.description || "",
      });
    });
    setClasses(list);
    if (!selectedClassId && list.length > 0) {
      setSelectedClassId(list[0].id);
    }
  };

  const loadStudentClasses = async (studentId: string) => {
    const joinedRef = collection(db, "users", studentId, "classesJoined");
    const joinedSnap = await getDocs(joinedRef);
    const classIds: string[] = [];
    joinedSnap.forEach((d) => classIds.push(d.id));

    if (classIds.length === 0) {
      setClasses([]);
      setSelectedClassId(null);
      return;
    }

    const promises = classIds.map((id) => getDoc(doc(db, "classes", id)));
    const results = await Promise.all(promises);

    const list: ClassItem[] = [];
    results.forEach((docSnap) => {
      if (!docSnap.exists()) return;
      const data = docSnap.data() as any;
      list.push({
        id: docSnap.id,
        className: data.className || "Untitled class",
        classCode: data.classCode || "",
        description: data.description || "",
      });
    });

    setClasses(list);
    if (!selectedClassId && list.length > 0) {
      setSelectedClassId(list[0].id);
    }
  };

  // --------------------------------------------------
  // Load details of selected class
  // --------------------------------------------------
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedClassId) {
        setSelectedClass(null);
        setAnnouncements([]);
        setMaterials([]);
        setStudents([]);
        return;
      }

      setDetailsLoading(true);
      try {
        // Class info
        const classRef = doc(db, "classes", selectedClassId);
        const classSnap = await getDoc(classRef);
        if (!classSnap.exists()) {
          setSelectedClass(null);
          setAnnouncements([]);
          setMaterials([]);
          setStudents([]);
          setDetailsLoading(false);
          return;
        }

        const classData = classSnap.data() as any;
        const currentClass: ClassItem = {
          id: classSnap.id,
          className: classData.className || "Untitled class",
          classCode: classData.classCode || "",
          description: classData.description || "",
        };
        setSelectedClass(currentClass);

        // Announcements
        const annQ = query(
          collection(db, "classes", selectedClassId, "announcements"),
          orderBy("createdAt", "desc")
        );
        const annSnap = await getDocs(annQ);
        const annList: Announcement[] = [];
        annSnap.forEach((a) => {
          const d = a.data() as any;
          annList.push({
            id: a.id,
            text: d.text || "",
            authorName: d.authorName || "",
            createdAt: d.createdAt?.toDate?.() || null,
          });
        });
        setAnnouncements(annList);

        // Materials
        const matQ = query(
          collection(db, "classes", selectedClassId, "materials"),
          orderBy("createdAt", "desc")
        );
        const matSnap = await getDocs(matQ);
        const matList: Material[] = [];
        matSnap.forEach((m) => {
          const d = m.data() as any;
          matList.push({
            id: m.id,
            title: d.title || "",
            url: d.url || "",
            createdAt: d.createdAt?.toDate?.() || null,
          });
        });
        setMaterials(matList);

        // Students (for teacher view mainly)
        const studentsSnap = await getDocs(
          collection(db, "classes", selectedClassId, "students")
        );
        const studentList: StudentInfo[] = [];
        studentsSnap.forEach((s) => {
          const d = s.data() as any;
          studentList.push({
            id: s.id,
            name: d.name || "",
            email: d.email || "",
          });
        });
        setStudents(studentList);
      } catch (err) {
        console.error("Failed to load class details", err);
      } finally {
        setDetailsLoading(false);
      }
    };

    if (selectedClassId) {
      loadDetails();
    }
  }, [selectedClassId]);

  // --------------------------------------------------
  // Teacher: create class
  // --------------------------------------------------
  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || role !== "teacher") return;
    if (!newClassName.trim()) {
      setCreateError("Please enter a class name.");
      return;
    }

    setCreatingClass(true);
    setCreateError(null);
    try {
      // 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      const ref = await addDoc(collection(db, "classes"), {
        className: newClassName.trim(),
        description: newClassDescription.trim(),
        teacherId: user.uid,
        classCode: code,
        createdAt: serverTimestamp(),
      });

      // Mark in teacher's subcollection
      await setDoc(
        doc(db, "users", user.uid, "classesCreated", ref.id),
        {
          classId: ref.id,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setNewClassName("");
      setNewClassDescription("");

      // Reload classes
      await loadTeacherClasses(user.uid);
      setSelectedClassId(ref.id);
    } catch (err) {
      console.error("Failed to create class", err);
      setCreateError("Failed to create class. Please try again.");
    } finally {
      setCreatingClass(false);
    }
  };

  // --------------------------------------------------
  // Student: join class
  // --------------------------------------------------
  const handleJoinClass = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || role !== "student") return;
    if (!joinCode.trim()) {
      setJoinError("Please enter a class code.");
      return;
    }

    setJoining(true);
    setJoinError(null);
    setJoinSuccess(null);

    try {
      const code = joinCode.trim();
      const qClass = query(
        collection(db, "classes"),
        where("classCode", "==", code),
        limit(1)
      );
      const snap = await getDocs(qClass);

      if (snap.empty) {
        setJoinError("No class found with that code.");
        setJoining(false);
        return;
      }

      const classDoc = snap.docs[0];
      const classId = classDoc.id;
      const classData = classDoc.data() as any;

      // Add to student's joined subcollection
      await setDoc(
        doc(db, "users", user.uid, "classesJoined", classId),
        {
          classId,
          joinedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // Add to class students subcollection
      await setDoc(
        doc(db, "classes", classId, "students", user.uid),
        {
          name: (classData.studentName || "") ?? "",
          email: user.email ?? "",
          joinedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setJoinSuccess(
        `Joined class "${classData.className || "Untitled class"}".`
      );
      setJoinCode("");

      // Reload classes
      await loadStudentClasses(user.uid);
      setSelectedClassId(classId);
    } catch (err) {
      console.error("Failed to join class", err);
      setJoinError("Failed to join class. Please try again.");
    } finally {
      setJoining(false);
    }
  };

  // --------------------------------------------------
  // Teacher: post announcement
  // --------------------------------------------------
  const handlePostAnnouncement = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || role !== "teacher" || !selectedClassId) return;
    if (!newAnnouncement.trim()) return;

    setPostingAnnouncement(true);
    try {
      const text = newAnnouncement.trim();
      await addDoc(
        collection(db, "classes", selectedClassId, "announcements"),
        {
          text,
          createdAt: serverTimestamp(),
          authorId: user.uid,
          authorName: user.email ?? "Teacher",
        }
      );
      setNewAnnouncement("");

      // reload announcements quickly
      const annQ = query(
        collection(db, "classes", selectedClassId, "announcements"),
        orderBy("createdAt", "desc")
      );
      const annSnap = await getDocs(annQ);
      const annList: Announcement[] = [];
      annSnap.forEach((a) => {
        const d = a.data() as any;
        annList.push({
          id: a.id,
          text: d.text || "",
          authorName: d.authorName || "",
          createdAt: d.createdAt?.toDate?.() || null,
        });
      });
      setAnnouncements(annList);
    } catch (err) {
      console.error("Failed to post announcement", err);
    } finally {
      setPostingAnnouncement(false);
    }
  };

  // --------------------------------------------------
  // Teacher: add material
  // --------------------------------------------------
  const handleAddMaterial = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || role !== "teacher" || !selectedClassId) return;
    if (!newMaterialTitle.trim() || !newMaterialUrl.trim()) return;

    setPostingMaterial(true);
    try {
      const title = newMaterialTitle.trim();
      const url = newMaterialUrl.trim();

      await addDoc(collection(db, "classes", selectedClassId, "materials"), {
        title,
        url,
        createdAt: serverTimestamp(),
      });

      setNewMaterialTitle("");
      setNewMaterialUrl("");

      const matQ = query(
        collection(db, "classes", selectedClassId, "materials"),
        orderBy("createdAt", "desc")
      );
      const matSnap = await getDocs(matQ);
      const matList: Material[] = [];
      matSnap.forEach((m) => {
        const d = m.data() as any;
        matList.push({
          id: m.id,
          title: d.title || "",
          url: d.url || "",
          createdAt: d.createdAt?.toDate?.() || null,
        });
      });
      setMaterials(matList);
    } catch (err) {
      console.error("Failed to add material", err);
    } finally {
      setPostingMaterial(false);
    }
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  if (!user) {
    // route should already be protected, but just in case
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
        <p className="text-lg font-medium">
          Please{" "}
          <Link to="/login" className="text-indigo-600 underline">
            log in
          </Link>{" "}
          to access Classroom.
        </p>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="h-10 w-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-indigo-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 text-center space-y-3">
          <h1 className="text-xl font-semibold">Role not set</h1>
          <p className="text-sm text-slate-600">
            We couldn&apos;t find whether you are a student or a teacher.
            Please sign up again or contact support.
          </p>
          <Link
            to="/register"
            className="inline-block rounded-full bg-indigo-600 text-white text-sm px-4 py-2 mt-1"
          >
            Go to Sign up
          </Link>
        </div>
      </div>
    );
  }

  const isStudent = role === "student";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-1">Classroom</h1>
        <p className="text-slate-600 mb-6">
          You are logged in as a{" "}
          <span className="font-semibold">
            {isStudent ? "Student" : "Teacher"}
          </span>
          .
        </p>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
          {/* Left column: class list + create/join */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
              <h2 className="text-lg font-semibold mb-3">Your classes</h2>

              {classesLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                </div>
              ) : classes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {isStudent
                    ? "You haven’t joined any classes yet."
                    : "You haven’t created any classes yet."}
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {classes.map((cls) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`w-full text-left rounded-xl border px-3 py-2 text-sm transition ${
                        selectedClassId === cls.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <p className="font-medium truncate">
                            {cls.className}
                          </p>
                          {cls.description && (
                            <p className="text-xs text-slate-500 truncate">
                              {cls.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-700">
                          {cls.classCode}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create or Join form */}
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
              {isStudent ? (
                <>
                  <h2 className="text-lg font-semibold mb-3">Join a class</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Enter the 6-digit class code provided by your teacher.
                  </p>
                  <form onSubmit={handleJoinClass} className="space-y-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Class code (e.g. 482913)"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                    />
                    {joinError && (
                      <p className="text-xs text-red-600">{joinError}</p>
                    )}
                    {joinSuccess && (
                      <p className="text-xs text-emerald-600">
                        {joinSuccess}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={joining}
                      className="w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {joining ? "Joining..." : "Join class"}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-3">Create a class</h2>
                  <p className="text-sm text-slate-600 mb-4">
                    Create a new classroom and share the 6-digit code with your
                    students.
                  </p>
                  <form onSubmit={handleCreateClass} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Class name
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        value={newClassDescription}
                        onChange={(e) =>
                          setNewClassDescription(e.target.value)
                        }
                      />
                    </div>
                    {createError && (
                      <p className="text-xs text-red-600">{createError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={creatingClass}
                      className="w-full rounded-lg bg-indigo-600 text-white text-sm font-medium py-2.5 hover:bg-indigo-700 disabled:opacity-60"
                    >
                      {creatingClass ? "Creating..." : "Create class"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right column: selected class dashboard */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
            {detailsLoading ? (
              <div className="py-10 flex justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              </div>
            ) : !selectedClass ? (
              <div className="py-10 text-center text-sm text-slate-500">
                {classes.length === 0
                  ? isStudent
                    ? "Join a class using a class code to see it here."
                    : "Create your first class to see it here."
                  : "Select a class from the left to open its dashboard."}
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedClass.className}
                    </h2>
                    {selectedClass.description && (
                      <p className="text-sm text-slate-600">
                        {selectedClass.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-500">
                      Class code:{" "}
                      <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-full">
                        {selectedClass.classCode}
                      </span>
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                    {isStudent ? "Student view" : "Teacher view"}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  {/* Announcements */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">
                      Announcements
                    </h3>
                    {isStudent ? null : (
                      <form
                        onSubmit={handlePostAnnouncement}
                        className="space-y-2"
                      >
                        <textarea
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs resize-none"
                          rows={3}
                          placeholder="Share an announcement with your class..."
                          value={newAnnouncement}
                          onChange={(e) =>
                            setNewAnnouncement(e.target.value)
                          }
                        />
                        <button
                          type="submit"
                          disabled={postingAnnouncement}
                          className="rounded-full bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {postingAnnouncement
                            ? "Posting..."
                            : "Post announcement"}
                        </button>
                      </form>
                    )}

                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No announcements yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {announcements.map((a) => (
                          <div
                            key={a.id}
                            className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                          >
                            <p className="text-xs text-slate-800">
                              {a.text}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-500">
                              {a.authorName || "Teacher"}
                              {a.createdAt &&
                                ` • ${a.createdAt.toLocaleString()}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Materials */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Study materials</h3>

                    {isStudent ? null : (
                      <form
                        onSubmit={handleAddMaterial}
                        className="space-y-2"
                      >
                        <input
                          type="text"
                          placeholder="Title (e.g. Chapter 1 Notes)"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                          value={newMaterialTitle}
                          onChange={(e) =>
                            setNewMaterialTitle(e.target.value)
                          }
                        />
                        <input
                          type="url"
                          placeholder="Link to PDF / video / resource"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                          value={newMaterialUrl}
                          onChange={(e) =>
                            setNewMaterialUrl(e.target.value)
                          }
                        />
                        <button
                          type="submit"
                          disabled={postingMaterial}
                          className="rounded-full bg-indigo-600 text-white text-xs font-medium px-4 py-1.5 hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {postingMaterial
                            ? "Adding..."
                            : "Add material"}
                        </button>
                      </form>
                    )}

                    {materials.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        No materials added yet.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {materials.map((m) => (
                          <a
                            key={m.id}
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 hover:bg-slate-100 text-xs"
                          >
                            <p className="font-medium text-slate-800 truncate">
                              {m.title}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {m.url}
                            </p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Students list (mainly for teacher) */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">
                    Students in this class
                  </h3>
                  {students.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      No students have joined yet.
                    </p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto pr-1">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="text-left text-slate-500">
                            <th className="py-1 pr-2">Name</th>
                            <th className="py-1 pr-2">Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => (
                            <tr key={s.id} className="border-t border-slate-100">
                              <td className="py-1 pr-2">
                                {s.name || "Student"}
                              </td>
                              <td className="py-1 pr-2 text-slate-600">
                                {s.email || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
