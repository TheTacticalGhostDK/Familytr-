// ─────────────────────────────────────────────────────────────
//  family-data.js  —  den ENESTE fil du skal redigere for at ændre indholdet i slægtstræet. Alle andre filer er en del af programmet og skal ikke ændres.
// ─────────────────────────────────────────────────────────────
//
//  Det meste står på engelsk fordi det er nemmere at skrive koden på engelsk, men dette er det eneste fil du skal ændre noget på, og der står beskrevet neden for hvad du skal gøre.
//
//  Hver person er et blok mellem { og }. Kopier en blok, indsæt den
//  under den sidste, og ændr værdierne. Glem ikke kommaet efter den afsluttende } i hver blok.
//
//  skabelon:
//  
//  {
//    id: "xxx",
//    name: "xxx", 
//    born: xxx,
//    died: xxx,
//    photo: "photos/xxx.jpg",
//    spouse: "xxx",
//    bio: "xxx",
//  },
//
//  Felter:
//    id       et kort of unikt id, f.eks. "hans". Brug kun små bogstaver og ingen mellemrum. Det bruges til at forbinde ægtefæller og børn med deres forældre.
//    name     Navenet på personen, f.eks. "Hans Jørgen". Det vises i familietræet og i pop-up'en.
//    born     fødselsår eller fødselsdato.
//    died     år eller dato for død (valgfrit). Hvis du kun kender året, skriv f.eks. 1971. Hvis du kender hele datoen, skriv f.eks. "1971-04-15" (YYYY-MM-DD).
//    photo    et billede af personen, f.eks. "photos/hans.jpg" (valgfrit). Hvis du ikke har et billede, kan du udelade feltet. Billedet vises i pop-up'en.
//    spouse   id'et på ægtefællen, f.eks. "inge" (valgfrit). Hvis personen ikke er gift, kan du udelade feltet. KUN skriv det på den ene ægtefælle, ikke begge. Det bruges til at forbinde ægtefæller i familietræet.
//    parents  bruges til at forbinde børn med deres forældre. Skriv en liste med id'er på forældrene, f.eks. ["hans", "inge"] (valgfrit). Hvis du ikke kender forældrene, kan du udelade feltet. KUN skriv det på barnet, ikke på forældrene.
//    bio      lille beskrivelse af personen (valgfrit). Hvis du ikke har en beskrivelse, kan du udelade feltet. Det vises i pop-up'en.

const SETTINGS = {
  title: "Familien fra Skarrild",
  subtitle: "Klik på en person for at se mere om dem, hold nede for at trække rundt.",
  rootId: "peder", // The tree starts here: the oldest person (and their spouse)
};

// All the text in the interface. Translate these to Danish if you like.
const LABELS = {
  bornPrefix: "b.",       // shown when only a birth year is known: "b. 1971"
  spouse: "Gift med",
  parents: "Forældre",
  children: "Børn",
  close: "Luk",
  zoomIn: "Zoom ind",
  zoomOut: "Zoom ud",
  resetView: "Nulstil Zoom",
  rootMissing: "Couldn't find the person with the id in SETTINGS.rootId. Check family-data.js.",
};

const PEOPLE = [
  // ── Generation 1 ──
  {
    id: "peder",
    name: "Peder Knudsen Pedersen",
    born: 1234,
    died: 1234,
    photo: "photos/hans.jpg",
    spouse: "annemarie",
    bio: "xxx",
  },
  {
    id: "annemarie",
    name: "Anne-Marie Pedersen",
    born: 1234,
    died: 1234,
    photo: "photos/inge.jpg",
    bio: "xxx",
  },

  // ── Generation 2 ──
  {
    id: "elly",
    name: "Elly",
    born: 1234,
    parents: ["peder", "annemarie"],
    spouse: "xxxx",
    bio: "xxx",
  },
  // { id: "xxx", name: "xxx", born: 1234 },,
  {
    id: "arne",
    name: "Arne",
    born: 1234,
    parents: ["peder", "annemarie"],
    spouse: "xxxx",
    bio: "xxx",
  },
  // { id: "xxx", name: "xxx", born: 1234 },,
  {
    id: "ole",
    name: "Ole",
    born: 1234,
    parents: ["peder", "annemarie"],
    bio: "xxx",
  },
  // { id: "xxx", name: "xxx", born: 1234 },
  {
    id: "henry",
    name: "Henry",
    born: 1234,
    parents: ["peder", "annemarie"],
    bio: "xxx",
  },
  // { id: "xxx", name: "xxx", born: 1234 },
  {
    id: "gerda",
    name: "Gerda",
    born: 1234,
    parents: ["peder", "annemarie"],
    bio: "xxx",
  }

  // ── Generation 3 ──
];
