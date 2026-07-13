export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "contact"; lines: string[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  kicker: string;
  title: string;
  updatedAt: string;
  sections: LegalSection[];
  closingNote?: string;
};

export const LEGAL_UPDATED_AT = "13. juli 2026";

export const tradeTerms: LegalDocument = {
  kicker: "Juridisk",
  title: "Handelsbetingelser for Second Swing",
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: "1. Om Second Swing",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing er en digital markedsplads, der giver private brugere mulighed for at købe og sælge brugt golfudstyr.",
        },
        {
          type: "paragraph",
          text: "Second Swing fungerer som en formidlingsplatform mellem købere og sælgere og faciliterer kontakten mellem brugerne. Second Swing køber, sælger eller ejer ikke de produkter, der bliver annonceret på platformen.",
        },
        {
          type: "paragraph",
          text: "Alle handler indgås direkte mellem køber og sælger. Second Swing er ikke part i handelsaftalen mellem brugerne.",
        },
      ],
    },
    {
      title: "2. Second Swings rolle",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing stiller en digital platform til rådighed, hvor brugere kan oprette annoncer, kontakte hinanden og indgå handler.",
        },
        {
          type: "paragraph",
          text: "Second Swing er alene ansvarlig for driften og udviklingen af platformen og har ikke ansvar for:",
        },
        {
          type: "list",
          items: [
            "Produktets stand, kvalitet eller funktionalitet",
            "Om produktet svarer til beskrivelsen i annoncen",
            "Om sælger har ret til at sælge produktet",
            "Betaling mellem køber og sælger",
            "Levering eller afhentning af produkter",
            "Eventuelle tvister mellem køber og sælger",
          ],
        },
        {
          type: "paragraph",
          text: "Second Swing kan ikke holdes ansvarlig for forhold, der opstår som følge af handler mellem brugerne.",
        },
      ],
    },
    {
      title: "3. Annoncer og sælgers ansvar",
      blocks: [
        {
          type: "paragraph",
          text: "Ved oprettelse af en annonce accepterer sælger at give korrekte, retvisende og fyldestgørende oplysninger om produktet.",
        },
        {
          type: "paragraph",
          text: "Sælger er selv ansvarlig for:",
        },
        {
          type: "list",
          items: [
            "Produktbeskrivelse",
            "Valgt standsvurdering",
            "Billeder",
            "Oplysninger om skader, slid eller mangler",
            "Pris og øvrige handelsvilkår",
          ],
        },
        {
          type: "paragraph",
          text: "Sælger må ikke offentliggøre vildledende, falske eller ulovlige annoncer.",
        },
        {
          type: "paragraph",
          text: "Second Swing forbeholder sig retten til at fjerne annoncer, som vurderes at være misvisende, ulovlige eller i strid med platformens retningslinjer.",
        },
      ],
    },
    {
      title: "4. Købers ansvar",
      blocks: [
        {
          type: "paragraph",
          text: "Køber er selv ansvarlig for at gennemgå en annonce grundigt inden køb.",
        },
        {
          type: "paragraph",
          text: "Vi anbefaler, at køber:",
        },
        {
          type: "list",
          items: [
            "Gennemgår billeder og produktbeskrivelse",
            "Stiller spørgsmål til sælger ved tvivl",
            "Aftaler betaling og levering inden gennemførelse af handel",
          ],
        },
        {
          type: "paragraph",
          text: "Køber accepterer, at køb af brugt udstyr indebærer, at produkter kan have brugsspor, og at varen købes ud fra de oplysninger, som sælger har angivet.",
        },
      ],
    },
    {
      title: "5. Betaling og handelsaftaler",
      blocks: [
        {
          type: "paragraph",
          text: "Betaling aftales direkte mellem køber og sælger, medmindre andet fremgår tydeligt af platformen.",
        },
        {
          type: "paragraph",
          text: "Second Swing håndterer ikke betaling mellem brugere og har derfor ikke ansvar for eventuelle betalingsproblemer, manglende betaling eller økonomiske tab mellem parterne.",
        },
        {
          type: "paragraph",
          text: "Second Swing arbejder løbende på at forbedre platformen og kan i fremtiden tilbyde integrerede betalingsløsninger.",
        },
      ],
    },
    {
      title: "6. Formidlingsgebyr",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing opkræver et formidlingsgebyr på 10 % af salgsprisen for gennemførte salg.",
        },
        {
          type: "paragraph",
          text: "Gebyrer opkræves for brugen af platformen og de tjenester, Second Swing stiller til rådighed.",
        },
        {
          type: "paragraph",
          text: "Gebyrmodellen ændrer ikke på, at selve handlen sker direkte mellem køber og sælger.",
        },
      ],
    },
    {
      title: "7. Refundering, returnering og reklamation",
      blocks: [
        {
          type: "paragraph",
          text: "Da Second Swing ikke er sælger af produkterne, tilbyder Second Swing ikke refundering, returnering eller reklamation på varer købt gennem platformen.",
        },
        {
          type: "paragraph",
          text: "Eventuelle spørgsmål eller uenigheder vedrørende en handel skal håndteres direkte mellem køber og sælger.",
        },
        {
          type: "paragraph",
          text: "Hvis parterne ikke selv kan finde en løsning, kan Second Swing kontaktes. Vi kan forsøge at hjælpe med dialogen mellem parterne, men vi kan ikke garantere en løsning eller træffe afgørelser på vegne af køber eller sælger.",
        },
      ],
    },
    {
      title: "8. Produkters stand og garanti",
      blocks: [
        {
          type: "paragraph",
          text: "Alt udstyr på Second Swing sælges som udgangspunkt brugt mellem brugere.",
        },
        {
          type: "paragraph",
          text: "Second Swing yder ingen garanti på produkter, der handles gennem platformen.",
        },
        {
          type: "paragraph",
          text: "Sælger er ansvarlig for at beskrive produktets stand korrekt, mens køber selv vurderer, om produktet opfylder egne krav og forventninger.",
        },
      ],
    },
    {
      title: "9. Begrænsning af ansvar",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing bestræber sig på at levere en sikker og stabil platform, men kan ikke garantere, at platformen altid er fejlfri eller uden tekniske problemer.",
        },
        {
          type: "paragraph",
          text: "Second Swing kan ikke holdes ansvarlig for:",
        },
        {
          type: "list",
          items: [
            "Direkte eller indirekte tab",
            "Økonomiske tab mellem brugere",
            "Forkerte oplysninger i annoncer",
            "Svindel eller misligholdelse mellem brugere",
            "Tab som følge af brugen af platformen",
          ],
        },
      ],
    },
    {
      title: "10. Misbrug af platformen",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing ønsker at skabe et sikkert fællesskab for golfspillere.",
        },
        {
          type: "paragraph",
          text: "Second Swing forbeholder sig retten til at:",
        },
        {
          type: "list",
          items: [
            "Fjerne indhold",
            "Begrænse adgang til platformen",
            "Lukke brugerkonti",
          ],
        },
        {
          type: "paragraph",
          text: "Dette kan ske ved mistanke om svindel, misbrug, falske annoncer, ulovligt indhold eller brud på disse handelsbetingelser.",
        },
      ],
    },
    {
      title: "11. Personoplysninger",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing behandler personoplysninger i overensstemmelse med gældende databeskyttelseslovgivning.",
        },
        {
          type: "paragraph",
          text: "Læs mere i vores Privatlivspolitik.",
        },
        {
          type: "paragraph",
          text: "Brugere kan til enhver tid anmode om indsigt i eller sletning af deres personoplysninger.",
        },
      ],
    },
    {
      title: "12. Kontakt",
      blocks: [
        {
          type: "paragraph",
          text: "Har du spørgsmål til disse handelsbetingelser, kan du kontakte Second Swing på:",
        },
        {
          type: "contact",
          lines: ["secondswing@gmail.com"],
        },
      ],
    },
  ],
  closingNote:
    "Ved at bruge Second Swing accepterer brugeren disse handelsbetingelser og accepterer, at Second Swing fungerer som en formidlingsplatform mellem købere og sælgere.",
};

export const termsOfUse: LegalDocument = {
  kicker: "Juridisk",
  title: "Brugervilkår for Second Swing",
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: "1. Introduktion",
      blocks: [
        {
          type: "paragraph",
          text: "Disse brugervilkår beskriver reglerne for brugen af Second Swings platform.",
        },
        {
          type: "paragraph",
          text: "Second Swing er en digital markedsplads, hvor brugere kan købe og sælge brugt golfudstyr direkte med hinanden. Ved at oprette en konto eller anvende platformen accepterer du disse brugervilkår.",
        },
        {
          type: "paragraph",
          text: "Hvis du ikke accepterer vilkårene, må platformen ikke anvendes.",
        },
      ],
    },
    {
      title: "2. Brugerkonto",
      blocks: [
        {
          type: "paragraph",
          text: "For at anvende visse funktioner på Second Swing kan det være nødvendigt at oprette en brugerkonto.",
        },
        {
          type: "paragraph",
          text: "Brugeren er selv ansvarlig for:",
        },
        {
          type: "list",
          items: [
            "At oplyse korrekte oplysninger",
            "At holde kontooplysninger opdaterede",
            "At beskytte loginoplysninger",
            "At sikre, at kontoen ikke anvendes af andre uden tilladelse",
          ],
        },
        {
          type: "paragraph",
          text: "Brugeren må ikke oprette falske profiler eller udgive sig for at være en anden person.",
        },
      ],
    },
    {
      title: "3. Brug af platformen",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing må kun anvendes til lovlige formål og i overensstemmelse med disse brugervilkår.",
        },
        {
          type: "paragraph",
          text: "Brugere må ikke:",
        },
        {
          type: "list",
          items: [
            "Oprette falske eller vildledende annoncer",
            "Sælge produkter, som de ikke har ret til at sælge",
            "Bruge platformen til svindel eller bedrageri",
            "Offentliggøre ulovligt eller krænkende indhold",
            "Forsøge at skade platformens funktionalitet eller sikkerhed",
          ],
        },
        {
          type: "paragraph",
          text: "Second Swing forbeholder sig retten til at reagere på misbrug af platformen.",
        },
      ],
    },
    {
      title: "4. Annoncer og indhold",
      blocks: [
        {
          type: "paragraph",
          text: "Brugeren ejer selv ansvaret for det indhold, der uploades til Second Swing.",
        },
        {
          type: "paragraph",
          text: "Dette inkluderer:",
        },
        {
          type: "list",
          items: [
            "Tekster",
            "Billeder",
            "Produktinformation",
            "Kommunikation med andre brugere",
          ],
        },
        {
          type: "paragraph",
          text: "Ved upload af indhold giver brugeren Second Swing tilladelse til at vise og anvende indholdet på platformen med henblik på at levere tjenesten.",
        },
        {
          type: "paragraph",
          text: "Brugeren skal sikre, at uploadet indhold ikke krænker andres rettigheder.",
        },
      ],
    },
    {
      title: "5. Kommunikation mellem brugere",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing stiller kommunikationsmuligheder til rådighed for at gøre handel mellem brugere lettere.",
        },
        {
          type: "paragraph",
          text: "Brugere skal kommunikere respektfuldt og må ikke anvende platformens funktioner til:",
        },
        {
          type: "list",
          items: ["Chikane", "Spam", "Trusler", "Upassende adfærd"],
        },
        {
          type: "paragraph",
          text: "Second Swing kan begrænse eller fjerne brugere, der ikke overholder disse regler.",
        },
      ],
    },
    {
      title: "6. Suspension og lukning af konti",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing forbeholder sig retten til midlertidigt eller permanent at begrænse brugeres adgang til platformen.",
        },
        {
          type: "paragraph",
          text: "Dette kan ske ved eksempelvis:",
        },
        {
          type: "list",
          items: [
            "Overtrædelse af brugervilkår",
            "Mistanke om svindel",
            "Misbrug af platformen",
            "Skadelig adfærd over for andre brugere",
          ],
        },
      ],
    },
    {
      title: "7. Ændringer til platformen",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing udvikler løbende platformen og forbeholder sig retten til at ændre, opdatere eller fjerne funktioner.",
        },
        {
          type: "paragraph",
          text: "Vi kan ikke garantere, at alle funktioner altid vil være tilgængelige uden afbrydelser.",
        },
      ],
    },
    {
      title: "8. Ansvarsbegrænsning",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing fungerer som en platform, der forbinder brugere.",
        },
        {
          type: "paragraph",
          text: "Second Swing er ikke ansvarlig for:",
        },
        {
          type: "list",
          items: [
            "Handler mellem brugere",
            "Kommunikation mellem brugere",
            "Produkter annonceret af brugere",
            "Aftaler indgået mellem brugere",
          ],
        },
        {
          type: "paragraph",
          text: "Brugeren anvender platformen på eget ansvar.",
        },
      ],
    },
    {
      title: "9. Kontakt",
      blocks: [
        {
          type: "paragraph",
          text: "Spørgsmål vedrørende brugervilkårene kan sendes til:",
        },
        {
          type: "contact",
          lines: ["secondswing@gmail.com"],
        },
      ],
    },
  ],
};

export const privacyPolicy: LegalDocument = {
  kicker: "Juridisk",
  title: "Privatlivspolitik for Second Swing",
  updatedAt: LEGAL_UPDATED_AT,
  sections: [
    {
      title: "1. Introduktion",
      blocks: [
        {
          type: "paragraph",
          text: "Hos Second Swing prioriterer vi beskyttelsen af dine personoplysninger.",
        },
        {
          type: "paragraph",
          text: "Denne privatlivspolitik forklarer, hvilke oplysninger vi indsamler, hvordan vi anvender dem, og hvilke rettigheder du har som bruger.",
        },
        {
          type: "paragraph",
          text: "Second Swing behandler personoplysninger i overensstemmelse med gældende databeskyttelseslovgivning, herunder EU's Databeskyttelsesforordning (GDPR).",
        },
      ],
    },
    {
      title: "2. Dataansvarlig",
      blocks: [
        {
          type: "paragraph",
          text: "Den dataansvarlige for behandlingen af dine personoplysninger er:",
        },
        {
          type: "contact",
          lines: ["Second Swing", "E-mail: secondswing@gmail.com"],
        },
      ],
    },
    {
      title: "3. Hvilke oplysninger indsamler vi?",
      blocks: [
        {
          type: "paragraph",
          text: "Afhængigt af din brug af platformen kan vi indsamle følgende oplysninger:",
        },
        {
          type: "paragraph",
          text: "Kontooplysninger:",
        },
        {
          type: "list",
          items: [
            "Navn",
            "E-mailadresse",
            "Telefonnummer (hvis oplyst)",
            "Loginoplysninger",
          ],
        },
        {
          type: "paragraph",
          text: "Oplysninger ved annoncer:",
        },
        {
          type: "list",
          items: ["Produktinformation", "Billeder", "Beskrivelser", "Prisoplysninger"],
        },
        {
          type: "paragraph",
          text: "Kommunikation:",
        },
        {
          type: "list",
          items: ["Beskeder mellem brugere", "Henvendelser til kundeservice"],
        },
        {
          type: "paragraph",
          text: "Tekniske oplysninger:",
        },
        {
          type: "list",
          items: [
            "IP-adresse",
            "Enhedstype",
            "Browserinformation",
            "Brugeradfærd på platformen",
          ],
        },
      ],
    },
    {
      title: "4. Hvordan bruger vi dine oplysninger?",
      blocks: [
        {
          type: "paragraph",
          text: "Vi anvender dine oplysninger til at:",
        },
        {
          type: "list",
          items: [
            "Oprette og administrere brugerkonti",
            "Muliggøre køb og salg mellem brugere",
            "Forbedre brugeroplevelsen",
            "Besvare supporthenvendelser",
            "Forebygge misbrug og svindel",
            "Opfylde juridiske krav",
          ],
        },
      ],
    },
    {
      title: "5. Deling af oplysninger",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing deler ikke personoplysninger med tredjeparter uden et legitimt formål.",
        },
        {
          type: "paragraph",
          text: "Oplysninger kan dog deles med:",
        },
        {
          type: "list",
          items: [
            "Tekniske leverandører, der hjælper med drift af platformen",
            "Betroede samarbejdspartnere, hvor det er nødvendigt",
            "Myndigheder, hvis vi er juridisk forpligtet til det",
          ],
        },
      ],
    },
    {
      title: "6. Opbevaring af oplysninger",
      blocks: [
        {
          type: "paragraph",
          text: "Vi opbevarer dine personoplysninger, så længe det er nødvendigt for at levere vores tjenester eller opfylde juridiske forpligtelser.",
        },
        {
          type: "paragraph",
          text: "Når oplysninger ikke længere er nødvendige, slettes eller anonymiseres de.",
        },
      ],
    },
    {
      title: "7. Dine rettigheder",
      blocks: [
        {
          type: "paragraph",
          text: "Du har ret til:",
        },
        {
          type: "list",
          items: [
            "At få indsigt i dine personoplysninger",
            "At få rettet forkerte oplysninger",
            "At få slettet dine oplysninger",
            "At gøre indsigelse mod visse former for behandling",
            "At få begrænset behandlingen af dine oplysninger",
          ],
        },
        {
          type: "paragraph",
          text: "Ønsker du at gøre brug af dine rettigheder, kan du kontakte os.",
        },
      ],
    },
    {
      title: "8. Cookies",
      blocks: [
        {
          type: "paragraph",
          text: "Second Swing anvender cookies og lignende teknologier for at forbedre brugeroplevelsen, analysere brugen af platformen og sikre en stabil funktion.",
        },
        {
          type: "paragraph",
          text: "Du kan til enhver tid ændre dine cookieindstillinger gennem din browser.",
        },
      ],
    },
    {
      title: "9. Sikkerhed",
      blocks: [
        {
          type: "paragraph",
          text: "Vi tager passende tekniske og organisatoriske forholdsregler for at beskytte dine personoplysninger mod uautoriseret adgang, tab eller misbrug.",
        },
        {
          type: "paragraph",
          text: "Ingen digital løsning kan dog garantere fuldstændig sikkerhed.",
        },
      ],
    },
    {
      title: "10. Ændringer til privatlivspolitikken",
      blocks: [
        {
          type: "paragraph",
          text: "Vi kan løbende opdatere denne privatlivspolitik for at afspejle ændringer i vores tjenester eller gældende lovgivning.",
        },
        {
          type: "paragraph",
          text: "Den seneste version vil altid være tilgængelig på platformen.",
        },
      ],
    },
    {
      title: "11. Kontakt",
      blocks: [
        {
          type: "paragraph",
          text: "Hvis du har spørgsmål til vores behandling af personoplysninger, kan du kontakte:",
        },
        {
          type: "contact",
          lines: ["Second Swing", "E-mail: secondswing@gmail.com"],
        },
      ],
    },
  ],
};
