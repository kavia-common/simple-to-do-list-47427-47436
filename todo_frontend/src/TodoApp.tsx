import React, { useCallback, useEffect, useMemo, useState } from "react";

// Theme: Ocean Professional
const COLORS = {
  primary: "#2563EB",
  secondary: "#F59E0B",
  success: "#F59E0B",
  error: "#EF4444",
  background: "#f9fafb",
  surface: "#ffffff",
  text: "#111827",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  shadow: "rgba(0, 0, 0, 0.08)",
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

const STORAGE_KEY = "todo_items_v1";

/**
 * Safe accessors to avoid no-undef in non-browser contexts and avoid referencing
 * DOM lib types which are not part of the TS config lib for this project.
 */
type LocalStorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type CryptoLike = {
  // Only need randomUUID if available
  randomUUID?: () => string;
};

const getLocalStorage = (): LocalStorageLike | null => {
  try {
    const g: any = typeof globalThis !== "undefined" ? (globalThis as any) : undefined;
    if (g && g.localStorage) {
      return g.localStorage as LocalStorageLike;
    }
  } catch {
    // ignore
  }
  return null;
};

const getCrypto = (): CryptoLike | null => {
  try {
    const g: any = typeof globalThis !== "undefined" ? (globalThis as any) : undefined;
    if (g && g.crypto) {
      return g.crypto as CryptoLike;
    }
  } catch {
    // ignore
  }
  return null;
};

// PUBLIC_INTERFACE
export const TodoApp: React.FC = () => {
  /** A modern, accessible To-Do list with:
   * - Add tasks via input + button or Enter key
   * - Toggle completion
   * - Delete tasks
   * - Persist to localStorage under key 'todo_items_v1'
   * - Keyboard: Enter to add; Escape to clear
   * - Ocean Professional styling
   */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const ls = getLocalStorage();
      const raw = ls?.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Task[];
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      const ls = getLocalStorage();
      ls?.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // ignore storage errors
    }
  }, [tasks]);

  const createId = useCallback(() => {
    const c = getCrypto();
    if (c && "randomUUID" in c && typeof (c as any).randomUUID === "function") {
      return (c as any).randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }, []);

  const addTask = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setTasks((prev) => [{ id: createId(), text, completed: false }, ...prev]);
    setInput("");
  }, [createId, input]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const remainingCount = useMemo(
    () => tasks.filter((t) => !t.completed).length,
    [tasks],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const evt: any = e as any;
      const key = evt?.key as string | undefined;
      if (key === "Enter") {
        e.preventDefault();
        addTask();
      } else if (key === "Escape") {
        setInput("");
      }
    },
    [addTask],
  );

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerGradient} />
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            To-Do
            <span style={styles.titleAccent}> List</span>
          </h1>
          <p style={styles.subtitle}>
            Stay organized. Track tasks. Ocean Professional theme.
          </p>
          <div style={styles.inputBar}>
            <input
              aria-label="Add a new task"
              placeholder="Add a new task..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              style={styles.input}
            />
            <button
              type="button"
              onClick={addTask}
              aria-label="Add task"
              style={{
                ...styles.addButton,
                ...(input.trim()
                  ? {}
                  : { opacity: 0.7, cursor: "not-allowed" as const }),
              }}
              disabled={!input.trim()}
            >
              Add
            </button>
          </div>
          <div style={styles.counterRow}>
            <span style={styles.counterText}>
              {remainingCount} remaining • {tasks.length} total
            </span>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          {tasks.length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon} aria-hidden>
                ✅
              </span>
              <p style={styles.emptyText}>
                You’re all caught up! Add your first task above.
              </p>
            </div>
          ) : (
            <ul style={styles.list} aria-live="polite">
              {tasks.map((task) => (
                <li key={task.id} style={styles.listItem}>
                  <label style={styles.itemLeft}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      aria-label={`Mark "${task.text}" as ${
                        task.completed ? "incomplete" : "complete"
                      }`}
                      style={styles.checkbox}
                    />
                    <span
                      style={{
                        ...styles.taskText,
                        ...(task.completed ? styles.taskTextCompleted : {}),
                      }}
                    >
                      {task.text}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete "${task.text}"`}
                    title="Delete"
                    style={styles.deleteButton}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-1 0v14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6h10Z"
                        stroke={COLORS.error}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer style={styles.footer}>
        <span style={styles.footerText}>
          Data persists locally via browser storage.
        </span>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    backgroundColor: COLORS.background,
    color: COLORS.text,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    position: "relative",
    padding: "40px 16px 24px",
    overflow: "hidden",
  },
  headerGradient: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(249,250,251,0.9))",
  },
  headerContent: {
    position: "relative",
    maxWidth: 800,
    margin: "0 auto",
  },
  title: {
    fontSize: 36,
    fontWeight: 800,
    margin: 0,
    color: COLORS.text,
    letterSpacing: 0.2,
  },
  titleAccent: {
    color: COLORS.primary,
    marginLeft: 6,
  },
  subtitle: {
    marginTop: 8,
    color: COLORS.textMuted,
    fontSize: 14,
  },
  inputBar: {
    marginTop: 20,
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    outline: "none",
    color: COLORS.text,
    boxShadow: `0 1px 2px ${COLORS.shadow}`,
    transition: "box-shadow 150ms, border-color 150ms",
  },
  addButton: {
    padding: "12px 16px",
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    boxShadow: `0 4px 10px rgba(37,99,235,0.25)`,
    cursor: "pointer",
    transition: "transform 120ms, box-shadow 120ms, opacity 120ms",
  },
  counterRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
  },
  counterText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  main: {
    flex: 1,
    padding: "16px",
  },
  card: {
    maxWidth: 800,
    margin: "0 auto",
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    boxShadow: `0 8px 24px ${COLORS.shadow}`,
    padding: 16,
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "10px 12px",
    transition: "box-shadow 150ms, transform 150ms",
    boxShadow: `0 1px 2px ${COLORS.shadow}`,
  },
  itemLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 6,
    accentColor: COLORS.primary,
    cursor: "pointer",
  } as React.CSSProperties,
  taskText: {
    fontSize: 14,
  },
  taskTextCompleted: {
    textDecoration: "line-through",
    color: COLORS.textMuted,
  },
  deleteButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: 8,
    padding: 6,
    transition: "background-color 120ms",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    color: COLORS.textMuted,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    margin: 0,
    fontSize: 14,
    textAlign: "center",
  },
  footer: {
    padding: "14px 16px 24px",
    textAlign: "center",
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
};
