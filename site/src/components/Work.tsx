import { useState } from "react";
import { experience, projects, site } from "../data/site";
import { Reveal } from "./Reveal";
import type { Project } from "../data/site";

const featured = projects.filter((p) => p.featured);

export function Work() {
  const [active, setActive] = useState(0);
  const role = experience[active];
  const { about } = site;

  if (!role) return null;

  return (
    <section id="work" className="section" aria-labelledby="work-heading">
      <div className="wrap">
        <Reveal>
          <p className="kicker">01 / Work</p>
          <h2 id="work-heading" className="section-title">
            {about.heading}
          </h2>
        </Reveal>

        <div className="about-grid">
          <div className="about-copy">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 28)}>{p}</p>
            ))}
          </div>
          <aside className="about-aside">
            <p className="mono aside-label">{about.aside.label}</p>
            <dl>
              {about.aside.items.map((item) => (
                <div key={item.k}>
                  <dt>{item.k}</dt>
                  <dd>{item.v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        <div className="block">
          <p className="block-label">Experience</p>
          <div className="exp">
            <div className="exp-rail" role="tablist" aria-label="Roles">
              {experience.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-controls="exp-panel"
                  id={`exp-tab-${item.id}`}
                  className={`exp-tab ${i === active ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="mono">{item.dates}</span>
                  <strong>{item.company}</strong>
                  <em>{item.role}</em>
                </button>
              ))}
            </div>

            <article
              id="exp-panel"
              className="exp-panel"
              role="tabpanel"
              aria-labelledby={`exp-tab-${role.id}`}
            >
              <header>
                <p className="mono">{role.location}</p>
                <h3>
                  {role.role} <span>at {role.company}</span>
                </h3>
                <p className="exp-summary">{role.summary}</p>
              </header>
              <ul className="exp-points">
                {role.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <ul className="chips" aria-label="Technologies">
                {role.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>

        <div className="block">
          <p className="block-label">Selected work</p>
          <ul className="work-list">
            {featured.map((project) => (
              <li key={project.id}>
                <WorkItem project={project} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function WorkItem({ project }: { project: Project }) {
  return (
    <article className="work-item">
      <span className="mono work-index">{project.index}</span>
      <div className="work-body">
        <p className="work-context">{project.context}</p>
        <h3>{project.name}</h3>
        <p>{project.solution}</p>
        <ul className="chips">
          {project.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      {project.metric ? (
        <p className="work-metric">
          {project.metric}
          <small>{project.metricLabel}</small>
        </p>
      ) : null}
      <WorkVisual type={project.visual} />
    </article>
  );
}

function WorkVisual({ type }: { type: Project["visual"] }) {
  if (type === "migration") {
    return (
      <div className="viz viz-compact" aria-hidden="true">
        <span>Angular</span>
        <b>→</b>
        <span className="is-on">Express</span>
      </div>
    );
  }
  if (type === "whitelabel") {
    return (
      <div className="viz viz-compact viz-tenants-mini" aria-hidden="true">
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </div>
    );
  }
  return (
    <div className="viz viz-compact viz-ssr-mini" aria-hidden="true">
      <i />
      <i className="is-on" />
    </div>
  );
}
