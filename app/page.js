"use client";

import {
  Home,
  Sandwich,
  Wine,
  CookingPot,
  Utensils,
  ChefHat,
  Calculator,
  CalendarDays,
  Camera,
  ShieldCheck,
  Bell,
  ChevronRight,
  UtensilsCrossed,
} from "lucide-react";

const departments = [
  {
    name: "CONCESSIONS",
    description: "Production, pars, stands, ordering, tags, and game-day execution tools.",
    icon: Sandwich,
    status: "COMING SOON",
  },
  {
    name: "CLUBS",
    description: "Club production tools, breakout sheets, and service support.",
    icon: Wine,
    status: "OPEN",
    active: true,
  },
  {
    name: "SUITES",
    description: "Suite production, pantry builds, cart organization, and service tools.",
    icon: CookingPot,
    status: "COMING SOON",
  },
  {
    name: "CATERING",
    description: "Banquet production, BEO support, prep organization, and event execution.",
    icon: Utensils,
    status: "COMING SOON",
  },
];

const sharedTools = [
  {
    name: "CREATE A RECIPE",
    description: "Build standardized recipes, yields, and notes.",
    icon: ChefHat,
  },
  {
    name: "COST A MENU",
    description: "Quick menu and per-guest costing tools.",
    icon: Calculator,
  },
  {
    name: "EVENT CALENDAR",
    description: "View upcoming stadium events and key culinary dates.",
    icon: CalendarDays,
  },
  {
    name: "PHOTO DUMP",
    description: "Central place for event, food, and operational photos.",
    icon: Camera,
  },
];

const navigation = [
  ["Dashboard", Home],
  ["Concessions", Sandwich],
  ["Clubs", Wine],
  ["Suites", CookingPot],
  ["Catering", Utensils],
];

const sharedNavigation = [
  ["Create a Recipe", ChefHat],
  ["Cost a Menu", Calculator],
  ["Event Calendar", CalendarDays],
  ["Photo Dump", Camera],
  ["Food Safety", ShieldCheck],
];

function SidebarItem({ label, Icon, active = false }) {
  return (
    <button className={`sidebar-item ${active ? "sidebar-active" : ""}`}>
      <Icon size={21} strokeWidth={1.7} />
      <span>{label}</span>
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="section-title">
      <span className="chevrons">»</span>
      <span>{children}</span>
      <div className="section-line" />
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-stadium">
            STAD<span className="knife-letter">I</span>UM
          </div>
          <div className="brand-chef">CHEF</div>
          <div className="brand-ops">OPS</div>
        </div>

        <nav className="sidebar-nav">
          {navigation.map(([label, Icon], index) => (
            <SidebarItem
              key={label}
              label={label}
              Icon={Icon}
              active={index === 0}
            />
          ))}
        </nav>

        <div className="sidebar-heading">SHARED TOOLS</div>

        <nav className="sidebar-nav">
          {sharedNavigation.map(([label, Icon]) => (
            <SidebarItem key={label} label={label} Icon={Icon} />
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-icon">
            <UtensilsCrossed size={30} strokeWidth={1.4} />
          </div>
          <div>BUILT FOR OPERATIONS.</div>
          <strong>DRIVEN BY PASSION.</strong>
        </div>
      </aside>

      <section className="main-content">
        <header className="hero">
          <div className="hero-copy">
            <div className="welcome">WELCOME BACK,</div>
            <h1>
  MERCEDES-BENZ STADIUM
  <br />
  CULINARY DEPARTMENT
</h1>
            <p>
              One home for the tools that support
              <br />
              Concessions, Clubs, Suites, and Catering.
            </p>
            <div className="hero-underline" />
          </div>

          <div className="hero-design" />

          <div className="user-area">
            <div className="notification">
              <Bell size={24} />
              <span>3</span>
            </div>
            <div className="avatar">CM</div>
            <span className="user-name">Culinary Department</span>
            <span className="user-arrow">⌄</span>
          </div>
        </header>

        <SectionTitle>DEPARTMENTS</SectionTitle>

        <div className="department-grid">
          {departments.map((item) => {
            const Icon = item.icon;

            return (
              <article className="tool-card department-card" key={item.name}>
                <Icon className="department-icon" size={67} strokeWidth={1.35} />

                <h2>{item.name}</h2>
                <p>{item.description}</p>

                {item.active ? (
                  <button className="open-button">
                    OPEN <ChevronRight size={21} />
                  </button>
                ) : (
                  <div className="coming-soon">
                    {item.status} <ChevronRight size={17} />
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <SectionTitle>SHARED TOOLS</SectionTitle>

        <div className="shared-grid">
          {sharedTools.map((item) => {
            const Icon = item.icon;

            return (
              <article className="tool-card shared-card" key={item.name}>
                <Icon className="shared-icon" size={49} strokeWidth={1.35} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="coming-soon">
                  COMING SOON <ChevronRight size={16} />
                </div>
              </article>
            );
          })}
        </div>

        <section className="food-safety-banner">
          <div className="shield-wrap">
            <ShieldCheck size={48} strokeWidth={1.4} />
          </div>

          <div className="food-safety-copy">
            <h2>FOOD SAFETY DOCUMENTS</h2>
            <p>
              Quick access to food safety forms, logs, SOPs, and compliance documents.
            </p>
          </div>

          <div className="food-safety-status">
            COMING SOON <ChevronRight size={20} />
          </div>
        </section>
      </section>
    </main>
  );
}
