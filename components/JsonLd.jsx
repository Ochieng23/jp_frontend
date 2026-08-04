/**
 * Renders a JSON-LD structured-data script tag safely.
 *
 * JSON.stringify alone is not enough when the data contains strings from
 * the database (job descriptions, names): a literal "</script>" inside a
 * string would terminate the script element and let the remainder be
 * parsed as HTML. Escaping "<" (plus U+2028/U+2029, which are valid JSON
 * but illegal in JS source) closes that hole - the same mitigation
 * Next.js applies to its own inline JSON payloads.
 */
export default function JsonLd({ data }) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
