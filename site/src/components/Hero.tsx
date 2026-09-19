import { site } from "../data/site";

export function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-heading">
      <div className="hero-glow" aria-hidden="true" />
      <div className="wrap hero-layout">
        <p className="hero-chip">{site.hero.eyebrow}</p>
        <div className="hero-copy">
          <h1 id="hero-heading">
            <span className="hero-line">The full stack</span>
            <span className="hero-line">in production</span>
          </h1>
          <p className="hero-lede">{site.hero.lede}</p>
          <div className="hero-actions">
            <a href="#work" className="btn btn-primary">
              View work
            </a>
            <a href="#contact" className="btn btn-ghost">
              Let’s talk
            </a>
          </div>
        </div>
        <ul className="hero-cloud" aria-label="Stack">
          {site.hero.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
