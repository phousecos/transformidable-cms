"use client";
import { useState } from "react";
import { DOMAINS } from "./governanceDomains";

export function MechanismExplorer() {
  const [active, setActive] = useState(DOMAINS[0].code);
  const domain = DOMAINS.find((d) => d.code === active) || DOMAINS[0];

  return (
    <div>
      <div className="mech-grid" role="tablist" aria-label="Governance domains">
        {DOMAINS.map((d) => (
          <button
            key={d.code}
            type="button"
            role="tab"
            aria-selected={d.code === active}
            aria-controls="mech-panel"
            className={`mech-tile${d.code === active ? " is-active" : ""}`}
            onClick={() => setActive(d.code)}
          >
            <span className="mt-code">{d.code}</span>
            <span className="mt-name">{d.name}</span>
          </button>
        ))}
      </div>

      <div className="mech-panel" id="mech-panel" role="tabpanel" aria-live="polite">
        <p className="case-h" style={{ marginBottom: 6 }}>{domain.code}</p>
        <h2 className="mp-h">{domain.name}</h2>
        <p className="mp-q">{domain.question}</p>
        <div className="prose" style={{ marginTop: 20 }}>
          <p>{domain.definition}</p>
          <p><strong>Includes:</strong> {domain.includes}</p>
          {domain.note && <p><em>{domain.note}</em></p>}
        </div>
      </div>
    </div>
  );
}
