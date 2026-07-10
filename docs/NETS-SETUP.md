# Betaling og købsflow — hvordan det hænger sammen

Denne guide beskriver, hvordan køb og bud fungerer i Second Swing i dag, hvad der **ikke** sker endnu (ingen rigtig betaling), og hvad der skal på plads, før betaling og gennemført køb virker korrekt via Nets (Nexi).

---

## Kort svar: Kan der trækkes penge nu?

**Nej.** Ingen penge kan blive trukket lige nu.

- Der er **ingen aktiv forbindelse** til Nets/Nexi
- Brugeren sendes **aldrig** videre til en rigtig betalingsside
- Produktet markeres **ikke** som solgt ved klik på "Betal"
- Der oprettes **ingen ordre** i databasen

Checkout er UI og forberedelse. Først når Nets er sat op **og** koden er færdigimplementeret, kan der trækkes penge — og kun efter Nets har bekræftet betalingen.

---

## To separate flows på produktsiden

På `/products/[id]` har køberen to forskellige handlinger. De må **ikke** forveksles:

| Handling | Hvad sker der? | Betaling? |
|---|---|---|
| **Giv bud** | Bottom drawer med 3 forudvalgte bud + eget beløb. Bud sendes som besked i chat til sælger. | **Nej** — kun forhandling |
| **Køb nu** | Sender til checkout (`/products/[id]/checkout`) for køb til annonceret pris | **Skal** ske via Nets — men er **ikke aktiv** endnu |

**Giv bud** og **Køb nu** er uafhængige:

- Et bud i chat ændrer ikke produktets pris eller status
- Et bud udløser ikke betaling
- Sælger og køber aftaler evt. videre i chat

---

## Hvad der virker i dag (implementeret)

### Produktside (`src/app/products/[id]/page.tsx`)

- Billeder, info, favorit, "Skriv til sælger"
- **Giv bud** → åbner `OfferBidDrawer`
- **Køb nu** → navigerer til checkout (kræver login)

### Giv bud (`src/app/components/Products/OfferBidDrawer.tsx`)

1. Køber vælger bud: -5 %, -10 %, -15 % eller eget beløb (under annonceret pris)
2. Ved "Send bud" oprettes eller genbruges en chat (`chats`-tabellen)
3. Buddet sendes som besked (`messages`-tabellen), fx: `Bud: 850 kr på "Title" (annonceret pris: 1000 kr)`
4. Køber sendes til chatten

**Status:** Fuldt funktionelt som chat-bud. Ingen betaling.

### Checkout UI (`src/app/products/[id]/checkout/page.tsx`)

Køberen gennemgår disse trin:

1. **Produkt** — billede, titel, pris
2. **Leveringsadresse** — hentes fra profil (`user_metadata`), kan redigeres
3. **Leveringsmuligheder** — Afhentning (gratis) eller Send til hjem (49 kr)
4. **Leveringsoplysninger** — dynamisk tekst ud fra valg
5. **Kontaktoplysninger** — telefon, e-mail
6. **Betalingsmetode** — Betalkort eller MobilePay (påkrævet før betaling)
7. **Prisoversigt** — produkt + levering = total
8. **Betal … kr med Nets**

Ved "Betal":

- Adresse gemmes på brugerens profil
- `POST /api/checkout/nets` kaldes
- **I dag:** API returnerer `not_configured` → fejlbesked, **intet køb gennemføres**

### API-endpoint (`src/app/api/checkout/nets/route.ts`)

- Validerer produkt-id, betalingsmetode, adresse og beløb
- Kalder `createNetsPaymentSession()` i `netsCheckout.ts`
- Returnerer enten redirect-URL (fremtid) eller fejl (i dag)

### Success-side (`src/app/products/[id]/checkout/success/page.tsx`)

- Side brugeren skal lande på **efter** Nets-betaling
- **I dag:** viser kun "afventer bekræftelse fra Nets" — fuldfører **ikke** ordren

---

## Hvad der sker i dag, når nogen trykker "Betal"

```text
Køb nu → Checkout → Udfyld oplysninger → Vælg betalingsmetode → Betal
  → Adresse gemmes på profil ✓
  → POST /api/checkout/nets
  → isNetsConfigured() = false (manglende miljøvariabler)
     ELLER placeholder returnerer stadig not_configured
  → Fejlbesked vises
  → Ingen redirect til Nets
  → Produkt forbliver usolgt
  → Ingen chat-besked om køb
  → Ingen penge trukket
```

Selv hvis miljøvariablerne sættes ind, returnerer `createNetsPaymentSession()` stadig `not_configured`, indtil den rigtige Nets API-kode er skrevet.

---

## Mål-flow: Sådan skal det hænge sammen (når alt er færdigt)

```text
┌─────────────────────────────────────────────────────────────────┐
│  PRODUKTSIDE                                                    │
│  Giv bud ──────────► Chat (bud som besked) — ingen betaling     │
│  Køb nu ───────────► Checkout                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  CHECKOUT                                                       │
│  Adresse + levering + kontakt + vælg betalingsmetode           │
│  Betal ────────────► POST /api/checkout/nets                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  NETS (ekstern)                                                 │
│  Bruger betaler med kort eller MobilePay                        │
│  Nets bekræfter eller afviser betaling                          │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
            Godkendt ▼                   Afvist ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  /checkout/success       │    │  /checkout?cancelled=1   │
│  Verificér mod Nets API  │    │  Ingen ordre, produkt    │
│  Markér solgt            │    │  forbliver usolgt        │
│  Underret sælger (chat)  │    └──────────────────────────┘
└──────────────────────────┘
```

**Vigtig regel:** Produktet må **kun** markeres som solgt (`products.sold = true`) efter **verificeret** Nets-betaling — aldrig i checkout-siden alene.

---

## Hvad der mangler før betaling virker

### 1. Nets-konto og miljøvariabler (eksternt + server)

Opret merchant-konto hos [Nexi](https://www.nexigroup.com/) og tilføj i `.env.local` og Vercel:

```env
NETS_MERCHANT_ID=din-merchant-id
NETS_TOKEN=din-secret-token
NETS_CHECKOUT_KEY=din-checkout-key
```

| Variabel | Formål |
|---|---|
| `NETS_MERCHANT_ID` | Merchant ID fra Nets/Nexi |
| `NETS_TOKEN` | Secret API-token til serverkald |
| `NETS_CHECKOUT_KEY` | Checkout / hosted payment key |

`isNetsConfigured()` i `src/app/lib/netsCheckout.ts` tjekker at alle tre findes.

### 2. Rigtig Nets API i `netsCheckout.ts` (kode)

Fil: `src/app/lib/netsCheckout.ts` — funktionen `createNetsPaymentSession()` er **placeholder**.

Skal implementeres:

- Opret betalingssession via Nets REST API
- Beløb i **øre** (`totalAmount * 100`)
- Valgt metode: `card` eller `mobilepay`
- Unikt order reference (fx `productId` + timestamp)
- Købers navn, e-mail, telefon fra `address`
- Return URL: `{origin}/products/{productId}/checkout/success?transactionId={id}`
- Cancel URL: `{origin}/products/{productId}/checkout?cancelled=1`
- Returnér `{ status: "redirect", redirectUrl: netsPaymentUrl }` så checkout sender brugeren til Nets

### 3. Ordregennemførelse på success-siden (kode)

Fil: `src/app/products/[id]/checkout/success/page.tsx`

Skal implementeres:

1. Læs `transactionId` fra query params
2. Kald Nets API og **verificér** at betalingen er godkendt
3. Ved godkendt betaling:
   - `products.sold = true`
   - Opret/find chat mellem køber og sælger
   - Send ordrebekræftelse som besked i chat
4. Vis bekræftelse til køber

Uden dette sker der betaling hos Nets, men appen ved det ikke — produktet forbliver usolgt.

### 4. (Anbefalet) Webhook fra Nets

Fil der skal oprettes: `src/app/api/checkout/nets/webhook/route.ts`

Nets kan sende server-til-server besked ved godkendt/afvist betaling. Det sikrer ordregennemførelse, selv hvis brugeren lukker browseren efter betaling.

Webhook bør:

- Validere signatur fra Nets
- Idempotent opdatere ordrestatus
- Markere produkt som solgt og underrette sælger

### 5. (Anbefalet) Ordretabel i Supabase

Der findes **ingen** `orders`-tabel i dag. Bud og køb håndteres kun via chat-beskeder.

Til produktion bør I overveje:

| Tabel / felt | Formål |
|---|---|
| `orders` | Gem køb: produkt, køber, sælger, beløb, levering, status |
| `orders.nets_transaction_id` | Kobling til Nets for verifikation |
| `orders.status` | `pending` → `paid` → `completed` / `cancelled` |

Uden ordretabel er det sværere at undgå dobbeltkøb og spore betalingsstatus.

---

## Betalingsmetoder i appen

| ID | Label | Beskrivelse |
|---|---|---|
| `card` | Betalkort | Dankort, Visa, Mastercard via Nets |
| `mobilepay` | MobilePay | MobilePay via Nets |

Defineret i `src/app/lib/paymentMethods.ts`. Knappen "Betal" er deaktiveret, indtil en metode er valgt.

---

## Relevante filer

| Fil | Status | Rolle |
|---|---|---|
| `src/app/products/[id]/page.tsx` | ✓ Klar | Giv bud + Køb nu |
| `src/app/components/Products/OfferBidDrawer.tsx` | ✓ Klar | Bud-flow via chat |
| `src/app/products/[id]/checkout/page.tsx` | ✓ UI klar | Checkout — kalder Nets API |
| `src/app/lib/paymentMethods.ts` | ✓ Klar | Betalkort + MobilePay |
| `src/app/lib/shippingAddress.ts` | ✓ Klar | Adresse fra/til profil |
| `src/app/api/checkout/nets/route.ts` | ✓ Klar | Validerer og kalder Nets-session |
| `src/app/lib/netsCheckout.ts` | ✗ Mangler | Opretter Nets-betalingssession |
| `src/app/products/[id]/checkout/success/page.tsx` | ✗ Mangler | Verificer betaling + fuldfør ordre |
| `src/app/api/checkout/nets/webhook/route.ts` | ✗ Mangler | Server-side betalingsbekræftelse |
| Supabase `orders`-tabel | ✗ Mangler | Persistent ordrestatus |

---

## Status-oversigt

| Del | Virker nu? | Trækker penge? |
|---|---|---|
| Giv bud → chat | Ja | Nej |
| Køb nu → checkout UI | Ja | Nej |
| Vælg betalingsmetode | Ja (UI) | Nej |
| Klik "Betal" | Ja (kalder API) | **Nej** |
| Redirect til Nets | Nej | Nej |
| Verificér betaling | Nej | Nej |
| Markér produkt solgt | Nej | Nej |
| Underret sælger ved køb | Nej | Nej |

---

## Checkliste før go-live

- [ ] Nets merchant-konto oprettet hos Nexi
- [ ] Miljøvariabler sat lokalt og på Vercel
- [ ] `createNetsPaymentSession()` implementeret med rigtig Nets API
- [ ] Success-side verificerer `transactionId` mod Nets
- [ ] Produkt markeres **kun** som solgt efter bekræftet betaling
- [ ] Sælger underrettes via chat ved gennemført køb
- [ ] (Anbefalet) Webhook-endpoint til server-side bekræftelse
- [ ] (Anbefalet) `orders`-tabel i Supabase
- [ ] Test i Nets sandbox: kort + MobilePay
- [ ] Test afbrudt betaling (`?cancelled=1`) — produkt forbliver usolgt
- [ ] Test gennemført køb — produkt markeres solgt

---

## Test (når Nets er sat op)

1. Brug Nets **test/sandbox**-miljø før produktion
2. Test `card` og `mobilepay`
3. Verificér at produktet **ikke** er solgt ved afbrudt eller fejlet betaling
4. Verificér at produktet **er** solgt efter bekræftet betaling på success-siden
5. Verificér at sælger modtager besked i chat

---

## Support

- **Nets/Nexi credentials og API:** Kontakt Nexi/Nets support eller jeres payment-ansvarlige
- **Kodeintegration i dette projekt:** Se filerne under **Relevante filer** ovenfor
