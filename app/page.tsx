"use client";

import { useRef, useState } from "react";
import {
  Home, Sandwich, Wine, CookingPot, Utensils, ChefHat, Calculator,
  CalendarDays, Camera, ShieldCheck, Bell, ChevronRight, UtensilsCrossed,
  UploadCloud, FileSpreadsheet, Download, ArrowLeft, CheckCircle2, AlertCircle,
} from "lucide-react";

const departments = [
  { name: "CONCESSIONS", description: "Production, pars, stands, ordering, tags, and game-day execution tools.", icon: Sandwich, status: "COMING SOON" },
  { name: "CLUBS", description: "Club production tools, breakout sheets, and service support.", icon: Wine, status: "OPEN", active: true },
  { name: "SUITES", description: "Suite production, pantry builds, cart organization, and service tools.", icon: CookingPot, status: "COMING SOON" },
  { name: "CATERING", description: "Banquet production, BEO support, prep organization, and event execution.", icon: Utensils, status: "COMING SOON" },
];

const sharedTools = [
  { name: "CREATE A RECIPE", description: "Build standardized recipes, yields, and notes.", icon: ChefHat },
  { name: "COST A MENU", description: "Quick menu and per-guest costing tools.", icon: Calculator },
  { name: "EVENT CALENDAR", description: "View upcoming stadium events and key culinary dates.", icon: CalendarDays },
  { name: "PHOTO DUMP", description: "Central place for event, food, and operational photos.", icon: Camera },
];

const navigation = [
  ["Dashboard", Home], ["Concessions", Sandwich], ["Clubs", Wine],
  ["Suites", CookingPot], ["Catering", Utensils],
] as const;

const sharedNavigation = [
  ["Create a Recipe", ChefHat], ["Cost a Menu", Calculator],
  ["Event Calendar", CalendarDays], ["Photo Dump", Camera], ["Food Safety", ShieldCheck],
] as const;

type Screen = "dashboard" | "clubs";
type IconType = typeof Home;

function SidebarItem({ label, Icon, active = false, onClick }: { label: string; Icon: IconType; active?: boolean; onClick?: () => void }) {
  return <button className={`sidebar-item ${active ? "sidebar-active" : ""}`} onClick={onClick}><Icon size={21} strokeWidth={1.7} /><span>{label}</span></button>;
}

function Sidebar({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-stadium">STAD<span className="knife-letter">I</span>UM</div>
        <div className="brand-ops">OPS</div>
      </div>
      <nav className="sidebar-nav">
        {navigation.map(([label, Icon]) => <SidebarItem key={label} label={label} Icon={Icon} active={(label === "Dashboard" && screen === "dashboard") || (label === "Clubs" && screen === "clubs")} onClick={label === "Dashboard" ? () => setScreen("dashboard") : label === "Clubs" ? () => setScreen("clubs") : undefined} />)}
      </nav>
      <div className="sidebar-heading">SHARED TOOLS</div>
      <nav className="sidebar-nav">{sharedNavigation.map(([label, Icon]) => <SidebarItem key={label} label={label} Icon={Icon} />)}</nav>
      <div className="sidebar-footer"><div className="footer-icon"><UtensilsCrossed size={30} strokeWidth={1.4} /></div><div>BUILT FOR OPERATIONS.</div><strong>DRIVEN BY PASSION.</strong></div>
    </aside>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title"><span className="chevrons">»</span><span>{children}</span><div className="section-line" /></div>;
}

function Dashboard({ openClubs }: { openClubs: () => void }) {
  return (
    <section className="main-content">
      <header className="hero">
        <div className="hero-copy"><div className="welcome">WELCOME BACK,</div><h1>MERCEDES-BENZ STADIUM<br />CULINARY DEPARTMENT</h1><p>One home for the tools that support<br />Concessions, Clubs, Suites, and Catering.</p><div className="hero-underline" /></div>
        <div className="hero-design" />
        <div className="user-area"><div className="notification"><Bell size={24} /><span>3</span></div><div className="avatar">CM</div><span className="user-name">Culinary Department</span><span className="user-arrow">⌄</span></div>
      </header>
      <SectionTitle>DEPARTMENTS</SectionTitle>
      <div className="department-grid">
        {departments.map((item) => { const Icon = item.icon; return <article className="tool-card department-card" key={item.name}><Icon className="department-icon" size={67} strokeWidth={1.35} /><h2>{item.name}</h2><p>{item.description}</p>{item.active ? <button className="open-button" onClick={openClubs}>OPEN <ChevronRight size={21} /></button> : <div className="coming-soon">{item.status} <ChevronRight size={17} /></div>}</article>; })}
      </div>
      <SectionTitle>SHARED TOOLS</SectionTitle>
      <div className="shared-grid">{sharedTools.map((item) => { const Icon = item.icon; return <article className="tool-card shared-card" key={item.name}><Icon className="shared-icon" size={49} strokeWidth={1.35} /><h3>{item.name}</h3><p>{item.description}</p><div className="coming-soon">COMING SOON <ChevronRight size={16} /></div></article>; })}</div>
      <section className="food-safety-banner"><div className="shield-wrap"><ShieldCheck size={48} strokeWidth={1.4} /></div><div className="food-safety-copy"><h2>FOOD SAFETY DOCUMENTS</h2><p>Quick access to food safety forms, logs, SOPs, and compliance documents.</p></div><div className="food-safety-status">COMING SOON <ChevronRight size={20} /></div></section>
    </section>
  );
}

function ClubsBuilder({ goBack }: { goBack: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [downloadName, setDownloadName] = useState("");

  function selectFile(selected?: File) {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".xlsx")) { setStatus("error"); setMessage("Please select an Excel .xlsx workbook."); return; }
    setFile(selected); setStatus("idle"); setMessage("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
  }

  async function buildWorkbook() {
    if (!file) return;
    setStatus("processing"); setMessage("");
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    try {
      const formData = new FormData(); formData.append("file", file);
      const response = await fetch("/api/clubs-breakouts", { method: "POST", body: formData });
      if (!response.ok) { const data = await response.json().catch(() => ({ error: "The workbook could not be processed." })); throw new Error(data.error || "The workbook could not be processed."); }
      const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const match = (response.headers.get("content-disposition") || "").match(/filename="([^"]+)"/);
      setDownloadName(match?.[1] || `${file.name.replace(/\.xlsx$/i, "")} - CLUB BREAKOUTS.xlsx`);
      setDownloadUrl(url); setStatus("ready");
      const count = response.headers.get("x-club-count");
      setMessage(count ? `${count} club breakout tabs created.` : "Your breakout workbook is ready.");
    } catch (error) { setStatus("error"); setMessage(error instanceof Error ? error.message : "The workbook could not be processed."); }
  }

  return (
    <section className="main-content clubs-page">
      <button className="back-button" onClick={goBack}><ArrowLeft size={18} /> BACK TO DASHBOARD</button>
      <div className="clubs-hero"><div className="clubs-kicker">CLUBS DEPARTMENT</div><Wine size={54} strokeWidth={1.35} /><h1>PRODUCTION SHEET BUILDER</h1><p>Upload the completed Clubs master production sheet and create individual breakout tabs for every club space.</p></div>
      <div className="process-steps"><div><strong>1</strong><span>UPLOAD</span><small>Select the master workbook</small></div><div><strong>2</strong><span>BUILD</span><small>Create club-specific tabs</small></div><div><strong>3</strong><span>DOWNLOAD</span><small>Use the finished workbook</small></div></div>
      <div className="builder-panel">
        <div className={`upload-zone ${file ? "has-file" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files[0]); }} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }}>
          <input ref={inputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={(event) => selectFile(event.target.files?.[0])} />
          {file ? <FileSpreadsheet size={48} /> : <UploadCloud size={48} />}<h2>{file ? file.name : "UPLOAD CLUBS MASTER SHEET"}</h2><p>{file ? "Click to choose a different workbook" : "Drag and drop the Excel file here, or click to browse"}</p>
        </div>
        <button className="build-button" disabled={!file || status === "processing"} onClick={buildWorkbook}>{status === "processing" ? <><span className="spinner" /> BUILDING CLUB BREAKOUTS...</> : <>CREATE CLUB BREAKOUT SHEETS <ChevronRight size={21} /></>}</button>
        {status === "ready" && <div className="result-panel success"><CheckCircle2 size={27} /><div><strong>CLUB BREAKOUT WORKBOOK IS READY</strong><span>{message}</span></div><a href={downloadUrl} download={downloadName}><Download size={19} /> DOWNLOAD COMPLETED WORKBOOK</a></div>}
        {status === "error" && <div className="result-panel error"><AlertCircle size={25} /><div><strong>WE COULDN&apos;T PROCESS THAT WORKBOOK</strong><span>{message}</span></div></div>}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  return <main className="app-shell"><Sidebar screen={screen} setScreen={setScreen} />{screen === "dashboard" ? <Dashboard openClubs={() => setScreen("clubs")} /> : <ClubsBuilder goBack={() => setScreen("dashboard")} />}</main>;
}
