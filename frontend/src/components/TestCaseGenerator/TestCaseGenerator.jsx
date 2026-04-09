import { useState, useRef, useEffect } from "react";
import styles from "../../assets/styles/TestCaseGenerator/TestCaseGenerator.module.css";
import {
  Zap,
  Copy,
  CheckCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  FlaskConical,
  ShieldAlert,
  Layers,
  TerminalSquare,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CATEGORY_META = {
  functional_tests: {
    label: "Functional",
    icon: Layers,
    accent: "blue",
  },
  edge_cases: {
    label: "Edge Cases",
    icon: FlaskConical,
    accent: "warning",
  },
  negative_cases: {
    label: "Negative",
    icon: ShieldAlert,
    accent: "error",
  },
};

function TestCard({ testCase, index, accent }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div
      className={`${styles["test-card"]} ${styles[`test-card--${accent}`]} ${expanded ? styles["test-card--expanded"] : ""}`}
    >
      <button
        className={styles["test-card__header"]}
        onClick={() => setExpanded((p) => !p)}
      >
        <div className={styles["test-card__header-left"]}>
          <span className={`${styles["test-card__id"]} ${styles[`test-card__id--${accent}`]}`}>
            {testCase.id || `TC-${String(index + 1).padStart(2, "0")}`}
          </span>
          <span className={styles["test-card__title"]}>{testCase.title}</span>
        </div>
        {expanded ? (
          <ChevronUp size={16} className={styles["test-card__chevron"]} />
        ) : (
          <ChevronDown size={16} className={styles["test-card__chevron"]} />
        )}
      </button>

      {expanded && (
        <div className={styles["test-card__body"]}>
          {testCase.preconditions && (
            <div className={styles["test-card__section"]}>
              <span className={styles["test-card__section-label"]}>Preconditions</span>
              <p className={styles["test-card__section-text"]}>{testCase.preconditions}</p>
            </div>
          )}
          {testCase.steps && testCase.steps.length > 0 && (
            <div className={styles["test-card__section"]}>
              <span className={styles["test-card__section-label"]}>Steps</span>
              <ol className={styles["test-card__steps"]}>
                {testCase.steps.map((step, i) => (
                  <li key={i} className={styles["test-card__step"]}>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {testCase.expected_result && (
            <div className={styles["test-card__section"]}>
              <span className={styles["test-card__section-label"]}>Expected Result</span>
              <p className={`${styles["test-card__section-text"]} ${styles["test-card__expected"]}`}>
                {testCase.expected_result}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ categoryKey, tests }) {
  const meta = CATEGORY_META[categoryKey];
  const Icon = meta.icon;

  return (
    <div className={styles["category-section"]}>
      <div className={styles["category-section__header"]}>
        <div className={`${styles["category-section__icon-wrap"]} ${styles[`category-section__icon-wrap--${meta.accent}`]}`}>
          <Icon size={16} />
        </div>
        <h3 className={styles["category-section__title"]}>{meta.label}</h3>
        <span className={`${styles["category-section__count"]} ${styles[`category-section__count--${meta.accent}`]}`}>
          {tests.length}
        </span>
      </div>
      <div className={styles["category-section__cards"]}>
        {tests.map((tc, i) => (
          <TestCard key={tc.id || i} testCase={tc} index={i} accent={meta.accent} />
        ))}
      </div>
    </div>
  );
}

export default function TestCaseGenerator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError("Please enter a feature description before generating test cases.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/testcase/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureDescription: input }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
      }

      setResult(data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // noop
    }
  };

  const totalCount = result
    ? (result.functional_tests?.length || 0) +
      (result.edge_cases?.length || 0) +
      (result.negative_cases?.length || 0)
    : 0;

  return (
    <div className={styles["page"]}>
      <div className={styles["page__inner"]}>
        <div className={styles["page-header"]}>
          <div className={styles["page-header__eyebrow"]}>
            <TerminalSquare size={14} />
            <span>Test Case Generator</span>
          </div>
          <h1 className={styles["page-header__title"]}>
            Generate Test Cases
            <span className={styles["page-header__title-accent"]}> from a Description</span>
          </h1>
          <p className={styles["page-header__subtitle"]}>
            Describe a feature or requirement. TestPilot AI returns structured functional,
            edge, and negative test cases — ready to analyze or export.
          </p>
        </div>

        <div className={styles["generator-card"]}>
          <div className={styles["generator-card__label-row"]}>
            <label className={styles["generator-card__label"]} htmlFor="feature-input">
              Feature Description
            </label>
            <span
              className={`${styles["generator-card__char-count"]} ${charCount > 800 ? styles["generator-card__char-count--warn"] : ""}`}
            >
              {charCount} chars
            </span>
          </div>

          <div
            className={`${styles["textarea-wrap"]} ${error && !input.trim() ? styles["textarea-wrap--error"] : ""}`}
          >
            <textarea
              id="feature-input"
              ref={textareaRef}
              className={styles["generator-card__textarea"]}
              placeholder="e.g. User login with email and password. The system must validate credentials, lock the account after 5 failed attempts, and support a 'Remember Me' option that persists the session for 30 days."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (error) setError(null);
              }}
              rows={7}
              disabled={loading}
            />
            <div className={styles["textarea-wrap__glow"]} />
          </div>

          {error && (
            <div className={styles["error-banner"]}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles["generator-card__footer"]}>
            <p className={styles["generator-card__hint"]}>
              For best results, include flows, constraints, and edge scenarios in your description.
            </p>
            <button
              className={`${styles["btn-primary"]} ${loading ? styles["btn-primary--loading"] : ""}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className={styles["btn-primary__spinner"]} />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Generate Test Cases</span>
                </>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles["loading-state"]}>
            <div className={styles["loading-state__bar"]} />
            <p className={styles["loading-state__text"]}>
              Analyzing your description and generating structured test cases…
            </p>
          </div>
        )}

        {result && (
          <div className={styles["results"]} ref={resultsRef}>
            <div className={styles["results__header"]}>
              <div className={styles["results__meta"]}>
                <h2 className={styles["results__title"]}>Generated Test Cases</h2>
                <span className={styles["results__total-badge"]}>{totalCount} total</span>
              </div>
              <button
                className={`${styles["btn-secondary"]} ${copied ? styles["btn-secondary--copied"] : ""}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCheck size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <div className={styles["results__grid"]}>
              {Object.entries(CATEGORY_META).map(([key]) =>
                result[key] && result[key].length > 0 ? (
                  <CategorySection key={key} categoryKey={key} tests={result[key]} />
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}