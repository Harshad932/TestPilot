import { useState, useEffect, useRef } from "react";
import { TestTube2, FileText, ShieldCheck, Menu, X, ChevronRight } from "lucide-react";
import styles from "../assets/styles/Home.module.css";

// Hook for scroll-triggered animations
function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, ...options }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  const [featuresRef, featuresVisible] = useIntersection();
  const [howItWorksRef, howItWorksVisible] = useIntersection();

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const featureCards = [
    {
      icon: <TestTube2 size={20} strokeWidth={1.5} />,
      title: "Test Case Generator",
      description:
        "Describe any feature and get structured functional, edge, and negative test cases instantly.",
      link: "/generator",
    },
    {
      icon: <FileText size={20} strokeWidth={1.5} />,
      title: "Document Generator",
      description:
        "Upload a PDF or TXT spec file. AI reads your document and generates requirement-grounded test cases.",
      link: "/upload-doc",
    },
    {
      icon: <ShieldCheck size={20} strokeWidth={1.5} />,
      title: "Coverage Analyzer",
      description:
        "Paste your test cases and receive a full QA review — coverage score, gaps, weak cases, and fixes.",
      link: "/analyzer",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Describe or Upload",
      description:
        "Enter a feature requirement or upload your spec document.",
    },
    {
      number: "02",
      title: "AI Generates",
      description:
        "AI processes your input and returns structured, categorized test cases.",
    },
    {
      number: "03",
      title: "Review & Improve",
      description:
        "Analyze coverage, spot gaps, and refine before shipping.",
    },
  ];

  return (
    <div className={styles["page"]}>
      {/* Navbar */}
      <nav
        className={`${styles["navbar"]} ${scrolled ? styles["navbar--scrolled"] : ""}`}
      >
        <div className={styles["navbar__inner"]}>
          <span className={styles["navbar__logo"]}>TestPilot AI</span>

          {/* Desktop links */}
          <div className={styles["navbar__links"]}>
            <a href="/generator" className={styles["navbar__link"]}>
              Generator
            </a>
            <a href="/upload-doc" className={styles["navbar__link"]}>
              Upload Doc
            </a>
            <a href="/analyzer" className={styles["navbar__link"]}>
              Analyzer
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={styles["mobile-menu-btn"]}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={styles["mobile-menu"]}>
            <a
              href="/generator"
              className={styles["mobile-menu__link"]}
              onClick={() => setIsMenuOpen(false)}
            >
              Generator
            </a>
            <a
              href="/upload-doc"
              className={styles["mobile-menu__link"]}
              onClick={() => setIsMenuOpen(false)}
            >
              Upload Doc
            </a>
            <a
              href="/analyzer"
              className={styles["mobile-menu__link"]}
              onClick={() => setIsMenuOpen(false)}
            >
              Analyzer
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className={styles["hero"]}>
        <div className={styles["hero__glow"]} />
        <div className={styles["hero__content"]}>
          <div
            className={`${styles["hero__badge"]} ${heroVisible ? styles["hero__badge--visible"] : ""}`}
          >
            AI-Powered QA Test Generation
          </div>

          <h1
            className={`${styles["hero__heading"]} ${heroVisible ? styles["hero__heading--visible"] : ""}`}
          >
            Generate. Review.
            <br />
            Ship Quality.
          </h1>

          <p
            className={`${styles["hero__subtext"]} ${heroVisible ? styles["hero__subtext--visible"] : ""}`}
          >
            AI-powered test case generation and coverage analysis for QA
            engineers.
          </p>

          <div
            className={`${styles["hero__ctas"]} ${heroVisible ? styles["hero__ctas--visible"] : ""}`}
          >
            <a href="/generator" className={styles["btn-primary"]}>
              Generate from Text
            </a>
            <a href="/upload-doc" className={styles["btn-secondary"]}>
              Upload a Document
            </a>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className={styles["features"]} ref={featuresRef}>
        <div className={styles["section-inner"]}>
          <p className={styles["section-label"]}>WHAT IT DOES</p>
          <h2 className={styles["section-heading"]}>Three tools. One workflow.</h2>

          <div className={styles["cards-grid"]}>
            {featureCards.map((card, i) => (
              <div
                key={i}
                className={`${styles["card"]} ${featuresVisible ? styles["card--visible"] : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={styles["card__icon"]}>{card.icon}</div>
                <h3 className={styles["card__title"]}>{card.title}</h3>
                <p className={styles["card__desc"]}>{card.description}</p>
                <a href={card.link} className={styles["card__link"]}>
                  Open{" "}
                  <ChevronRight size={13} strokeWidth={1.5} className={styles["card__link-arrow"]} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles["how-it-works"]} ref={howItWorksRef}>
        <div className={styles["section-inner"]}>
          <p className={styles["section-label"]}>HOW IT WORKS</p>
          <h2 className={styles["section-heading"]}>Simple. Fast. Structured.</h2>

          <div className={styles["steps-row"]}>
            {steps.map((step, i) => (
              <div
                key={i}
                className={`${styles["step"]} ${howItWorksVisible ? styles["step--visible"] : ""}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <span className={styles["step__number"]}>{step.number}</span>
                <h4 className={styles["step__title"]}>{step.title}</h4>
                <p className={styles["step__desc"]}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles["footer"]}>
        <p className={styles["footer__text"]}>
          TestPilot AI &nbsp;·&nbsp; QA-focused Developer Tool
        </p>
      </footer>
    </div>
  );
}