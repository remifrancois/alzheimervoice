#!/usr/bin/env node
/**
 * extract-features.js — Test the CVF feature extraction pipeline.
 * Creates a sample patient and transcript, sends it through Claude Opus 4.6,
 * and outputs the 25-dimension feature vector.
 *
 * Usage: npm run extract
 * Requires: ANTHROPIC_API_KEY in .env
 */
import 'dotenv/config';
import { extractFeatures } from '../services/claude.js';
import { createPatient } from '../models/patient.js';
import { ALL_FEATURES, CVF_FEATURES } from '../models/cvf.js';

// Sample French transcript — Marie, 75, healthy baseline session
const SAMPLE_TRANSCRIPT_FR = [
  { role: 'assistant', text: "Bonjour Marie ! Comment allez-vous ce matin ?" },
  { role: 'patient', text: "Oh bonjour ! Très bien, merci. J'ai eu une belle matinée, j'ai fait mon petit tour au marché comme chaque mercredi." },
  { role: 'assistant', text: "Le marché du mercredi ! Vous y avez trouvé de bonnes choses ?" },
  { role: 'patient', text: "Ah oui, les premières fraises de la saison ! Elles sentaient divinement bon. J'en ai pris une barquette, et aussi des asperges blanches... vous savez, celles de Monsieur Dupont, le maraîcher qui est là depuis trente ans au moins." },
  { role: 'assistant', text: "Monsieur Dupont, celui qui a le grand étal au coin, c'est ça ?" },
  { role: 'patient', text: "Exactement ! Avec sa femme Colette qui fait les comptes. [pause] Ils ont leur petite-fille maintenant qui les aide le samedi... elle doit avoir, euh, quatorze ou quinze ans. Le temps passe si vite." },
  { role: 'assistant', text: "C'est vrai que le temps file. Et votre jardin, les roses commencent à sortir ?" },
  { role: 'patient', text: "Les roses, pas encore, mais les tulipes sont magnifiques cette année. J'ai planté des variétés nouvelles en octobre dernier — des Queen of Night, toutes noires, enfin violet très foncé. Mon mari André les aurait adorées... il avait un faible pour les fleurs sombres, les iris noirs surtout. On les plantait ensemble chaque automne." },
  { role: 'assistant', text: "C'est un beau souvenir avec André. Vous m'aviez parlé de votre voyage en Hollande pour voir les champs de tulipes — c'était en quelle année déjà ?" },
  { role: 'patient', text: "1998 ! Non, attendez... 1997. Oui, c'est ça, 1997, parce que c'était juste avant que Pierre — mon fils — parte à l'université. On avait pris le train jusqu'à Amsterdam, puis un bus pour Keukenhof. André avait photographié chaque parterre... j'ai encore l'album quelque part." },
  { role: 'assistant', text: "Vous vous souvenez très bien de ce voyage. Et les asperges, vous allez les préparer comment ?" },
  { role: 'patient', text: "À la flamande ! Avec des œufs durs, du beurre noisette et du persil. C'est la recette de ma mère... elle les faisait toujours avec une petite pointe de muscade aussi, c'est le secret. Je vais en faire ce soir pour ma voisine Françoise qui vient dîner." }
];

// Sample English transcript — for testing
const SAMPLE_TRANSCRIPT_EN = [
  { role: 'assistant', text: "Good morning, Margaret! How are you today?" },
  { role: 'patient', text: "Hello dear! I'm doing well, thank you. I had a lovely morning — went for my usual walk around the lake. The daffodils are all blooming now, it's quite a sight." },
  { role: 'assistant', text: "The daffodils by the lake! That sounds wonderful. Did you see anyone you know?" },
  { role: 'patient', text: "Oh yes, I ran into Dorothy — you know, my neighbor from the blue house. We sat on our usual bench and watched the geese. She was telling me about her grandson's wedding in June... the one who works at the hospital, Thomas, I think he's a radiologist." },
  { role: 'assistant', text: "That's nice. You mentioned last time that you've been reading a new book — how's that going?" },
  { role: 'patient', text: "Oh, the Hilary Mantel one! Wolf Hall. It's quite dense, you know, all that Tudor history. I'm about halfway through. [pause] The language is beautiful but complex — she writes these long, winding sentences that you have to read twice sometimes. My book club is discussing it next Thursday." },
  { role: 'assistant', text: "Wolf Hall is quite a read! Your book club sounds wonderful. You told me about a trip you took to London once to see a play — do you remember when that was?" },
  { role: 'patient', text: "Yes! 2003, for our wedding anniversary — David and I. We saw The History Boys at the National Theatre. Magnificent performance. We stayed at a little hotel near Covent Garden... the Fielding, I think it was called. David had booked it as a surprise." }
];

async function main() {
  const language = process.argv[2] || 'fr';
  const transcript = language === 'en' ? SAMPLE_TRANSCRIPT_EN : SAMPLE_TRANSCRIPT_FR;
  const patientName = language === 'en' ? 'Margaret' : 'Marie';

  const patient = createPatient({
    firstName: patientName,
    language
  });

  console.log(`\n  CVF Feature Extraction Test`);
  console.log(`  Patient: ${patientName} (${language})`);
  console.log(`  Transcript: ${transcript.length} turns`);
  console.log(`  Model: claude-opus-4-6`);
  console.log(`  ─────────────────────────────────\n`);
  console.log(`  Sending to Claude Opus 4.6 for feature extraction...`);

  const startTime = Date.now();

  try {
    const vector = await extractFeatures(transcript, {
      language,
      patientProfile: patient,
      baselineInfo: null  // calibration mode
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`  Extraction complete in ${elapsed}s\n`);

    // Display results by domain
    for (const [domain, features] of Object.entries(CVF_FEATURES)) {
      console.log(`  ${domain.toUpperCase()}`);
      for (const feature of features) {
        const value = vector[feature];
        const bar = value != null ? renderBar(value) : '  [not tested]';
        console.log(`    ${feature.padEnd(26)} ${value != null ? value.toFixed(3).padStart(6) : '  null'}  ${bar}`);
      }
      console.log();
    }

    // Extraction notes
    if (vector.extraction_notes) {
      console.log(`  CLINICAL NOTES:`);
      console.log(`    ${vector.extraction_notes}\n`);
    }

    // Validate
    const missing = ALL_FEATURES.filter(f => vector[f] === undefined);
    const outOfRange = ALL_FEATURES.filter(f => vector[f] != null && (vector[f] < 0 || vector[f] > 1));
    const nullMemory = ALL_FEATURES.filter(f => f.startsWith('M') && vector[f] === null);

    console.log(`  VALIDATION:`);
    console.log(`    Features extracted: ${ALL_FEATURES.length - missing.length}/${ALL_FEATURES.length}`);
    console.log(`    Memory features null (OK if not probed): ${nullMemory.length}`);
    if (outOfRange.length > 0) {
      console.log(`    ⚠ Out of range [0-1]: ${outOfRange.join(', ')}`);
    }
    if (missing.length > 0) {
      console.log(`    ⚠ Missing: ${missing.join(', ')}`);
    }
    console.log(`    Status: ${missing.length === 0 && outOfRange.length === 0 ? 'PASS' : 'ISSUES FOUND'}\n`);

    // Output raw JSON
    console.log(`  RAW VECTOR:`);
    console.log(JSON.stringify(vector, null, 2));

  } catch (err) {
    console.error(`\n  ERROR: ${err.message}`);
    if (err.message.includes('API key')) {
      console.error(`  Make sure ANTHROPIC_API_KEY is set in .env`);
    }
    process.exit(1);
  }
}

function renderBar(value) {
  const width = 20;
  const filled = Math.round(value * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `[${bar}]`;
}

main();
