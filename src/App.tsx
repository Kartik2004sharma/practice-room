import { useEffect, useRef, useState, type Ref } from "react";
import {
  Feedback,
  Profile,
  Question,
  Session,
  Sessions,
  Status,
  DEFAULT_MODEL,
  type Entry,
} from "../shared/contracts.js";
const storageKey = "practice-room:sessions:v1";
function readSessions(): Session[] {
  try {
    const parsed = Sessions.safeParse(
      JSON.parse(localStorage.getItem(storageKey) || "[]"),
    );
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
const defaultProfile: Profile = {
  role: "Junior software engineer",
  job: "",
  type: "mixed",
};
const tips: Record<string, string> = {
  projects: "Walk through your own contribution. What did you try, and why?",
  fundamentals: "Explain the idea simply, then add an example you understand.",
  "problem-solving":
    "Think aloud. Clarify the problem before jumping to a solution.",
  teamwork:
    "Use a real moment: the situation, your action, and what you learned.",
  communication: "Take a breath. A clear, honest answer is enough to begin.",
};
function FeedbackView({
  value,
  headingRef,
}: {
  value: Feedback;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <section className="feedback" aria-label="Answer feedback">
      <div className="section-head">
        <h2 ref={headingRef} tabIndex={-1} className="eyebrow feedback-title">
          Your coaching notes
        </h2>
        <span className="small muted">A direction, not a verdict</span>
      </div>
      <blockquote>
        “{value.evidence}”<cite>From your answer</cite>
      </blockquote>
      <div className="notes">
        <div>
          <span className="note-label">01 / Keep doing</span>
          <h3>A strength to build on</h3>
          <p>{value.strength}</p>
        </div>
        <div>
          <span className="note-label">02 / Try next</span>
          <h3>Make it more concrete</h3>
          <p>{value.improvement}</p>
          <p className="suggestion">{value.suggestion}</p>
        </div>
      </div>
      {value.structure && (
        <p className="structure">
          <strong>Possible structure:</strong> {value.structure}
        </p>
      )}
      <div className="rubric">
        <p className="small">
          <strong>Coaching aids · 1–5</strong>
          <br />
          For this answer only. These do not measure employability.
        </p>
        <dl>
          {Object.entries(value.rubric).map(([key, n]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>
                {n}
                <span> / 5</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
export function App() {
  const [status, setStatus] = useState<Status | null>(null),
    [profile, setProfile] = useState<Profile>(defaultProfile),
    [timer, setTimer] = useState(false);
  const [view, setView] = useState<"setup" | "session" | "recap" | "library">(
    "setup",
  );
  const [question, setQuestion] = useState<Question | null>(null),
    [entries, setEntries] = useState<Entry[]>([]),
    [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null),
    [followMode, setFollowMode] = useState(false),
    [followAnswer, setFollowAnswer] = useState(""),
    [followFeedback, setFollowFeedback] = useState<Feedback | null>(null);
  const [saved, setSaved] = useState<Session[]>(readSessions),
    [recap, setRecap] = useState<Session | null>(null);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [seconds, setSeconds] = useState(0),
    [slow, setSlow] = useState(false);
  const controller = useRef<AbortController | null>(null),
    retry = useRef<(() => void) | null>(null),
    heading = useRef<HTMLHeadingElement | null>(null),
    feedbackHeading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    void checkStatus();
    return () => controller.current?.abort();
  }, []);
  useEffect(() => {
    if (view === "session" && (followFeedback || (feedback && !followMode)))
      feedbackHeading.current?.focus();
    else if (view !== "setup") heading.current?.focus();
  }, [view, question, followMode, feedback, followFeedback]);
  useEffect(() => {
    if (
      !timer ||
      view !== "session" ||
      (feedback && !followMode) ||
      followFeedback
    )
      return;
    const id = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [timer, view, feedback, followMode, followFeedback]);
  useEffect(() => {
    if (!busy) {
      setSlow(false);
      return;
    }
    const id = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(id);
  }, [busy]);
  async function checkStatus() {
    try {
      const res = await fetch("/api/status");
      setStatus(Status.parse(await res.json()));
    } catch {
      setStatus({
        available: false,
        model: DEFAULT_MODEL,
        testOnly: false,
        message:
          "Cannot reach the local app server. Restart Practice Room and check again.",
      });
    }
  }
  async function run<T>(
    label: string,
    path: string,
    body: unknown,
    parse: (v: unknown) => T,
    done: (v: T) => void,
  ) {
    const c = new AbortController();
    controller.current = c;
    setBusy(label);
    setError("");
    setNotice("");
    retry.current = () => void run(label, path, body, parse, done);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: c.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Please retry.");
      if (!c.signal.aborted) {
        retry.current = null;
        done(parse(data));
      }
    } catch (e) {
      if (c.signal.aborted) {
        retry.current = null;
        setNotice("Cancelled. Your draft is still here.");
      } else
        setError(
          e instanceof Error
            ? e.message
            : "The coach could not finish. Please retry.",
        );
    } finally {
      if (controller.current === c) {
        setBusy("");
        controller.current = null;
      }
    }
  }
  function ask(index: number, previous: Entry[]) {
    void run(
      "Preparing your question",
      "/api/question",
      { profile, index, previous: previous.map((e) => e.question.question) },
      (v) => Question.parse(v),
      (q) => {
        setEntries(previous);
        setQuestion(q);
        setAnswer("");
        setFeedback(null);
        setFollowMode(false);
        setFollowAnswer("");
        setFollowFeedback(null);
        setSeconds(0);
        setView("session");
      },
    );
  }
  function submit() {
    const text = followMode ? followAnswer : answer;
    if (text.trim().length < 10) {
      setError(
        "Add at least 10 characters so the coach has something to work with.",
      );
      retry.current = null;
      return;
    }
    void run(
      "Reading your answer",
      "/api/feedback",
      {
        profile,
        question: followMode ? feedback!.followUp : question!.question,
        answer: text.trim(),
        followUp: followMode,
      },
      (v) => Feedback.parse(v),
      (f) => {
        if (followMode) setFollowFeedback(f);
        else setFeedback(f);
      },
    );
  }
  function currentEntry(skipped = false): Entry {
    return {
      question: question!,
      answer,
      feedback,
      skipped,
      ...(followAnswer ? { followUpAnswer: followAnswer } : {}),
      ...(followFeedback ? { followUpFeedback: followFeedback } : {}),
    };
  }
  function finish(list: Entry[], early: boolean) {
    retry.current = null;
    const s: Session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      profile,
      entries: list,
      endedEarly: early,
      model: status!.model,
    };
    const listSaved = [s, ...saved].slice(0, 30);
    setSaved(listSaved);
    setRecap(s);
    setView("recap");
    setError("");
    setNotice("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(listSaved));
    } catch {
      setError(
        "Browser storage is unavailable or full. This recap is visible now but could not be saved.",
      );
    }
  }
  function advance(skip = false) {
    const list = [...entries, currentEntry(skip)];
    if (list.length === 5) finish(list, false);
    else ask(list.length, list);
  }
  function end() {
    finish(question ? [...entries, currentEntry(!feedback)] : entries, true);
  }
  function deleteData() {
    try {
      localStorage.removeItem(storageKey);
      setSaved([]);
      setRecap(null);
      setEntries([]);
      setAnswer("");
      setFollowAnswer("");
      setQuestion(null);
      setFeedback(null);
      setFollowFeedback(null);
      setProfile(defaultProfile);
      setView("setup");
      setNotice("Practice data deleted from this browser.");
      setError("");
    } catch {
      setError(
        "Browser storage could not be cleared. Use your browser’s site-data controls.",
      );
    }
  }
  const answered = recap?.entries.filter((e) => e.feedback) || [];
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to practice
      </a>
      <header>
        <button
          className="brand"
          onClick={() => {
            if (view !== "session") setView("setup");
          }}
          aria-label="Practice Room home"
          disabled={view === "session"}
        >
          <span className="brand-mark" aria-hidden="true">
            pr<span>↗</span>
          </span>
          <span>
            practice room
            <span className="brand-sub">YOUR PRIVATE INTERVIEW STUDIO</span>
          </span>
        </button>
        <div className="header-actions">
          <span
            className={`connection ${status?.available ? "ready" : ""}`}
            role="status"
          >
            <span aria-hidden="true" className="dot" />
            {status
              ? status.available
                ? "Local coach ready"
                : "Local coach offline"
              : "Checking local coach"}
          </span>
          <button
            className="text-button"
            disabled={!!busy || view === "session"}
            onClick={() => {
              setError("");
              setNotice("");
              setView("library");
            }}
          >
            Saved practice <span className="count">{saved.length}</span>
          </button>
        </div>
      </header>
      {status?.testOnly && (
        <div className="test-banner">
          TEST ADAPTER · Synthetic test output. This is not real Gemma coaching.
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <div className="studio-grid">
          <aside className="rail">
            <span className="eyebrow">
              A LITTLE PRACTICE.
              <br />A CLEARER YOU.
            </span>
            <div className="rail-rule" />
            <p>
              Room to think.
              <br />
              Space to try again.
            </p>
            <span className="rail-bottom">
              NO AUDIENCE.
              <br />
              NO PRESSURE.
            </span>
          </aside>
          <div className="workspace">
            <div className="messages">
              <p role="status" className={notice ? "notice" : ""}>
                {notice}
              </p>
              {error && (
                <div role="alert" className="error">
                  {error}
                  {retry.current && !busy && (
                    <button
                      className="text-button"
                      onClick={() => retry.current?.()}
                    >
                      Retry request ↗
                    </button>
                  )}
                </div>
              )}
              {busy && (
                <div role="status" className="loading">
                  <span className="spinner" aria-hidden="true" />
                  {busy}…{" "}
                  {slow && (
                    <span>
                      Local models can take a moment. Your draft is kept here.
                    </span>
                  )}
                  <button
                    className="text-button"
                    onClick={() => controller.current?.abort()}
                  >
                    Cancel request
                  </button>
                </div>
              )}
            </div>
            {view === "setup" && (
              <>
                <div className="intro">
                  <span className="eyebrow">PRACTICE, AT YOUR PACE</span>
                  <h1 ref={heading} tabIndex={-1}>
                    Your next interview.
                    <br />
                    <em>A little less daunting.</em>
                  </h1>
                  <p>
                    A quiet place to find your words. Practice five questions,
                    get thoughtful feedback, and try again with a clearer idea
                    of what to say.
                  </p>
                </div>
                <div className="setup-grid">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      retry.current = null;
                      const p = Profile.safeParse(profile);
                      if (!p.success) {
                        setError(
                          "Enter a target role of 3–120 characters. Job descriptions can contain up to 6,000 characters.",
                        );
                        return;
                      }
                      setProfile(p.data);
                      ask(0, []);
                    }}
                  >
                    <div className="section-head">
                      <h2>Set the scene</h2>
                      <span className="small muted">01 / YOUR PRACTICE</span>
                    </div>
                    <label htmlFor="role">
                      What role are you preparing for?
                    </label>
                    <input
                      id="role"
                      value={profile.role}
                      required
                      minLength={3}
                      maxLength={120}
                      disabled={!!busy}
                      onChange={(e) => {
                        retry.current = null;
                        setError("");
                        setProfile({ ...profile, role: e.target.value });
                      }}
                    />
                    <label htmlFor="job">
                      Job description <span className="optional">optional</span>
                    </label>
                    <textarea
                      id="job"
                      rows={4}
                      maxLength={6000}
                      value={profile.job}
                      disabled={!!busy}
                      placeholder="Paste the role’s responsibilities to make your questions more relevant."
                      onChange={(e) => {
                        retry.current = null;
                        setError("");
                        setProfile({ ...profile, job: e.target.value });
                      }}
                    />
                    <span className="input-note">
                      Only include information you want to use in practice.{" "}
                      {profile.job.length.toLocaleString()} / 6,000
                    </span>
                    <fieldset disabled={!!busy}>
                      <legend>Choose your interview</legend>
                      <div className="type-options">
                        {(["mixed", "behavioral", "technical"] as const).map(
                          (t) => (
                            <label
                              key={t}
                              className={profile.type === t ? "selected" : ""}
                            >
                              <input
                                type="radio"
                                name="type"
                                value={t}
                                checked={profile.type === t}
                                onChange={() => {
                                  retry.current = null;
                                  setError("");
                                  setProfile({ ...profile, type: t });
                                }}
                              />
                              <strong>
                                {t === "mixed"
                                  ? "A bit of both"
                                  : t === "behavioral"
                                    ? "Behavioral"
                                    : "Role-specific"}
                              </strong>
                              <span>
                                {t === "mixed"
                                  ? "Projects + people"
                                  : t === "behavioral"
                                    ? "Stories + teamwork"
                                    : "Thinking + fundamentals"}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </fieldset>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={timer}
                        onChange={(e) => setTimer(e.target.checked)}
                        disabled={!!busy}
                      />
                      Optional answer timer{" "}
                      <span className="optional">no time limit</span>
                    </label>
                    <button
                      className="primary full"
                      disabled={!!busy || !status?.available}
                      type="submit"
                    >
                      Enter the practice room <span aria-hidden="true">↗</span>
                    </button>
                    <p className="small muted">
                      Five questions. One at a time. Skip or stop whenever you
                      need.
                    </p>
                  </form>
                  <section className="setup-notes">
                    <span className="eyebrow">JUST YOU & YOUR LOCAL COACH</span>
                    <h2>
                      Keep your practice
                      <br />
                      personal.
                    </h2>
                    <p>
                      Questions and feedback run on this device using Gemma.
                      Your job description and answers stay here.
                    </p>
                    <div className="model-box">
                      <span className="small muted">LOCAL MODEL</span>
                      <strong>{status?.model || DEFAULT_MODEL}</strong>
                      <p role="status">
                        {status?.message || "Checking your local runtime…"}
                      </p>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => void checkStatus()}
                        disabled={!!busy}
                      >
                        Check connection ↻
                      </button>
                    </div>
                    {!status?.available && (
                      <details open>
                        <summary>Start your local coach</summary>
                        <p>Start Ollama, then install Gemma in a terminal:</p>
                        <code>
                          ollama pull{" "}
                          {status?.testOnly
                            ? DEFAULT_MODEL
                            : status?.model || DEFAULT_MODEL}
                        </code>
                        <p>
                          Using the bundled setup? Follow the README’s
                          project-local runtime instructions.
                        </p>
                      </details>
                    )}
                    <ol className="expectations">
                      <li>
                        <span>01</span>
                        <div>
                          <strong>Think out loud</strong>
                          <p>Your own words, not a perfect script.</p>
                        </div>
                      </li>
                      <li>
                        <span>02</span>
                        <div>
                          <strong>Find one thing to improve</strong>
                          <p>Specific notes grounded in your answer.</p>
                        </div>
                      </li>
                      <li>
                        <span>03</span>
                        <div>
                          <strong>Leave with a next step</strong>
                          <p>A small, practical focus for next time.</p>
                        </div>
                      </li>
                    </ol>
                    <p className="small privacy">
                      Finished sessions are saved in this browser, including
                      your role, job description, answers and feedback. Delete
                      them below. Drafts are not saved after a refresh. No
                      account or analytics.
                    </p>
                  </section>
                </div>
              </>
            )}
            {view === "session" && question && (
              <>
                <div className="session-top">
                  <span className="eyebrow">
                    {profile.role} · {profile.type}
                  </span>
                  <button
                    className="text-button"
                    onClick={end}
                    disabled={!!busy}
                  >
                    End session
                  </button>
                </div>
                <div className="progress-line">
                  <span>
                    Question {entries.length + 1} of 5
                    {followMode ? " · Follow-up" : ""}
                  </span>
                  <div className="progress-dots" aria-hidden="true">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={i <= entries.length ? "filled" : ""}
                      />
                    ))}
                  </div>
                </div>
                <section className="question-cue">
                  <span className="question-number" aria-hidden="true">
                    {String(entries.length + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <span className="eyebrow">
                      {followMode
                        ? "LET’S GO A LITTLE DEEPER"
                        : question.focus.replace("-", " ")}
                    </span>
                    <h1 ref={heading} tabIndex={-1}>
                      {followMode ? feedback?.followUp : question.question}
                    </h1>
                    <p className="muted">{tips[question.focus]}</p>
                  </div>
                </section>
                {!feedback || (followMode && !followFeedback) ? (
                  <form
                    className="answer-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submit();
                    }}
                  >
                    <div className="section-head">
                      <label htmlFor="answer">
                        {followMode ? "Your follow-up answer" : "Your answer"}
                      </label>
                      {timer && (
                        <span
                          className="timer"
                          aria-label="Elapsed answer time"
                        >
                          {Math.floor(seconds / 60)}:
                          {String(seconds % 60).padStart(2, "0")} elapsed · no
                          limit
                        </span>
                      )}
                    </div>
                    <textarea
                      id="answer"
                      rows={8}
                      required
                      minLength={10}
                      maxLength={4000}
                      value={followMode ? followAnswer : answer}
                      onChange={(e) => {
                        retry.current = null;
                        setError("");
                        if (followMode) setFollowAnswer(e.target.value);
                        else setAnswer(e.target.value);
                      }}
                      disabled={!!busy}
                      placeholder="Start with what you know. You can edit your answer before asking for feedback."
                    />
                    <div className="answer-foot">
                      <span className="small muted">
                        {(followMode ? followAnswer : answer).length} / 4,000 ·
                        at least 10 characters
                      </span>
                      <label className="checkbox small">
                        <input
                          type="checkbox"
                          checked={timer}
                          onChange={(e) => setTimer(e.target.checked)}
                        />
                        Answer timer
                      </label>
                    </div>
                    <div className="actions">
                      <button className="primary" disabled={!!busy}>
                        Get coaching notes <span aria-hidden="true">↗</span>
                      </button>
                      {!followMode && (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => advance(true)}
                          disabled={!!busy}
                        >
                          Skip question
                        </button>
                      )}
                      {followMode && (
                        <button
                          type="button"
                          className="secondary"
                          onClick={() => {
                            retry.current = null;
                            setFollowMode(false);
                            setSeconds(0);
                            setError("");
                          }}
                          disabled={!!busy}
                        >
                          Back to feedback
                        </button>
                      )}
                    </div>
                    <p className="small muted">
                      Pause, edit, think again. Feedback appears only when you
                      submit.
                    </p>
                  </form>
                ) : (
                  <>
                    <FeedbackView
                      value={followFeedback || feedback!}
                      headingRef={feedbackHeading}
                    />
                    <div className="actions">
                      <button
                        className="primary"
                        onClick={() => advance()}
                        disabled={!!busy}
                      >
                        {entries.length === 4
                          ? "Finish & see recap"
                          : "Next question"}{" "}
                        <span aria-hidden="true">↗</span>
                      </button>
                      {feedback?.followUp && !followFeedback && (
                        <button
                          className="secondary"
                          onClick={() => {
                            setFollowMode(true);
                            setSeconds(0);
                            setError("");
                          }}
                          disabled={!!busy}
                        >
                          Practice a follow-up
                        </button>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
            {view === "recap" && recap && (
              <>
                <span className="eyebrow">
                  YOUR SESSION RECAP ·{" "}
                  {recap.endedEarly ? "ENDED EARLY" : "COMPLETE"}
                </span>
                <h1 ref={heading} tabIndex={-1}>
                  Practice done.
                  <br />
                  <em>Progress to take with you.</em>
                </h1>
                <p className="intro-copy">
                  {recap.profile.role} · {answered.length} answered,{" "}
                  {recap.entries.filter((e) => e.skipped).length} skipped ·{" "}
                  {recap.model}
                </p>
                <section className="recap-focus">
                  <span className="eyebrow">TAKE INTO YOUR NEXT PRACTICE</span>
                  <h2>
                    {answered.length
                      ? "One small step at a time."
                      : "Showing up is a start."}
                  </h2>
                  {answered.length ? (
                    <ul>
                      {answered.slice(0, 3).map((e, i) => (
                        <li key={i}>{e.feedback!.suggestion}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      Try answering one question in your own words next time.
                      There is no time limit.
                    </p>
                  )}
                  <p className="small muted">
                    These notes reflect this session’s answers, not your chances
                    of getting hired.
                  </p>
                </section>
                <div className="review-list">
                  {recap.entries.map((e, i) => (
                    <details key={i}>
                      <summary>
                        <span className="small">
                          {String(i + 1).padStart(2, "0")} /{" "}
                          {e.skipped ? "Skipped" : "Answered"}
                        </span>
                        <strong>{e.question.question}</strong>
                        <span aria-hidden="true">+</span>
                      </summary>
                      <p className="answer-review">
                        {e.answer || "No answer submitted."}
                      </p>
                      {e.feedback && <FeedbackView value={e.feedback} />}{" "}
                      {e.followUpAnswer && (
                        <>
                          <h3>Follow-up: {e.feedback?.followUp}</h3>
                          <p className="answer-review">{e.followUpAnswer}</p>
                          {e.followUpFeedback && (
                            <FeedbackView value={e.followUpFeedback} />
                          )}
                        </>
                      )}
                    </details>
                  ))}
                </div>
                <div className="actions">
                  <button
                    className="primary"
                    onClick={() => {
                      setView("setup");
                      setEntries([]);
                      setQuestion(null);
                      setError("");
                      setNotice("");
                    }}
                  >
                    Practice again ↗
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setView("library")}
                  >
                    Review saved sessions
                  </button>
                </div>
              </>
            )}
            {view === "library" && (
              <>
                <span className="eyebrow">KEPT ON THIS DEVICE</span>
                <h1 ref={heading} tabIndex={-1}>
                  Your practice
                  <br />
                  <em>over time.</em>
                </h1>
                <p>
                  Up to 30 completed or ended sessions are saved in this
                  browser. No account, no remote database.
                </p>
                {!saved.length ? (
                  <div className="empty">
                    <h2>A fresh notebook.</h2>
                    <p>
                      Your sessions will appear here after you finish or end a
                      practice.
                    </p>
                  </div>
                ) : (
                  <div className="saved-list">
                    {saved.map((s) => (
                      <button
                        className="saved-session"
                        key={s.id}
                        onClick={() => {
                          setRecap(s);
                          setView("recap");
                        }}
                      >
                        <span>
                          {new Date(s.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <strong>{s.profile.role}</strong>
                        <span>
                          {s.entries.filter((e) => e.feedback).length} answered
                          · {s.endedEarly ? "Ended early" : "Complete"} ↗
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <button className="primary" onClick={() => setView("setup")}>
                  Start a practice ↗
                </button>
              </>
            )}
          </div>
        </div>
      </main>
      <footer>
        <span>Private by design. More confident with practice.</span>
        <div>
          <span className="small">Local storage · this browser only</span>
          <button
            className="text-button"
            onClick={deleteData}
            disabled={!!busy || view === "session"}
          >
            Delete practice data
          </button>
        </div>
      </footer>
    </div>
  );
}
