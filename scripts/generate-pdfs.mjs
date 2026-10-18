import fs from 'fs';
import path from 'path';

function createPdf(title, subtitle, sections) {
  // Simple PDF generator conforming to PDF-1.4 spec
  // Page size A4: 595 x 842 pt
  const escapePdfText = (str) => {
    return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  };

  let stream = '';
  // Background header band
  stream += `q\n`;
  stream += `0.859 0.016 0 rg\n`; // Terra red #DB0000
  stream += `0 770 595 72 re f\n`;
  stream += `Q\n`;

  // Header Title
  stream += `BT\n`;
  stream += `/F2 20 Tf\n`;
  stream += `1 1 1 rg\n`; // White
  stream += `40 805 Td\n`;
  stream += `(${escapePdfText(title)}) Tj\n`;
  stream += `ET\n`;

  // Subtitle
  stream += `BT\n`;
  stream += `/F1 10 Tf\n`;
  stream += `1 0.9 0.9 rg\n`;
  stream += `40 785 Td\n`;
  stream += `(${escapePdfText(subtitle)}) Tj\n`;
  stream += `ET\n`;

  let y = 735;
  for (const sec of sections) {
    if (y < 80) break;
    // Section Title
    stream += `BT\n`;
    stream += `/F2 13 Tf\n`;
    stream += `0.1 0.1 0.15 rg\n`;
    stream += `40 ${y} Td\n`;
    stream += `(${escapePdfText(sec.heading)}) Tj\n`;
    stream += `ET\n`;
    y -= 18;

    // Section Lines
    for (const line of sec.lines) {
      if (y < 60) break;
      stream += `BT\n`;
      stream += `/F1 9.5 Tf\n`;
      stream += `0.25 0.25 0.3 rg\n`;
      stream += `45 ${y} Td\n`;
      stream += `(${escapePdfText(line)}) Tj\n`;
      stream += `ET\n`;
      y -= 14;
    }
    y -= 10;
  }

  // Footer
  stream += `BT\n`;
  stream += `/F1 8 Tf\n`;
  stream += `0.5 0.5 0.5 rg\n`;
  stream += `40 30 Td\n`;
  stream += `(Dokumen Resmi Identitas TERRAVANA - Angkatan 25 Studi Pembangunan ITS) Tj\n`;
  stream += `ET\n`;

  const streamLength = Buffer.byteLength(stream, 'utf-8');

  let objects = [];
  objects.push(`1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`);
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`);
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n`);
  objects.push(`4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);
  objects.push(`5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`);
  objects.push(`6 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}endstream\nendobj\n`);

  let body = `%PDF-1.4\n`;
  let xref = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`];

  for (let i = 0; i < objects.length; i++) {
    const offset = Buffer.byteLength(body, 'utf-8');
    xref.push(`${String(offset).padStart(10, '0')} 00000 n \n`);
    body += objects[i];
  }

  const xrefOffset = Buffer.byteLength(body, 'utf-8');
  body += xref.join('');
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body, 'utf-8');
}

// Ensure public dir exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

// 1. Guideline PDF
const guidelineBuffer = createPdf(
  'TERRAVANA - PANDUAN IDENTITAS & LOGO',
  'Angkatan 25 Studi Pembangunan - Institut Teknologi Sepuluh Nopember',
  [
    {
      heading: '1. Makna Etimologis & Hakikat Nama TERRAVANA',
      lines: [
        '- Terra (Latin): Bumi / tanah kehidupan tempat manusia tumbuh, hidup, dan membangun masa depan.',
        '- Vana (Sanskerta): Hutan / alam kehidupan yang melambangkan pertumbuhan, harmoni, dan keberlanjutan.',
        '- Hakikat Nama: Generasi yang tumbuh bersama bumi, menjaga keseimbangan antara pembangunan,',
        '  masyarakat, dan alam demi masa depan yang berkelanjutan sesuai tujuan SDGs.'
      ]
    },
    {
      heading: '2. Komponen & Filosofi Logo',
      lines: [
        '- Angka 25: Simbol perjalanan, semangat, dan keselarasan individu dengan tujuan bersama.',
        '- Arah Visual ke Atas: Melambangkan harapan, cita-cita tinggi, serta semangat untuk terus berkembang.',
        '- Burung Phoenix: Bangkit kembali dengan kekuatan baru, pantang menyerah, dan adaptif.',
        '  Merepresentasikan SDGs Poin 16 (Peace, Justice, and Strong Institutions).',
        '- Gulungan Ombak: Kekuatan, ketangguhan, dan konsistensi menghadapi tantangan.',
        '  Merepresentasikan SDGs Poin 14 (Life Below Water), kepedulian pada ekosistem laut & maritim.'
      ]
    },
    {
      heading: '3. Skema Warna Resmi (Color Palette)',
      lines: [
        '- Oranye (#FF9D00): Kreativitas, kehangatan, dan optimisme.',
        '- Merah (#DB0000 / #FF0800): Energi, keberanian, dan semangat yang membara.',
        '- Merah Marun (#570300 / #860400): Kekuatan, keteguhan hati, dan fondasi kokoh.'
      ]
    },
    {
      heading: '4. Aturan & Filosofi Kacu',
      lines: [
        '- Kain Hitam (#000000): Ruang gelap. Sikap tenang dalam menghadapi situasi penuh tantangan.',
        '  Prinsip mental mutlak: Terravana tidak pernah bisa ditenggelamkan.',
        '- Posisi Leher: Menjaga ucapan dan komitmen untuk senantiasa menyuarakan kebenaran.',
        '- Font Bordir: Tulisan "SP 25" menggunakan Barbara font dengan warna #c48e87.'
      ]
    }
  ]
);

// 2. Visi Misi PDF
const visiMisiBuffer = createPdf(
  'VISI & MISI TERRAVANA 2025',
  'Pedoman Arah Gerak Angkatan 25 Studi Pembangunan ITS',
  [
    {
      heading: 'VISI RESMI ANGKATAN 25',
      lines: [
        '"TERRAVANA BERTUMBUH BERSAMA SEBAGAI GENERASI YANG MEMBUKTIKAN EKSISTENSINYA',
        'MELALUI KEBERANIAN UNTUK BERPROSES DAN KETANGGUHAN DALAM MENGHADAPI PERUBAHAN',
        'SERTA KONTRIBUSI NYATA DEMI MASA DEPAN YANG BERKELANJUTAN."'
      ]
    },
    {
      heading: '5 MISI RESMI TERRAVANA',
      lines: [
        'Misi 1: Membangun solidaritas dan rasa kekeluargaan yang kuat untuk menciptakan lingkungan',
        '        angkatan yang inklusif, suportif, dan tumbuh bersama.',
        'Misi 2: Menumbuhkan keberanian untuk berproses dan berkembang melalui keterbukaan terhadap evaluasi,',
        '        kemauan belajar dari kesalahan, serta apresiasi terhadap setiap proses dan pencapaian.',
        'Misi 3: Membentuk generasi yang tangguh dan adaptif dalam menghadapi perubahan serta mampu',
        '        menjadikan tantangan sebagai peluang untuk berkembang.',
        'Misi 4: Mendorong partisipasi aktif dan pengembangan potensi setiap anggota angkatan dengan',
        '        memberikan ruang bagi seluruh anggota angkatan untuk berinisiatif, berkolaborasi, dan berkontribusi.',
        'Misi 5: Mewujudkan kontribusi nyata yang berkelanjutan melalui aksi kolaboratif yang memberikan dampak positif',
        '        bagi angkatan, lingkungan sekitar, dan masyarakat.'
      ]
    },
    {
      heading: 'PANDUAN AKSI NYATA MEWUJUDKAN MISI',
      lines: [
        '- Misi 1: Apresiasi antarteman, Ruang aspirasi angkatan, Budaya peduli.',
        '- Misi 2: Forum evaluasi angkatan, Sharing pengalaman/kegagalan, Budaya berani mencoba lomba/kepanitiaan.',
        '- Misi 3: Forum problem-solving dalam menyusun solusi bersama atas masalah angkatan.',
        '- Misi 4: Open contribution, Pemerataan kesempatan berkontribusi sesuai minat, Berbagi info beasiswa/magang.',
        '- Misi 5: Aksi pengabdian masyarakat (KKN, Charity, aksi lingkungan).'
      ]
    }
  ]
);

// Write to public folder
fs.writeFileSync('public/terravana - guideline.pdf', guidelineBuffer);
fs.writeFileSync('public/Visi Misi Terravana 2025.pdf', visiMisiBuffer);

// Also copy to root for relative path links
fs.writeFileSync('terravana - guideline.pdf', guidelineBuffer);
fs.writeFileSync('Visi Misi Terravana 2025.pdf', visiMisiBuffer);

console.log('Successfully generated official PDF documents in public/ and root directory!');
