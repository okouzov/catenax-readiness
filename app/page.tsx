"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { db, isFirebaseConfigured } from "../lib/firebase";

const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const assetPath = (path: string) => `${siteBasePath}${path}`;

const workPackages = [
  {
    number: "01",
    title: "Eligibility & Opportunity",
    summary:
      "Confirm programme eligibility and identify where your current data can support a real Catena-X opportunity.",
    deliverable: "Eligibility & Opportunity Report",
    details: [
      "Confirm the company’s eligibility for the programme.",
      "Review the company’s supply-chain position and fit within the Catena-X participant landscape.",
      "Review available product, supplier/customer, quality and traceability data.",
    ],
  },
  {
    number: "02",
    title: "Use Case Match",
    summary:
      "Match business priorities and data readiness to the Catena-X use cases with the strongest practical value.",
    deliverable: "Prioritised Catena-X use-case shortlist",
    details: [
      "Traceability and quality management",
      "Sustainability and CO₂ reporting",
      "Digital Product Passport readiness",
      "Supply-chain transparency",
      "Trusted partner data exchange",
    ],
  },
  {
    number: "03",
    title: "Data Quality & Gaps",
    summary:
      "Assess whether the data is complete, structured, standardised, usable and shareable.",
    deliverable: "Data Quality & Gaps Report with improvement recommendations",
    details: [
      "Review data completeness and ownership.",
      "Assess structure, format and standardisation.",
      "Derive concrete recommendations based on company targets and strategic plans.",
    ],
  },
  {
    number: "04",
    title: "Action Roadmap",
    summary:
      "Align business, data, technical and governance readiness into an immediate, practical plan.",
    deliverable: "Immediate Action Roadmap",
    details: [
      "Define immediate action items.",
      "Identify and mitigate risks and issues.",
      "Support successful Catena-X participation.",
      "Support successful programme completion.",
    ],
  },
  {
    number: "05",
    title: "Application Pack",
    summary:
      "Prepare the Catena-X application pack and coordinate the technical and governance inputs.",
    deliverable: "Complete, deadline-ready application pack",
    details: [
      "Ensure technical readiness.",
      "Engage technical and governance partners.",
      "List required technical tools, protocols and procurement activities.",
      "Share best practices from previous projects.",
      "Support timely application and compliance with all deadlines.",
    ],
  },
  {
    number: "06",
    title: "Use Case Execution",
    summary:
      "Support both use cases through to successful completion and productive data exchange.",
    deliverable: "Executed, demonstrated Catena-X data exchange",
    details: [
      "Showcase technical execution at GATE.",
      "Engage technical and governance partners.",
      "Share implementation best practices from previous projects.",
      "Support the actual execution of data exchange.",
      "Support timely completion and compliance with all deadlines.",
    ],
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<
    "idle" | "success" | "error" | "config"
  >("idle");

  const emailIsValid = useMemo(
    () => email.length === 0 || emailPattern.test(email),
    [email],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("idle");
    setEmailTouched(true);

    if (!emailPattern.test(email)) return;

    if (!db || !isFirebaseConfigured) {
      setSubmitState("config");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        fullName: String(data.get("fullName") || "").trim(),
        company: String(data.get("company") || "").trim(),
        email: email.trim().toLowerCase(),
        phone: String(data.get("phone") || "").trim(),
        jobTitle: String(data.get("jobTitle") || "").trim(),
        employees: String(data.get("employees") || ""),
        annualRevenue: String(data.get("annualRevenue") || ""),
        focusArea: String(data.get("focusArea") || ""),
        notes: String(data.get("notes") || "").trim(),
        consent: data.get("consent") === "on",
        source: "automotive-cluster-newsletter",
        status: "new",
        createdAt: serverTimestamp(),
      });
      form.reset();
      setEmail("");
      setEmailTouched(false);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="GATE Catena-X Readiness home">
          <Image src={assetPath("/gate-logo.png")} alt="GATE Institute" width={400} height={140} priority />
          <span className="brand-divider" />
          <span className="catena-wordmark">CATENA—X</span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "nav-open" : ""} aria-label="Main navigation">
          <a href="#opportunity" onClick={() => setMenuOpen(false)}>Opportunity</a>
          <a href="#journey" onClick={() => setMenuOpen(false)}>The service</a>
          <a href="#gate" onClick={() => setMenuOpen(false)}>About GATE</a>
          <a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>
            Check my fit
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="network-field" aria-hidden="true">
          <i className="node node-1" />
          <i className="node node-2" />
          <i className="node node-3" />
          <i className="node node-4" />
          <i className="node node-5" />
          <i className="link link-1" />
          <i className="link link-2" />
          <i className="link link-3" />
          <i className="link link-4" />
        </div>
        <div className="hero-copy">
          <p className="eyebrow">A fully EU-funded readiness service for Bulgarian automotive companies</p>
          <h1>
            Your route into Europe’s automotive <em>data ecosystem.</em>
          </h1>
          <p className="hero-lead">
            Understand data spaces, identify a viable Catena-X use case and move
            from data preparation to production exchange—with end-to-end support
            from GATE Institute.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#contact">
              Explore your eligibility <span aria-hidden="true">↗</span>
            </a>
            <a className="text-link" href="#journey">
              See the 6-stage journey <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
        <aside className="funding-orbit" aria-label="Funding overview">
          <div className="orbit-ring orbit-one" />
          <div className="orbit-ring orbit-two" />
          <div className="funding-core">
            <span>combined support</span>
            <strong>~€20–25K</strong>
            <small>for eligible companies</small>
          </div>
          <div className="orbit-chip orbit-chip-a">EU funded</div>
          <div className="orbit-chip orbit-chip-b">End-to-end</div>
          <div className="orbit-chip orbit-chip-c">Industry ready</div>
        </aside>
        <div className="hero-proof">
          <span>GATE Institute</span>
          <span>Data Space Accelerator</span>
          <span>EDIH InnovationAmp</span>
        </div>
      </section>

      <section className="eligibility-bar" aria-label="Eligibility snapshot">
        <p>Initial eligibility snapshot</p>
        <div><strong>&gt;10</strong><span>employees</span></div>
        <div><strong>&lt;248</strong><span>employees</span></div>
        <div><strong>&gt;€500K</strong><span>annual revenue</span></div>
        <div><strong>&lt;€50M</strong><span>annual revenue</span></div>
        <a href="#contact">Confirm with GATE →</a>
      </section>

      <section className="proposal-ribbon" aria-label="What the proposal enables">
        <article>
          <span>01</span>
          <p>Understand data-space concepts and prepare to join Catena-X.</p>
        </article>
        <article>
          <span>02</span>
          <p>Receive GATE support from data preparation to production exchange.</p>
        </article>
        <article>
          <span>03</span>
          <p>Be among the first Bulgarian companies active in Germany’s leading data-space initiatives.</p>
        </article>
      </section>

      <section className="section opportunity" id="opportunity">
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Why Catena-X</p>
          <h2>Data exchange is becoming a business capability.</h2>
          <p>
            Catena-X is the first open, collaborative data ecosystem designed for
            the automotive industry, enabling secure, sovereign and interoperable
            exchange across OEMs, suppliers, logistics providers and service partners.
          </p>
        </div>
        <div className="value-grid">
          {[
            ["01", "Traceability", "Follow parts, materials and events across multi-tier supply chains."],
            ["02", "Quality", "Exchange trusted data to detect issues earlier and resolve them faster."],
            ["03", "Sustainability", "Prepare for standardised CO₂ and Product Carbon Footprint reporting."],
            ["04", "Digital Product Passport", "Build the data foundation for product passport readiness."],
          ].map(([number, title, copy]) => (
            <article className="value-card" key={title} data-reveal>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <i aria-hidden="true">↗</i>
            </article>
          ))}
        </div>
        <div className="strategic-callout" data-reveal>
          <p>For automotive suppliers, Catena-X can open access to global supply chains, improve operational efficiency through trusted data exchange and strengthen competitiveness in the European automotive market.</p>
          <a href="https://catena-x.net/ecosystem/overview/" target="_blank" rel="noreferrer">
            Explore the official Catena-X ecosystem ↗
          </a>
        </div>
      </section>

      <section className="section journey" id="journey">
        <div className="section-heading section-heading-light" data-reveal>
          <p className="eyebrow">The GATE service</p>
          <h2>Six work packages. One usable outcome.</h2>
          <p>
            GATE helps management understand what to fix, what to pilot and how
            to approach the accelerator offer—then supports execution through to
            a productive data exchange.
          </p>
        </div>
        <div className="journey-list">
          {workPackages.map((item, index) => (
            <details className="journey-item" key={item.number} open={index === 0} data-reveal>
              <summary>
                <span className="journey-number">{item.number}</span>
                <span className="journey-title">
                  <strong>{item.title}</strong>
                  <small>{item.summary}</small>
                </span>
                <span className="journey-toggle" aria-hidden="true">+</span>
              </summary>
              <div className="journey-detail">
                <ul>
                  {item.details.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
                <p><span>Deliverable</span>{item.deliverable}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="section programmes">
        <div className="programme-card accelerator" data-reveal>
          <div className="programme-kicker">Germany-supported public initiative</div>
          <h2>Data Space Accelerator</h2>
          <p>
            A publicly funded study designed to lower entry barriers to Catena-X.
            It combines guided onboarding, technical integration and validated
            industrial use cases, with support for completing one or two
            validated Catena-X scenarios.
          </p>
          <div className="programme-stat">
            <strong>Up to €30,000</strong>
            <span>official programme remuneration for successful completion of the advanced path*</span>
          </div>
          <a href="https://data-space-accelerator.com/" target="_blank" rel="noreferrer">
            Visit the official programme ↗
          </a>
        </div>
        <div className="programme-card innovation" data-reveal>
          <Image src={assetPath("/innovationamp-logo.png")} alt="InnovationAmp" width={400} height={120} />
          <div className="programme-kicker">European Digital Innovation Hub</div>
          <h2>Test before you invest.</h2>
          <p>
            InnovationAmp accelerates SME digital transformation through AI,
            big data and high-performance computing expertise, including digital
            maturity assessment, technical consulting, training and access to
            advanced technologies before major investment.
          </p>
          <a href="https://innovationamp.eu/en/" target="_blank" rel="noreferrer">
            Discover InnovationAmp ↗
          </a>
        </div>
        <p className="programme-note">
          *Programme availability, eligibility and remuneration are subject to
          the official tender rules. For participants outside Germany, the
          remuneration is recalculated using a purchasing-power index.
        </p>
      </section>

      <section className="section gate-section" id="gate">
        <div className="gate-mark" data-reveal>
          <Image src={assetPath("/gate-logo.png")} alt="GATE — Big Data for Smart Society" width={400} height={140} />
          <span>Sofia University “St. Kliment Ohridski”</span>
        </div>
        <div className="gate-copy" data-reveal>
          <p className="eyebrow">Your readiness partner</p>
          <h2>Research excellence, translated into implementation.</h2>
          <p>
            GATE (Big Data for Smart Society Institute) is a leading Bulgarian
            research and innovation institute focused on advanced artificial
            intelligence, big data and data spaces through applied research,
            technology development and European collaborative projects.
          </p>
          <div className="gate-points">
            <div>
              <strong>Data-space expertise</strong>
              <p>Readiness assessment, governance, semantic interoperability and integration into European ecosystems including Catena-X and the European Health Data Space.</p>
            </div>
            <div>
              <strong>Trusted innovation partner</strong>
              <p>Practical implementation for industry and the public sector, accelerating digital transformation, data sharing and participation in European data ecosystems.</p>
            </div>
          </div>
          <a className="text-link dark" href="https://www.gate-ai.eu/en/home/" target="_blank" rel="noreferrer">
            Learn more about GATE ↗
          </a>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-intro" data-reveal>
          <p className="eyebrow">Start the conversation</p>
          <h2>Could your company be among Bulgaria’s first movers?</h2>
          <p>
            Leave your details and the GATE team will contact you to discuss
            eligibility, data readiness and the most relevant Catena-X use case.
          </p>
          <div className="contact-assurances">
            <span><i>✓</i> No-obligation initial conversation</span>
            <span><i>✓</i> Eligibility and opportunity review</span>
            <span><i>✓</i> Business-first, confidential approach</span>
          </div>
        </div>

        <form className="lead-form" onSubmit={handleSubmit} noValidate data-reveal>
          <div className="form-topline">
            <span>Expression of interest</span>
            <small>Fields marked * are required</small>
          </div>
          <div className="form-grid">
            <label>
              <span>Full name *</span>
              <input name="fullName" type="text" autoComplete="name" required maxLength={100} placeholder="Your name" />
            </label>
            <label>
              <span>Company *</span>
              <input name="company" type="text" autoComplete="organization" required maxLength={120} placeholder="Company name" />
            </label>
            <label className={!emailIsValid && emailTouched ? "field-error" : ""}>
              <span>Business email *</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                maxLength={160}
                aria-invalid={!emailIsValid && emailTouched}
                aria-describedby="email-error"
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="name@company.com"
              />
              <small id="email-error" role="alert">
                {!emailIsValid && emailTouched ? "Please enter a valid email address." : ""}
              </small>
            </label>
            <label>
              <span>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" maxLength={40} placeholder="+359 ..." />
            </label>
            <label>
              <span>Role / job title</span>
              <input name="jobTitle" type="text" autoComplete="organization-title" maxLength={100} placeholder="e.g. Operations Director" />
            </label>
            <label>
              <span>Company size *</span>
              <select name="employees" required defaultValue="">
                <option value="" disabled>Select employees</option>
                <option value="1-10">1–10</option>
                <option value="11-49">11–49</option>
                <option value="50-247">50–247</option>
                <option value="248+">248+</option>
              </select>
            </label>
            <label>
              <span>Annual revenue *</span>
              <select name="annualRevenue" required defaultValue="">
                <option value="" disabled>Select revenue</option>
                <option value="under-500k">Under €500K</option>
                <option value="500k-10m">€500K–€10M</option>
                <option value="10m-50m">€10M–€50M</option>
                <option value="over-50m">Over €50M</option>
              </select>
            </label>
            <label>
              <span>Primary area of interest *</span>
              <select name="focusArea" required defaultValue="">
                <option value="" disabled>Select an area</option>
                <option value="traceability">Traceability</option>
                <option value="quality">Quality management</option>
                <option value="sustainability">Sustainability / CO₂ reporting</option>
                <option value="dpp">Digital Product Passport</option>
                <option value="supply-chain">Supply-chain transparency</option>
                <option value="partner-exchange">Trusted partner data exchange</option>
                <option value="not-sure">Not sure yet</option>
              </select>
            </label>
            <label className="form-wide">
              <span>What would you like to explore?</span>
              <textarea name="notes" rows={4} maxLength={1500} placeholder="Tell us briefly about your goals, data or current challenge." />
            </label>
            <label className="honeypot" aria-hidden="true">
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <label className="consent">
            <input name="consent" type="checkbox" required />
            <span>
              I consent to GATE using these details to contact me about this opportunity. See GATE’s{" "}
              <a href="https://www.gate-ai.eu/en/privacy-terms-and-conditions/" target="_blank" rel="noreferrer">privacy terms</a>.
            </span>
          </label>
          <button className="submit-button" type="submit" disabled={submitting}>
            <span>{submitting ? "Sending…" : "Request a readiness conversation"}</span>
            <i aria-hidden="true">↗</i>
          </button>
          <div className={`form-message ${submitState}`} role="status" aria-live="polite">
            {submitState === "success" && "Thank you. Your details have been received and the GATE team can now follow up."}
            {submitState === "error" && "We could not send your details just now. Please try again in a moment."}
            {submitState === "config" && "The contact form is awaiting its Firebase connection. Please contact GATE directly in the meantime."}
          </div>
        </form>
      </section>

      <footer>
        <div className="footer-logos">
          <Image src={assetPath("/gate-logo.png")} alt="GATE Institute" width={400} height={140} />
          <Image src={assetPath("/innovationamp-logo.png")} alt="InnovationAmp" width={400} height={120} />
          <Image src={assetPath("/smart-growth-program.png")} alt="Science and Education for Smart Growth Operational Programme" width={500} height={150} />
          <Image src={assetPath("/eu-funded.png")} alt="Funded by the European Union" width={500} height={100} />
        </div>
        <div className="footer-copy">
          <p>Catena-X Readiness Service for Bulgarian automotive companies.</p>
          <span>© {new Date().getFullYear()} GATE Institute</span>
        </div>
        <div className="footer-links">
          <Link href="/submissions">Review submissions</Link>
          <a href="https://catena-x.net/" target="_blank" rel="noreferrer">Catena-X</a>
          <a href="https://data-space-accelerator.com/" target="_blank" rel="noreferrer">Data Space Accelerator</a>
          <a href="https://www.gate-ai.eu/en/home/" target="_blank" rel="noreferrer">GATE</a>
        </div>
      </footer>
    </main>
  );
}
