import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Work } from "./components/Work";
import { Practice } from "./components/Practice";
import { Contact, Footer } from "./components/Contact";

export default function App() {
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Work />
        <Practice />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
