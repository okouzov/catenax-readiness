"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  DocumentData,
  QueryDocumentSnapshot,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "../../lib/firebase";

const REVIEWER_EMAIL = "catenax-review@gate.local";
const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH ?? "";
const gateLogo = `${siteBasePath}/gate-logo-white-transparent.png`;
const catenaLogo = `${siteBasePath}/catena-x-logo-white-transparent.png`;

type Lead = {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  employees: string;
  annualRevenue: string;
  focusArea: string;
  notes: string;
  status: string;
  createdAt?: { toDate: () => Date };
};

const focusLabels: Record<string, string> = {
  traceability: "Traceability",
  quality: "Quality management",
  sustainability: "Sustainability / CO₂",
  dpp: "Digital Product Passport",
  "supply-chain": "Supply-chain transparency",
  "partner-exchange": "Trusted partner exchange",
  "not-sure": "Not sure yet",
};

function leadFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): Lead {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    fullName: String(data.fullName || ""),
    company: String(data.company || ""),
    email: String(data.email || ""),
    phone: String(data.phone || ""),
    jobTitle: String(data.jobTitle || ""),
    employees: String(data.employees || ""),
    annualRevenue: String(data.annualRevenue || ""),
    focusArea: String(data.focusArea || ""),
    notes: String(data.notes || ""),
    status: String(data.status || "new"),
    createdAt: data.createdAt,
  };
}

function formatDate(lead: Lead) {
  if (!lead.createdAt?.toDate) return "Pending timestamp";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(lead.createdAt.toDate());
}

function csvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function SubmissionsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [dataError, setDataError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!auth) return;

    return onAuthStateChanged(auth, (nextUser) => {
      const isReviewer = nextUser?.email === REVIEWER_EMAIL;
      setUser(isReviewer ? nextUser : null);
      if (isReviewer) {
        setLoadingLeads(true);
        setDataError("");
      } else {
        setLeads([]);
        setLoadingLeads(false);
      }
      setAuthReady(true);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) return;

    const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"));

    return onSnapshot(
      leadsQuery,
      (snapshot) => {
        setLeads(snapshot.docs.map(leadFromSnapshot));
        setLoadingLeads(false);
      },
      () => {
        setDataError("The submissions could not be loaded. Check the deployed Firestore rules.");
        setLoadingLeads(false);
      },
    );
  }, [user]);

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((lead) =>
      [
        lead.fullName,
        lead.company,
        lead.email,
        lead.phone,
        lead.jobTitle,
        lead.focusArea,
        lead.notes,
      ].some((value) => value.toLowerCase().includes(term)),
    );
  }, [leads, search]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    if (!auth || !isFirebaseConfigured) {
      setLoginError("Firebase is not configured for this deployment yet.");
      return;
    }

    setSigningIn(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        REVIEWER_EMAIL,
        password,
      );
      if (credential.user.email !== REVIEWER_EMAIL) {
        await signOut(auth);
        throw new Error("Unauthorised account");
      }
      setPassword("");
    } catch {
      setLoginError("Incorrect password or the shared reviewer account has not been created.");
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    if (auth) await signOut(auth);
  }

  function exportCsv() {
    const headers = [
      "Submitted",
      "Name",
      "Company",
      "Email",
      "Phone",
      "Role",
      "Employees",
      "Annual revenue",
      "Interest",
      "Notes",
    ];
    const rows = filteredLeads.map((lead) => [
      formatDate(lead),
      lead.fullName,
      lead.company,
      lead.email,
      lead.phone,
      lead.jobTitle,
      lead.employees,
      lead.annualRevenue,
      focusLabels[lead.focusArea] || lead.focusArea,
      lead.notes,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => csvValue(String(value))).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `catenax-submissions-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!authReady) {
    return <main className="admin-loading">Preparing secure access…</main>;
  }

  if (!user) {
    return (
      <main className="admin-login">
        <Link className="admin-brand" href="/">
          <span className="admin-logo admin-logo-gate">
            <Image src={gateLogo} alt="GATE Institute" width={1300} height={736} priority />
          </span>
          <span className="admin-brand-divider" />
          <span className="admin-logo admin-logo-catena">
            <Image src={catenaLogo} alt="Catena-X Automotive Network" width={1206} height={330} priority />
          </span>
        </Link>
        <section className="login-panel">
          <div className="login-visual" aria-hidden="true">
            <i />
            <i />
            <i />
            <div>
              <span>Protected dataset</span>
              <strong>LEADS</strong>
              <small>Firestore access</small>
            </div>
          </div>
          <form onSubmit={handleLogin}>
            <p className="eyebrow">Internal access</p>
            <h1>Review submitted interest.</h1>
            <p>
              Enter the shared team password to open the Catena-X expressions
              of interest. No Firebase Console account is required.
            </p>
            <label>
              <span>Shared password</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
              />
            </label>
            <button type="submit" disabled={signingIn}>
              {signingIn ? "Checking…" : "Open submissions"} <span>↗</span>
            </button>
            <div className="login-error" role="alert">{loginError}</div>
            <Link className="back-link" href="/">← Back to the landing page</Link>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-header">
        <Link className="admin-brand" href="/">
          <span className="admin-logo admin-logo-gate">
            <Image src={gateLogo} alt="GATE Institute" width={1300} height={736} />
          </span>
          <span className="admin-brand-divider" />
          <span className="admin-logo admin-logo-catena">
            <Image src={catenaLogo} alt="Catena-X Automotive Network" width={1206} height={330} />
          </span>
        </Link>
        <button type="button" onClick={handleSignOut}>Sign out</button>
      </header>

      <section className="admin-hero">
        <div>
          <p className="eyebrow">Internal review</p>
          <h1>Expressions of interest</h1>
          <p>Live, read-only access to the contact information stored in Firestore.</p>
        </div>
        <div className="admin-metric">
          <strong>{leads.length}</strong>
          <span>total submissions</span>
        </div>
      </section>

      <section className="admin-toolbar">
        <label>
          <span className="sr-only">Search submissions</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company, contact, email or interest…"
          />
        </label>
        <div>
          <span>{filteredLeads.length} shown</span>
          <button type="button" onClick={exportCsv} disabled={!filteredLeads.length}>
            Export CSV ↓
          </button>
        </div>
      </section>

      <section className="lead-dataset" aria-live="polite">
        {loadingLeads && <div className="dataset-state">Loading submissions…</div>}
        {dataError && <div className="dataset-state error">{dataError}</div>}
        {!loadingLeads && !dataError && filteredLeads.length === 0 && (
          <div className="dataset-state">No matching submissions yet.</div>
        )}
        {!loadingLeads && !dataError && filteredLeads.map((lead) => (
          <article className="lead-row" key={lead.id}>
            <div className="lead-date">
              <span>{formatDate(lead)}</span>
              <small>{lead.status}</small>
            </div>
            <div className="lead-identity">
              <strong>{lead.fullName}</strong>
              <span>{lead.jobTitle || "Role not provided"}</span>
              <b>{lead.company}</b>
            </div>
            <div className="lead-contact">
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
              <span>{lead.phone || "No phone provided"}</span>
            </div>
            <div className="lead-profile">
              <span>{lead.employees} employees</span>
              <span>{lead.annualRevenue}</span>
              <b>{focusLabels[lead.focusArea] || lead.focusArea}</b>
            </div>
            <div className="lead-notes">
              <span>Notes</span>
              <p>{lead.notes || "No additional notes."}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
