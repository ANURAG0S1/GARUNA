import { NavLink, useLocation } from "react-router-dom";

export function NavBar() {
  const location = useLocation();
  const linkClass = ({ isActive }: { isActive: boolean }) => "nav-link" + (isActive ? " active" : "");
  const newInvoiceActive = location.pathname === "/new" || location.pathname.startsWith("/edit/");

  return (
    <header className="app-nav noprint">
      <div className="nav-brand">🧾 Invoice Generator</div>
      <nav className="nav-links">
        <NavLink to="/" end className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/new" className={"nav-link" + (newInvoiceActive ? " active" : "")}>
          New Invoice
        </NavLink>
        <NavLink to="/clients" className={linkClass}>
          Clients
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          Settings
        </NavLink>
      </nav>
    </header>
  );
}
