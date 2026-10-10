"use client";

import { useRef, useState } from "react";

import { FourPointStarIcon } from "@/components/icons/glyphs";
import { primaryButtonClasses } from "@/components/ui/button";

const TOPICS = [
  "A question about an order",
  "Choosing a gift",
  "Scents and candles",
  "Something else entirely",
];

const FIELD =
  "w-full rounded-md border border-border-control bg-bg-page/70 px-4 py-3 type-body text-text-primary placeholder:text-text-muted transition-colors focus:border-gold-400";

/**
 * The contact form (user request, 2026-10-10). Visual only for now: nothing is
 * sent or stored. A valid note shows the "sent by starlight" state in place.
 */
export function ContactForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  if (sentTo !== null) {
    return (
      <div className="contact-sent flex flex-col items-center py-10 text-center">
        <span
          aria-hidden="true"
          className="contact-sent-star relative block h-24 w-40"
        >
          <FourPointStarIcon className="absolute top-0 right-0 size-6 text-gold-300" />
        </span>
        <h2
          ref={heading}
          tabIndex={-1}
          className="mt-2 type-h2 text-text-primary outline-none"
        >
          Your note is on its way
        </h2>
        <p className="max-w-md mt-4 type-body-lg text-text-secondary">
          Thank you{sentTo ? `, ${sentTo}` : ""}. We have tucked it under the
          night sky, and we will write back as soon as the next star rises.
        </p>
        <button
          type="button"
          onClick={() => setSentTo(null)}
          className="mt-8 min-h-(--size-touch) type-nav text-link underline underline-offset-[0.2em] hover:text-link-hover"
        >
          Write another note
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name =
          String(data.get("name") ?? "")
            .trim()
            .split(/\s+/)[0] ?? "";
        setSentTo(name);
        requestAnimationFrame(() => heading.current?.focus());
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-2 block type-nav text-text-primary"
          >
            Your name
          </label>
          <input
            id="contact-name"
            name="name"
            required
            autoComplete="name"
            placeholder="Wanderer of the night"
            className={FIELD}
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block type-nav text-text-primary"
          >
            Email address
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-topic"
          className="mb-2 block type-nav text-text-primary"
        >
          What is on your mind?
        </label>
        <select
          id="contact-topic"
          name="topic"
          className={FIELD}
          defaultValue={TOPICS[0]}
        >
          {TOPICS.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-2 block type-nav text-text-primary"
        >
          Your note
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          placeholder="Dear Starflames, on a quiet evening I was wondering…"
          className={`${FIELD} resize-y`}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 type-body text-text-secondary">
        <input
          type="checkbox"
          name="stardust"
          defaultChecked
          className="mt-1 size-5 shrink-0 accent-gold-400"
        />
        <span>Sprinkle a little stardust on my reply</span>
      </label>

      <div>
        <button type="submit" className={primaryButtonClasses()}>
          Send by starlight
        </button>
      </div>
    </form>
  );
}
