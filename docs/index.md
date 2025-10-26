<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Ludus • Scrinium — Game Knowledge & Ops Portfolio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="I build small, testable pipelines that help game teams ship updates with clearer knowledge and fewer blockers. See demos, roadmaps, and write-ups.">
  <style>
    :root { --max: 70rem; --pad: 1rem; }
    body { margin: 0; font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; color: #111; }
    .wrap { max-width: var(--max); margin: 0 auto; padding: var(--pad); }
    header { padding-block: 1.25rem; }
    h1 { margin: .25rem 0; line-height: 1.2; }
    .lede { font-size: 1.1rem; max-width: 52ch; }
    nav ul, .grid { list-style: none; padding: 0; margin: 0; display: grid; gap: .75rem; }
    .grid { grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); margin-top: 1rem; }
    .card { border: 1px solid #e6e6e6; border-radius: .75rem; padding: 1rem; }
    .card h3 { margin-top: 0; font-size: 1.05rem; }
    a { color: #0b63ce; text-decoration: none; }
    a:focus, a:hover { text-decoration: underline; }
    .visually-hidden { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }
    footer { border-top: 1px solid #eee; margin-top: 1rem; padding: 1rem 0; }
  </style>
</head>
<body>
  <a class="visually-hidden" href="#main">Skip to main content</a>

  <header class="wrap" role="banner">
    <h1>Ludus • Scrinium</h1>
    <p class="lede"><strong>Portfolio by Kaosisochi Unini.</strong> I build small, testable pipelines that help game teams ship updates faster—with clearer knowledge and fewer blockers.</p>
    <nav aria-label="Primary">
      <ul class="grid" role="list">
        <li class="card">
          <h3><a href="https://github.com/ludus-scrinium/ludus-scrinium-hub/blob/main/README.md">Start here: README</a></h3>
          <p>What this lab is, how it’s organized, and how to navigate demos and docs.</p>
        </li>
        <li class="card">
          <h3><a href="https://github.com/ludus-scrinium/ludus-scrinium-hub/blob/main/docs/roadmap.md">Roadmap</a></h3>
          <p>Week-by-week plan across 44 weeks with shipped and upcoming artifacts.</p>
        </li>
      </ul>
    </nav>
  </header>

  <main id="main" class="wrap">
    <section aria-labelledby="projects">
      <h2 id="projects">Work samples</h2>
      <div class="grid" role="list">
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/playlens/blob/main/README.md">PlayLens</a></h3>
          <p>Before/after UX demos that measure menu friction. Output: 60–90s clips + CSV metrics.</p>
        </article>
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/patch-notes-oracle/blob/main/README.md">Patch Notes Oracle</a></h3>
          <p>Patch note triage and templates that align CS, localization, and player comms.</p>
        </article>
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/localization-conveyor/blob/main/README.md">Localization Conveyor</a></h3>
          <p>String-first workflows and checklists for simultaneous regional releases.</p>
        </article>
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/asset-atlas/blob/main/README.md">Asset Atlas</a></h3>
          <p>Searchable asset repository with tags and fields for reuse across teams.</p>
        </article>
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/creator-ops-kit/blob/main/README.md">Creator Ops Kit</a></h3>
          <p>Intake, license picker, and audit trail for community content partnerships.</p>
        </article>
        <article class="card" role="listitem">
          <h3><a href="https://github.com/ludus-scrinium/producers-almanac/blob/main/README.md">Producer’s Almanac</a></h3>
          <p>Lightweight governance: issue/PR templates, labels, and release hygiene.</p>
        </article>
      </div>
    </section>

    <section aria-labelledby="about">
      <h2 id="about">About this portfolio</h2>
      <p>This is a live, public lab. I ship small, test them in the open, and document the changes. Each repo includes a README, a demo, and a short write-up of what improved and why.</p>
    </section>
  </main>

  <footer class="wrap">
    <p>&copy; <span id="y">2025</span> Kaosisochi Unini • <a href="mailto:contact@example.com">Contact</a></p>
    <script>document.getElementById('y').textContent = new Date().getFullYear();</script>
  </footer>
</body>
</html>

