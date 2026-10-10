import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "@/components/contact/ContactForm";
import { CrescentIcon, FourPointStarIcon } from "@/components/icons/glyphs";
import { Container } from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Send Starflames a note: questions about an order, help choosing a gift, or anything about our scents and candles.",
};

/** Small twinkling stars scattered around the letter (decorative). */
const SPARKS = [
  { top: "6%", left: "4%", size: "size-3", delay: "0s" },
  { top: "18%", left: "92%", size: "size-4", delay: "1.2s" },
  { top: "52%", left: "-2%", size: "size-2.5", delay: "2.1s" },
  { top: "78%", left: "96%", size: "size-3", delay: "0.6s" },
  { top: "94%", left: "10%", size: "size-2", delay: "1.7s" },
];

/** /contact (user request, 2026-10-10): a whimsical contact page. */
export default function ContactPage() {
  return (
    <section
      data-band="plain"
      aria-labelledby="contact-heading"
      className="pt-10 md:pt-14"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-4">
            <CrescentIcon
              decorative
              className="contact-moon size-14 text-gold-300"
            />
            <p className="mt-6 type-eyebrow text-text-accent">Contact us</p>
            <h1
              id="contact-heading"
              className="mt-3 type-display-2 text-text-primary"
            >
              Send a note by starlight
            </h1>
            <p className="mt-5 type-body-lg text-text-secondary">
              Lost a parcel among the clouds? Torn between two scents? Planning
              a gift for someone who loves the night? Write to us, and a falling
              star will carry your note straight to our desk.
            </p>
            <ul className="mt-8 flex flex-col gap-4 type-body text-text-secondary">
              <li className="flex gap-3">
                <FourPointStarIcon className="mt-1.5 size-3.5 shrink-0 text-gold-300" />
                Questions about an order, shipping or a gift
              </li>
              <li className="flex gap-3">
                <FourPointStarIcon className="mt-1.5 size-3.5 shrink-0 text-gold-300" />
                Help finding the scent that suits your evenings
              </li>
              <li className="flex gap-3">
                <FourPointStarIcon className="mt-1.5 size-3.5 shrink-0 text-gold-300" />
                Ideas, kind words and the occasional poem
              </li>
            </ul>
            <p className="mt-8 type-body text-text-secondary">
              Still browsing?{" "}
              <Link
                href="/shop"
                className="text-link underline underline-offset-[0.2em] hover:text-link-hover"
              >
                Wander through the shop
              </Link>
              .
            </p>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            {/* The letter: a raised card with a starlit border and sparks. */}
            <div className="relative">
              {SPARKS.map((spark) => (
                <span
                  key={`${spark.top}-${spark.left}`}
                  aria-hidden="true"
                  className="contact-spark absolute"
                  style={{
                    top: spark.top,
                    left: spark.left,
                    animationDelay: spark.delay,
                  }}
                >
                  <FourPointStarIcon
                    className={`${spark.size} text-gold-300`}
                  />
                </span>
              ))}
              <div className="relative rounded-lg border border-gold-400/30 bg-bg-raised/90 p-6 shadow-raised md:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-10 top-0 h-px bg-(image:--gradient-starlight-rule)"
                />
                <p className="mb-8 type-h3 text-gold-300 italic">
                  Dear Starflames,
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
