import { useEffect, useState } from "react";
import { nav } from "../data/site";
import { useActiveSection } from "../hooks/useActiveSection";

const links = [{ id: "home", label: "Home" }, ...nav] as const;
const sectionIds = ["home", ...nav.map((n) => n.id)] as const;

export function Navbar() {
  const active = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const main = document.getElementById("main");
    if (main) {
      if (open) main.setAttribute("inert", "");
      else main.removeAttribute("inert");
    }
    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => setOpen(false);

  return (
    <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="nav-inner">
        <a href="#home" className="nav-mark" onClick={close}>
          anurag
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={active === item.id ? "is-active" : ""}
              aria-current={active === item.id ? "location" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn btn-primary nav-cta">
          Let’s talk
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span className={`nav-burger ${open ? "is-open" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`nav-drawer ${open ? "is-open" : ""}`}
        hidden={!open}
        aria-hidden={!open}
      >
        <nav className="nav-drawer-links" aria-label="Mobile">
          {links.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={close}
              className={active === item.id ? "is-active" : ""}
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" className="btn btn-primary" onClick={close}>
            Let’s talk
          </a>
        </nav>
      </div>
    </header>
  );
}
