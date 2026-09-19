import { site } from "../data/site";
import { Reveal } from "./Reveal";

export function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-heading">
      <div className="contact-grid" aria-hidden="true" />
      <div className="wrap">
        <Reveal>
          <p className="kicker">03 / Contact</p>
          <h2 id="contact-heading" className="contact-title">
            Have a product
            <br />
            that needs to perform?
          </h2>
          <p className="section-lede">
            I am most useful on production web systems — migrations, SEO surfaces, and integrations that have to hold SLA.
          </p>
        </Reveal>
        <div className="contact-actions">
          <div className="hero-actions contact-cta">
            <a className="btn btn-primary btn-lg" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <a className="btn btn-ghost btn-lg" href={site.resumePath} download>
              Download resume
            </a>
          </div>
          <div className="contact-links">
            <a href={site.social.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a href={site.social.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={site.resumePath} download>
              Download resume
            </a>
            <a href={site.phoneHref}>{site.phone}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <p className="mono">© {new Date().getFullYear()} {site.name}</p>
        <p>Bengaluru · Full Stack Engineer</p>
        <a href="#home">Back to top</a>
      </div>
    </footer>
  );
}
