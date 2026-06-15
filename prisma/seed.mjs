import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "dev.db");

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
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

await prisma.prospect.deleteMany();
for (const p of prospects) {
  await prisma.prospect.create({ data: p });
}
console.log(`Seeded ${prospects.length} prospects`);
await prisma.$disconnect();
