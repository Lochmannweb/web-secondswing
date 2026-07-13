import type { LegalBlock, LegalDocument } from "@/app/Content/legal";
import "./legal.css";

function renderContactLine(line: string) {
  const emailMatch = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);

  if (!emailMatch) {
    return line;
  }

  const email = emailMatch[0];
  const [before, after] = line.split(email);

  return (
    <>
      {before}
      <a href={`mailto:${email}`}>{email}</a>
      {after}
    </>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "paragraph") {
    return <p className="legal-paragraph">{block.text}</p>;
  }

  if (block.type === "list") {
    return (
      <ul className="legal-list">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="legal-contact">
      {block.lines.map((line) => (
        <p key={line} className="legal-contact-line">
          {renderContactLine(line)}
        </p>
      ))}
    </div>
  );
}

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <article className="legal-document">
      {document.sections.map((section) => (
        <section key={section.title} className="legal-section">
          <h2 className="legal-section-title">{section.title}</h2>
          {section.blocks.map((block, index) => (
            <LegalBlockView key={`${section.title}-${index}`} block={block} />
          ))}
        </section>
      ))}
      {document.closingNote ? (
        <p className="legal-closing">{document.closingNote}</p>
      ) : null}
    </article>
  );
}

type LegalStandalonePageProps = {
  document: LegalDocument;
};

export function LegalStandalonePage({ document }: LegalStandalonePageProps) {
  return (
    <div className="legal-page">
      <header className="legal-page-header">
        <p className="legal-kicker">{document.kicker}</p>
        <h1 className="legal-title">{document.title}</h1>
        <p className="legal-updated">Senest opdateret: {document.updatedAt}</p>
      </header>
      <LegalDocumentView document={document} />
    </div>
  );
}
