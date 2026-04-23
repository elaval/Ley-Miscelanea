import mammoth from 'mammoth';
import { readFileSync } from 'fs';

async function verify() {
  const buffer = readFileSync('fuente/018-374  Mensaje PDL Reconstruccio&#769;n (22.04.2026) DJL.docx');
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split('\n').map(l => l.trim()).filter(l => l);

  let foundPerm = false;
  let foundTrans = false;
  let betweenCount = 0;
  let afterTransCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    if (l.toLowerCase().includes('artículos permanentes')) {
      foundPerm = true;
      console.log(`Línea ${i}: ${l}`);
    }

    if (foundPerm && !foundTrans && l.match(/^Artículo\s+\d+/i)) {
      betweenCount++;
      console.log(`  → PERMANENTE encontrado: ${l.substring(0, 60)}`);
    }

    if (l.toLowerCase().includes('artículos transitorios')) {
      foundTrans = true;
      console.log(`\nLínea ${i}: ${l}`);
    }

    if (foundTrans && l.match(/^Artículo\s+\d+/i)) {
      afterTransCount++;
      if (afterTransCount <= 5) {
        console.log(`  → TRANSITORIO encontrado: ${l.substring(0, 60)}`);
      }
    }
  }

  console.log('\n=== RESUMEN ===');
  console.log(`Artículos entre "Permanentes" y "Transitorios": ${betweenCount}`);
  console.log(`Artículos después de "Transitorios": ${afterTransCount}`);
  console.log('\n✅ CONCLUSIÓN:');
  if (betweenCount === 0 && afterTransCount > 0) {
    console.log('El parsing es CORRECTO: 0 permanentes, 35 transitorios');
  } else {
    console.log('El parsing puede estar INCORRECTO');
  }
}

verify();
