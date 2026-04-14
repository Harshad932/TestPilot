import { useState, useRef } from "react";
import styles from "../../assets/styles/DocTestGenerator/DocTestGenerator.module.css";
import {
  Upload,
  FileText,
  File,
  X,
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
  BookOpen,
  Tag,
  Search,
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

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXT = [".pdf", ".txt"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

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

function FileDropZone({ file, onFile, onClear, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e) => {
    const selected = e.target.files[0];
    if (selected) onFile(selected);
    e.target.value = "";
  };

  const isPDF = file?.type === "application/pdf";

  return (
    <div
      className={`${styles["dropzone"]} ${dragging ? styles["dropzone--dragging"] : ""} ${file ? styles["dropzone--has-file"] : ""} ${disabled ? styles["dropzone--disabled"] : ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && !file && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className={styles["dropzone__input"]}
        onChange={handleInputChange}
        disabled={disabled}
      />

      {file ? (
        <div className={styles["dropzone__file-info"]}>
          <div className={styles["dropzone__file-icon-wrap"]}>
            {isPDF ? (
              <File size={22} className={styles["dropzone__file-icon--pdf"]} />
            ) : (
              <FileText size={22} className={styles["dropzone__file-icon--txt"]} />
            )}
          </div>
          <div className={styles["dropzone__file-meta"]}>
            <span className={styles["dropzone__file-name"]}>{file.name}</span>
            <span className={styles["dropzone__file-size"]}>
              {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp;
              <span className={`${styles["dropzone__file-type"]} ${isPDF ? styles["dropzone__file-type--pdf"] : styles["dropzone__file-type--txt"]}`}>
                {isPDF ? "PDF" : "TXT"}
              </span>
            </span>
          </div>
          {!disabled && (
            <button
              className={styles["dropzone__clear-btn"]}
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              aria-label="Remove file"
            >
              <X size={15} />
            </button>
          )}
        </div>
      ) : (
        <div className={styles["dropzone__empty"]}>
          <div className={styles["dropzone__icon-wrap"]}>
            <Upload size={24} className={styles["dropzone__upload-icon"]} />
          </div>
          <p className={styles["dropzone__primary-text"]}>
            {dragging ? "Drop your file here" : "Drag & drop your document here"}
          </p>
          <p className={styles["dropzone__secondary-text"]}>
            or <span className={styles["dropzone__browse-link"]}>browse files</span>
            &nbsp;— PDF or TXT, max {MAX_SIZE_MB} MB
          </p>
        </div>
      )}
    </div>
  );
}

export default function DocTestGenerator() {
  const [file, setFile] = useState(null);
  const [focusQuery, setFocusQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [sourceFilename, setSourceFilename] = useState("");
  const resultsRef = useRef(null);

  const handleFile = (incoming) => {
    setError(null);
    setResult(null);

    if (!ACCEPTED_TYPES.includes(incoming.type) && !ACCEPTED_EXT.some((ext) => incoming.name.endsWith(ext))) {
      setError(`Unsupported file type. Please upload a PDF or TXT file.`);
      return;
    }
    if (incoming.size > MAX_SIZE_BYTES) {
      setError(`File is too large. Maximum allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    setFile(incoming);
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  const handleGenerate = async () => {
    if (!file) {
      setError("Please upload a PDF or TXT document before generating.");
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("document", file);
      if (focusQuery.trim()) {
        formData.append("focusQuery", focusQuery.trim());
      }

      const res = await fetch(`${BACKEND_URL}/api/doc/generate`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || `Server error: ${res.status}`);
      }

      setSourceFilename(file.name);
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
            <BookOpen size={14} />
            <span>Document-Based Generation</span>
          </div>
          <h1 className={styles["page-header__title"]}>
            Generate Tests
            <span className={styles["page-header__title-accent"]}> from a Document</span>
          </h1>
          <p className={styles["page-header__subtitle"]}>
            Upload a PDF or TXT requirements document. TestPilot AI uses RAG to extract
            relevant sections and generate grounded test cases directly from your spec.
          </p>
        </div>

        <div className={styles["upload-card"]}>
          <div className={styles["upload-card__section"]}>
            <span className={styles["upload-card__label"]}>
              Requirements Document
            </span>
            <FileDropZone
              file={file}
              onFile={handleFile}
              onClear={handleClear}
              disabled={loading}
            />
          </div>

          <div className={styles["upload-card__divider"]} />

          <div className={styles["upload-card__section"]}>
            <div className={styles["upload-card__label-row"]}>
              <label className={styles["upload-card__label"]} htmlFor="focus-input">
                Focus Area
              </label>
              <span className={styles["upload-card__optional"]}>optional</span>
            </div>
            <div className={`${styles["focus-input-wrap"]} ${loading ? styles["focus-input-wrap--disabled"] : ""}`}>
              <Search size={14} className={styles["focus-input-wrap__icon"]} />
              <input
                id="focus-input"
                type="text"
                className={styles["focus-input"]}
                placeholder="e.g. authentication flow, checkout process, user permissions…"
                value={focusQuery}
                onChange={(e) => setFocusQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            <p className={styles["upload-card__hint"]}>
              Narrow the retrieval to a specific part of the document for more targeted test cases.
            </p>
          </div>

          {error && (
            <div className={styles["error-banner"]}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles["upload-card__footer"]}>
            <div className={styles["upload-card__footer-badges"]}>
              <span className={styles["format-badge"]}>
                <File size={11} />
                PDF
              </span>
              <span className={styles["format-badge"]}>
                <FileText size={11} />
                TXT
              </span>
              <span className={styles["format-badge--muted"]}>Max {MAX_SIZE_MB} MB</span>
            </div>
            <button
              className={`${styles["btn-primary"]} ${loading ? styles["btn-primary--loading"] : ""}`}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className={styles["btn-primary__spinner"]} />
                  <span>Processing…</span>
                </>
              ) : (
                <>
                  <Zap size={16} />
                  <span>Upload &amp; Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles["loading-state"]}>
            <div className={styles["loading-state__bar"]} />
            <p className={styles["loading-state__text"]}>
              Extracting document content, retrieving relevant chunks, and generating grounded test cases…
            </p>
          </div>
        )}

        {result && (
          <div className={styles["results"]} ref={resultsRef}>
            <div className={styles["results__header"]}>
              <div className={styles["results__meta"]}>
                <h2 className={styles["results__title"]}>Generated Test Cases</h2>
                <span className={styles["results__total-badge"]}>{totalCount} total</span>
                {sourceFilename && (
                  <span className={styles["results__source-tag"]}>
                    <Tag size={11} />
                    Grounded on: {sourceFilename}
                  </span>
                )}
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