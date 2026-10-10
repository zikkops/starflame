"use client";

import { useState } from "react";

import { Container } from "@/components/layout/Container";
import { primaryButtonClasses } from "@/components/ui/button";

/**
 * "Join the night list" (home.md §8). Visual only for now (user request,
 * 2026-10-10): nothing is sent or stored; a valid address shows the thank-you
 * state in place. M2.7 connects it.
 */
export function HomeNewsletter() {
  const [done, setDone] = useState(false);
  return (
    <section
      id="newsletter"
      data-band="sunken"
      aria-labelledby="newsletter-heading"
    >
      <Container>
        <div className="mx-auto max-w-[36rem] text-center">
          <p className="type-eyebrow text-text-accent">Letters by starlight</p>
          <h2
            id="newsletter-heading"
            className="mt-3 type-h2 text-text-primary"
          >
            Join the night list
          </h2>
          <p className="mt-4 type-body-lg text-text-secondary">
            New scents, limited runs and the occasional quiet evening idea. A
            few letters a month, never more.
          </p>
          <div aria-live="polite">
            {done ? (
              <p className="mt-8 type-body-lg text-gold-300">
                Thank you. Your first letter is on its way.
              </p>
            ) : (
              <form
                className="mt-8 flex flex-col gap-3 md:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  setDone(true);
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="min-h-(--size-touch) flex-1 rounded-md border border-border-control bg-bg-page px-4 type-body text-text-primary placeholder:text-text-muted"
                />
                <button type="submit" className={primaryButtonClasses()}>
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
