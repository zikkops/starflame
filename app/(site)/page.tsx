import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

// Home placeholder until M2: the page's one h1, in a plain section. The shell
// renders <main>.
export default function Home() {
  return (
    <Section>
      <Container>
        <h1 className="type-display-1">Starflames</h1>
      </Container>
    </Section>
  );
}
