/* Generates test/sample.pdf — 8 pages of text with a nested outline, for development. */
const fs = require('fs');
const path = require('path');

const PAGES = 8;
const PAGE_OBJ = (i) => 11 + (i - 1) * 2; // page i object number
const CONTENT_OBJ = (i) => 12 + (i - 1) * 2;

const LOREM = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod',
  'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim',
  'veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea',
  'commodo consequat. Duis aute irure dolor in reprehenderit in voluptate',
  'velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint',
  'occaecat cupidatat non proident, sunt in culpa qui officia deserunt',
  'mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus',
  'error sit voluptatem accusantium doloremque laudantium, totam rem',
  'aperiam, eaque ipsa quae ab illo inventore veritatis et quasi',
  'architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam',
  'voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia',
  'consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
  'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,',
  'consectetur, adipisci velit, sed quia non numquam eius modi tempora',
  'incidunt ut labore et dolore magnam aliquam quaerat voluptatem.',
];

const TITLES = [
  'Introduction', 'Getting Around', 'The Middle Chapters', 'Details on Layout',
  'Annotations at Work', 'Interlude', 'Conclusion', 'Appendix',
];

function pageContent(i) {
  const lines = [];
  lines.push('BT');
  lines.push('/F2 22 Tf');
  lines.push('72 700 Td');
  lines.push(`(${i}.  ${TITLES[i - 1]}) Tj`);
  lines.push('ET');
  lines.push('BT');
  lines.push('/F1 12 Tf');
  lines.push('17 TL');
  lines.push('72 655 Td');
  const start = (i * 3) % LOREM.length;
  for (let k = 0; k < 24; k++) {
    const text = LOREM[(start + k) % LOREM.length];
    lines.push(k === 0 ? `(${text}) Tj` : `(${text}) '`);
  }
  lines.push('ET');
  if (i === 1) {
    lines.push('BT');
    lines.push('0 0 0.8 rg');
    lines.push('/F1 12 Tf');
    lines.push('72 200 Td');
    lines.push('(See: 7. Conclusion  \\(internal link\\)) Tj');
    lines.push('ET');
    lines.push('BT');
    lines.push('0 0 0.8 rg');
    lines.push('/F1 12 Tf');
    lines.push('72 176 Td');
    lines.push('(https://example.org  \\(external link\\)) Tj');
    lines.push('ET');
  }
  lines.push('BT');
  lines.push('0 0 0 rg');
  lines.push('/F1 10 Tf');
  lines.push(`290 40 Td`);
  lines.push(`(- ${i} -) Tj`);
  lines.push('ET');
  return lines.join('\n');
}

const objects = new Map(); // num -> body (between "N 0 obj" and "endobj")

const kids = Array.from({ length: PAGES }, (_, k) => `${PAGE_OBJ(k + 1)} 0 R`).join(' ');
objects.set(1, `<< /Type /Catalog /Pages 2 0 R /Outlines 5 0 R /PageMode /UseNone >>`);
objects.set(2, `<< /Type /Pages /Kids [${kids}] /Count ${PAGES} >>`);
objects.set(3, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
objects.set(4, `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

const dest = (p) => `[${PAGE_OBJ(p)} 0 R /XYZ null null null]`;
objects.set(5, `<< /Type /Outlines /First 6 0 R /Last 10 0 R /Count 5 >>`);
objects.set(6, `<< /Title (1  Introduction) /Parent 5 0 R /Next 7 0 R /Dest ${dest(1)} >>`);
objects.set(7, `<< /Title (2  The Middle Chapters) /Parent 5 0 R /Prev 6 0 R /Next 10 0 R /First 8 0 R /Last 9 0 R /Count 2 /Dest ${dest(3)} >>`);
objects.set(8, `<< /Title (2.1  Details on Layout) /Parent 7 0 R /Next 9 0 R /Dest ${dest(4)} >>`);
objects.set(9, `<< /Title (2.2  Annotations at Work) /Parent 7 0 R /Prev 8 0 R /Dest ${dest(5)} >>`);
objects.set(10, `<< /Title (3  Conclusion) /Parent 5 0 R /Prev 7 0 R /Dest ${dest(7)} >>`);

const LINK1 = 27, LINK2 = 28;
for (let i = 1; i <= PAGES; i++) {
  const annots = i === 1 ? ` /Annots [${LINK1} 0 R ${LINK2} 0 R]` : '';
  objects.set(PAGE_OBJ(i),
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ` +
    `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >>${annots} /Contents ${CONTENT_OBJ(i)} 0 R >>`);
  const stream = pageContent(i);
  objects.set(CONTENT_OBJ(i),
    `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
}

objects.set(LINK1,
  `<< /Type /Annot /Subtype /Link /Rect [70 194 268 214] /Border [0 0 0] ` +
  `/Dest [${PAGE_OBJ(7)} 0 R /XYZ null 720 null] >>`);
objects.set(LINK2,
  `<< /Type /Annot /Subtype /Link /Rect [70 170 268 190] /Border [0 0 0] ` +
  `/A << /Type /Action /S /URI /URI (https://example.org) >> >>`);

let out = '%PDF-1.4\n';
const offsets = [];
const maxObj = Math.max(...objects.keys());
for (let n = 1; n <= maxObj; n++) {
  offsets[n] = Buffer.byteLength(out);
  out += `${n} 0 obj\n${objects.get(n)}\nendobj\n`;
}
const xrefPos = Buffer.byteLength(out);
out += `xref\n0 ${maxObj + 1}\n`;
out += '0000000000 65535 f \n';
for (let n = 1; n <= maxObj; n++) {
  out += String(offsets[n]).padStart(10, '0') + ' 00000 n \n';
}
out += `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;

const outPath = path.join(__dirname, '..', 'test', 'sample.pdf');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out, 'binary');
console.log('wrote', outPath, Buffer.byteLength(out), 'bytes');
