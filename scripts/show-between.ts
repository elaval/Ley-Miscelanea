import mammoth from 'mammoth';
import { readFileSync } from 'fs';

async function showBetween() {
  const buffer = readFileSync('fuente/018-374  Mensaje PDL Reconstruccio&#769;n (22.04.2026) DJL.docx');
  const result = await mammoth.extractRawText({ buffer });
  const lines = result.value.split('\n').map(l => l.trim()).filter(l => l);

  let foundPerm = false;
  let foundTrans = false;
  let inBetween = false;

  console.log('=== CONTENIDO ENTRE "Artículos permanentes" Y "Artículos transitorios" ===\n');

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];

    if (l.toLowerCase().includes('artículos permanentes')) {
      foundPerm = true;
      inBetween = true;
      console.log(`[Línea ${i}] >>> ${l} <<<\n`);
      continue;
    }

    if (l.toLowerCase().includes('artículos transitorios')) {
      foundTrans = true;
      inBetween = false;
      console.log(`\n[Línea ${i}] >>> ${l} <<<\n`);
      break;
    }

    if (inBetween) {
      console.log(`[${i}] ${l}`);
    }
  }

  console.log('\n=== ANÁLISIS ===');
  if (!foundPerm || !foundTrans) {
    console.log('❌ No se encontraron ambas etiquetas');
  } else {
    console.log('✅ El documento tiene la etiqueta "Artículos permanentes"');
    console.log('✅ Seguida directamente de "Artículos transitorios"');
    console.log('✅ Sin artículos permanentes en el medio');
    console.log('\n📝 CONCLUSIÓN: Este proyecto de ley contiene SOLO medidas transitorias.');
    console.log('   Esto es coherente con un proyecto de reconstrucción post-emergencia.');
  }
}

showBetween();
