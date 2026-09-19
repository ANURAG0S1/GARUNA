import { Navigate, Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { ToastProvider } from "./components/Toast";
import { Dashboard } from "./pages/Dashboard";
import { InvoiceForm } from "./pages/InvoiceForm";
import { InvoicePreview } from "./pages/InvoicePreview";
import { Clients } from "./pages/Clients";
import { Settings } from "./pages/Settings";

export function App() {
  return (
    <ToastProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<InvoiceForm />} />
        <Route path="/edit/:id" element={<InvoiceForm />} />
        <Route path="/view/:id" element={<InvoicePreview />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
