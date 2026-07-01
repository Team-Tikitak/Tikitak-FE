import { Navigate, useNavigate, useParams } from 'react-router';
import { PageShell } from '@/app/layout';
import { PATHS } from '@/app/routes/paths';
import { Header } from '@/shared/ui';
import {
  LEGAL_DOCS,
  type LegalBlock,
  type LegalDocType,
  type LegalListItem,
} from '../constants/legalDocuments';

const isLegalDocType = (value: string | undefined): value is LegalDocType =>
  value === 'service' || value === 'privacy';

const openUrl = (url: string) => window.open(url, '_blank', 'noopener,noreferrer');
const openTel = (phone: string) => window.open(`tel:${phone.replace(/[^0-9]/g, '')}`);

const linkClassName = 'text-gray-900 underline underline-offset-2';

const LinkListItem = ({ item }: { item: Exclude<LegalListItem, string> }) => {
  const { text, url, urlLabel, phone } = item;
  return (
    <span className="min-w-0 flex-1">
      {text}:{' '}
      <button type="button" onClick={() => openUrl(url)} className={`break-all ${linkClassName}`}>
        {urlLabel ?? url}
      </button>
      {phone && (
        <>
          {' / ☎ '}
          <button type="button" onClick={() => openTel(phone)} className={linkClassName}>
            {phone}
          </button>
        </>
      )}
    </span>
  );
};

const BlockView = ({ block }: { block: LegalBlock }) => {
  if (block.type === 'paragraph') {
    return <p className="body-3 whitespace-pre-line text-gray-700">{block.text}</p>;
  }
  if (block.type === 'subheading') {
    return <p className="body-3 font-semibold text-gray-900">{block.text}</p>;
  }
  if (block.type === 'list') {
    return (
      <ul className="flex flex-col gap-1.5">
        {block.items.map((item) => {
          const isLink = typeof item !== 'string';
          return (
            <li key={isLink ? item.text : item} className="flex gap-2 body-3 text-gray-700">
              <span aria-hidden className="shrink-0 text-gray-400">
                ·
              </span>
              {isLink ? <LinkListItem item={item} /> : <span className="min-w-0 flex-1">{item}</span>}
            </li>
          );
        })}
      </ul>
    );
  }
  return (
    <p className="body-3 whitespace-pre-line rounded-lg bg-gray-100 px-4 py-3 text-gray-600">
      {block.text}
    </p>
  );
};

export const TermsDetailPage = () => {
  const navigate = useNavigate();
  const { docType } = useParams<{ docType: string }>();

  if (!isLegalDocType(docType)) {
    return <Navigate to={PATHS.TERMS} replace />;
  }

  const doc = LEGAL_DOCS[docType];

  return (
    <PageShell
      header={<Header title={doc.title} showBackButton onBack={() => navigate(-1)} />}
      contentClassName="flex flex-col gap-8 px-5 py-6"
    >
      {(doc.intro || doc.meta) && (
        <section className="flex flex-col gap-3">
          {doc.intro && <p className="body-3 text-gray-700">{doc.intro}</p>}
          {doc.meta && (
            <ul className="flex flex-col gap-1">
              {doc.meta.map((line) => (
                <li key={line} className="body-3 text-gray-500">
                  {line}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {doc.sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-3">
          {section.heading && <h2 className="body-1 text-black">{section.heading}</h2>}
          {section.blocks.map((block, index) => (
            <BlockView key={index} block={block} />
          ))}
        </section>
      ))}

      {doc.footer && (
        <footer className="flex flex-col gap-1 pt-2">
          {doc.footer.map((line) => (
            <p key={line} className="body-3 text-gray-400">
              {line}
            </p>
          ))}
        </footer>
      )}
    </PageShell>
  );
};
