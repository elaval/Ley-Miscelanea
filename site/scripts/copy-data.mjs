/**
 * Copia el JSON de artículos desde datos/ al directorio de datos del sitio.
 * Se ejecuta automáticamente antes de cada `npm run build` (prebuild).
 * Permite que Vercel y otros hosts encuentren los datos sin ruta relativa externa.
 */
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(__dirname, '..');

// Origen: ../datos/enriquecido/articulos_enriquecidos.json
const source = join(siteRoot, '..', 'datos', 'enriquecido', 'articulos_enriquecidos.json');
// Destino: site/data/articulos_enriquecidos.json
const destDir = join(siteRoot, 'data');
const dest = join(destDir, 'articulos_enriquecidos.json');

if (!existsSync(source)) {
  console.error('❌ No se encontró el archivo de datos:', source);
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });
copyFileSync(source, dest);
console.log('✅ Datos copiados →', dest);
