// Landing page — hero, project cards, tool cards, pattern cards.
// Requirement: the SSG pass renders this with the pattern manifest passed as a
//   prop (crawlers need real links without running JS); the client render
//   fetches the manifest and replaces the grid. `prerender` also disables the
//   scroll-in animation classes: without JS nothing would ever lift
//   scroll-animate's opacity:0, so the static output must not carry it.
import { useEffect, useRef, useState } from 'react';
import { HERO, PROJECTS, TOOLS } from '../data/homeContent.js';

const BASE = import.meta.env.BASE_URL;

// Scroll-triggered fade-in: observe every .scroll-animate under the container,
// add .animate-in on first intersection. Observer disconnected on unmount.
function useScrollAnimate(containerRef, deps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    container.querySelectorAll('.scroll-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// Card tap behavior: tapping a card reveals its action links (card-active);
// tapping outside deactivates. One document listener, released on unmount.
function useActiveCard() {
  const [activeId, setActiveId] = useState(null);
  useEffect(() => {
    if (activeId === null) return;
    const onDocClick = (e) => {
      if (!e.target.closest('[data-card-id="' + activeId + '"]')) setActiveId(null);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [activeId]);

  const toggle = (id, e) => {
    if (e.target.closest('.card-links a')) return;   // let link clicks through
    setActiveId((current) => (current === id ? null : id));
  };
  return [activeId, toggle];
}

function cardClass(animate, active, delay) {
  return 'card bg-base-200/50 border border-base-300 card-interactive' +
    (animate ? ' scroll-animate' : '') +
    (active ? ' card-active' : '');
}

function ProjectCard({ project, animate, active, onToggle, delay }) {
  return (
    <div
      className={cardClass(animate, active)}
      data-delay={animate ? delay : undefined}
      data-card-id={project.slug}
      onClick={(e) => onToggle(project.slug, e)}
    >
      <div className="card-body">
        <h3 className="card-title text-base">
          {project.title}
          {project.badges.map((b) => (
            <span key={b.label} className={`badge badge-sm ${b.primary ? 'badge-primary' : 'badge-ghost'}`}>
              {b.label}
            </span>
          ))}
        </h3>
        <p className="text-sm text-base-content/70 grow">{project.description}</p>
        <div className="mt-auto pt-2">
          <p className="text-xs text-base-content/40">{project.tech}</p>
          <div className="card-links">
            <a href={`${BASE}projects/${project.slug}/`} className="btn btn-sm btn-primary rounded-full">Details</a>
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener" className="btn btn-sm btn-outline rounded-full">Live app</a>
            )}
            {project.source && (
              <a href={project.source} target="_blank" rel="noopener" className="btn btn-sm btn-outline rounded-full">Source</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, animate, active, onToggle, delay }) {
  const id = tool.slug || tool.title;
  return (
    <div
      className={cardClass(animate, active)}
      data-delay={animate ? delay : undefined}
      data-card-id={id}
      onClick={(e) => onToggle(id, e)}
    >
      <div className="card-body py-4">
        <h4 className="font-semibold text-base mb-1">
          {tool.title}{' '}
          <span className="badge badge-ghost badge-sm">{tool.badge}</span>
        </h4>
        <p className="text-sm text-base-content/70">{tool.description}</p>
        <div className="card-links">
          {tool.claudeMd && (
            <a href={`${BASE}CLAUDE.md`} className="btn btn-sm btn-primary rounded-full">CLAUDE.md</a>
          )}
          {tool.slug && (
            <a href={`${BASE}projects/${tool.slug}/`} className="btn btn-sm btn-primary rounded-full">Details</a>
          )}
          {tool.live && (
            <a href={tool.live.href} target="_blank" rel="noopener" className="btn btn-sm btn-outline rounded-full">{tool.live.label}</a>
          )}
          {tool.source && (
            <a href={tool.source} target="_blank" rel="noopener" className="btn btn-sm btn-outline rounded-full">Source</a>
          )}
        </div>
      </div>
    </div>
  );
}

function PatternCard({ pattern, animate, active, onToggle, delay }) {
  return (
    <div
      className={cardClass(animate, active)}
      data-delay={animate ? delay : undefined}
      data-card-id={pattern.slug}
      onClick={(e) => onToggle(pattern.slug, e)}
    >
      <div className="card-body">
        <h4 className="font-semibold text-base mb-1">{pattern.title}</h4>
        <p className="text-sm text-base-content/70 grow">{pattern.description}</p>
        <div className="mt-auto pt-2">
          {pattern.tags.length > 0 && (
            <p className="text-xs text-base-content/40">{pattern.tags.join(' · ')}</p>
          )}
          <div className="card-links">
            <a href={`${BASE}patterns/${encodeURIComponent(pattern.slug)}/`} className="btn btn-sm btn-primary rounded-full">
              View pattern
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage({ patterns: initialPatterns = null, prerender = false }) {
  const animate = !prerender;
  const containerRef = useRef(null);
  const [activeId, toggleActive] = useActiveCard();
  const [patterns, setPatterns] = useState(initialPatterns);
  const [patternsError, setPatternsError] = useState(false);

  // Client fetch of the pattern manifest (the SSG pass passes it as a prop
  // instead). Abort on unmount.
  useEffect(() => {
    if (prerender || patterns) return;
    const controller = new AbortController();
    fetch(`${BASE}patterns/manifest.json`, { signal: controller.signal })
      .then((r) => r.json())
      .then((manifest) => setPatterns(manifest.patterns))
      .catch((err) => {
        if (err && err.name !== 'AbortError') setPatternsError(true);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useScrollAnimate(containerRef, [patterns]);

  return (
    <div ref={containerRef}>
      <header className="pt-4 pb-6 animate-fade-in-up">
        {/* Primary→accent gradient auto-matches every theme combo; monochrome
            themes degrade to solid text, matching their minimalism. */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-2xl mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {HERO.title}
        </h1>
        <p className="text-base-content/60 text-lg max-w-xl">{HERO.subtitle}</p>
      </header>

      <section id="projects" className="mb-12">
        <h2 className={`text-2xl font-bold mb-2${animate ? ' scroll-animate' : ''}`}>Projects</h2>
        <p className={`text-base-content/60 mb-6 max-w-xl${animate ? ' scroll-animate' : ''}`}>
          User-facing applications — each solves a real problem.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project, i) => (
            <ProjectCard
              key={project.slug}
              project={project}
              animate={animate}
              active={activeId === project.slug}
              onToggle={toggleActive}
              delay={String((i % 3) + 1)}
            />
          ))}
        </div>
      </section>

      <section id="tools" className="mb-12">
        <h2 className={`text-2xl font-bold mb-2${animate ? ' scroll-animate' : ''}`}>Internal Tools</h2>
        <p className={`text-base-content/60 mb-6 max-w-xl${animate ? ' scroll-animate' : ''}`}>
          Infrastructure, analytics, and supporting repositories.
        </p>
        <div className="space-y-3">
          {TOOLS.map((tool, i) => (
            <ToolCard
              key={tool.title}
              tool={tool}
              animate={animate}
              active={activeId === (tool.slug || tool.title)}
              onToggle={toggleActive}
              delay={String((i % 4) + 1)}
            />
          ))}
        </div>
      </section>

      <section id="patterns" className="mb-12">
        <h2 className={`text-2xl font-bold mb-2${animate ? ' scroll-animate' : ''}`}>Patterns</h2>
        <p className={`text-base-content/60 mb-6 max-w-xl${animate ? ' scroll-animate' : ''}`}>
          Reusable implementation patterns extracted from real projects. Each is documented with
          requirements, approach, alternatives considered, and key lessons.{' '}
          <a href={`${BASE}CLAUDE.md`} className="link link-primary">View full reference</a>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {patterns ? (
            patterns.map((pattern, i) => (
              <PatternCard
                key={pattern.slug}
                pattern={pattern}
                animate={animate}
                active={activeId === pattern.slug}
                onToggle={toggleActive}
                delay={String((i % 3) + 1)}
              />
            ))
          ) : (
            <p className="text-base-content/40 text-sm col-span-full text-center py-8">
              {patternsError ? 'Could not load patterns.' : 'Loading patterns...'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
