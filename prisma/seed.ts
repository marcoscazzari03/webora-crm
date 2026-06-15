import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const adapter = new PrismaBetterSqlite3({ url: `file:${path.join(process.cwd(), "prisma", "dev.db")}` });
const prisma = new PrismaClient({ adapter });

const prospects = [
  {
    businessName: "Pizzeria Da Mario",
    ownerName: "Mario Rossi",
    category: "Ristorazione",
    city: "Milano",
    phone: "02 1234567",
    status: "DA_CONTATTARE",
    notes: "Nessun sito web, solo pagina FB poco aggiornata",
  },
  {
    businessName: "Parrucchiere Style",
    ownerName: "Laura Bianchi",
    category: "Benessere",
    city: "Milano",
    phone: "02 9876543",
    instagram: "@style_parrucchiere",
    status: "DA_CONTATTARE",
    notes: "Profilo Instagram attivo ma senza sito",
  },
  {
    businessName: "Idraulico Ferretti",
    ownerName: "Giorgio Ferretti",
    category: "Servizi",
    city: "Monza",
    phone: "039 555123",
    status: "CONTATTATO",
    notes: "Chiamato il 10/06, richiamare la prossima settimana",
  },
  {
    businessName: "Ottica Visione",
    ownerName: "Carla Neri",
    category: "Retail",
    city: "Sesto San Giovanni",
    phone: "02 2468100",
    email: "info@otticavisione.it",
    status: "CONTATTATO",
    notes: "Interessata, vuole capire i costi",
  },
  {
    businessName: "Studio Legale Marchi",
    ownerName: "Avv. Roberto Marchi",
    category: "Professionale",
    city: "Milano",
    email: "r.marchi@studiomarchi.it",
    website: "studiomarchi.it",
    status: "HA_RISPOSTO",
    notes: "Sito vecchio del 2015, vuole rinnovarlo",
  },
  {
    businessName: "Gym Power",
    ownerName: "Luca Esposito",
    category: "Sport",
    city: "Cinisello Balsamo",
    phone: "02 3456789",
    instagram: "@gympower_cini",
    status: "HA_RISPOSTO",
    notes: "Vuole landing page con prezzi abbonamenti",
  },
  {
    businessName: "Bar Central",
    ownerName: "Francesca Vitale",
    category: "Ristorazione",
    city: "Milano",
    phone: "02 6543210",
    status: "MOCKUP_INVIATO",
    notes: "Mockup homepage inviato il 12/06, in attesa di feedback",
  },
  {
    businessName: "Centro Estetico Luna",
    ownerName: "Alessia Romano",
    category: "Benessere",
    city: "Paderno Dugnano",
    phone: "02 9101112",
    instagram: "@centroluna_est",
    status: "PREVENTIVO",
    notes: "Call fatta il 13/06, preventivo €890 inviato",
  },
];

const spese = [
  {
    nome: "Hostinger Business",
    categoria: "Hosting",
    importo: 11.99,
    valuta: "EUR",
    frequenza: "MENSILE",
    prossimoRinnovo: new Date("2026-07-01"),
    rinnovoAuto: true,
    note: "Piano business, include 100 siti",
  },
  {
    nome: "Claude Pro",
    categoria: "AI",
    importo: 18.0,
    valuta: "USD",
    frequenza: "MENSILE",
    prossimoRinnovo: new Date("2026-07-05"),
    rinnovoAuto: true,
    note: "Anthropic Claude Pro",
  },
  {
    nome: "ChatGPT Plus",
    categoria: "AI",
    importo: 20.0,
    valuta: "USD",
    frequenza: "MENSILE",
    prossimoRinnovo: new Date("2026-07-10"),
    rinnovoAuto: true,
    note: "OpenAI GPT-4o",
  },
  {
    nome: "weborastudio.it",
    categoria: "Dominio",
    importo: 14.99,
    valuta: "EUR",
    frequenza: "ANNUALE",
    prossimoRinnovo: new Date("2027-01-15"),
    rinnovoAuto: false,
    note: "Dominio principale Webora Studio",
  },
  {
    nome: "Contabo VPS S",
    categoria: "VPS",
    importo: 4.99,
    valuta: "EUR",
    frequenza: "MENSILE",
    prossimoRinnovo: new Date("2026-06-20"),
    rinnovoAuto: true,
    note: "VPS per progetti clienti in staging",
  },
];

async function main() {
  await prisma.prospect.deleteMany();
  for (const p of prospects) {
    await prisma.prospect.create({ data: p });
  }
  console.log(`Seeded ${prospects.length} prospects`);

  await prisma.spesaOperativa.deleteMany();
  for (const s of spese) {
    await prisma.spesaOperativa.create({ data: s });
  }
  console.log(`Seeded ${spese.length} spese operative`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
