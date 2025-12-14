This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## NOter
<!-- package.json  -->
package.json beskriver projektets scripts, afhængigheder og udviklingsværktøjer. 
Under "scripts" ligger tre kommandoer: 
"dev" starter udviklingsserveren med next dev, 
"build" bygger applikationen til produktion
"start" kører den færdigbyggede version. 

Det er de tre standard-scripts i et Next.js-projekt.

Under "dependencies" ligger alle de biblioteker, som koden afhænger af i runtime. 
Der er Emotion og MUI, som bruges til styling og komponenter i React. 
React Three Fiber og Three bruges til 3D-grafik i browseren, hvor Three er selve WebGL-motoren, og React Three Fiber er React-laget, der giver en deklarativ måde at opbygge scener på.
GSAP står for animationer. 
Supabase/SSR bliver brugt til server-side sessionhåndtering eller datahåndtering. 
Sentry integrerer fejltracking med Next.js. 
Next, React og React-DOM er kernen i selve applikationen, og versionerne her svarer til den generation af Next.js, der bruger React 19. 
Alle disse pakker er nødvendige for, at applikationen kan fungere, når den kører i browseren eller på serveren.

Under "devDependencies" ligger alt det, der kun bruges under udvikling – ikke når applikationen kører i produktion. 
Her ligger typescript, som giver typekontrol og udviklingsfejl, og @types/three, som tilføjer TypeScript-typer til Three, så editoren forstår 3D-objekter, materialer, kameraer osv.

Samlet set definerer package.json, hvilke værktøjer Next.js skal bruge til at udvikle, bygge og køre projektet, og den adskiller klart det, der kræves i runtime, fra det der kun er nødvendigt for udviklingsoplevelsen.


<!-- package-lock.json -->
Den garantierer deterministiske installationer, stabilitet og reproducerbare builds.

package-lock.json bruges til at låse de præcise versioner af alle projektets afhængigheder – både dem du selv har installeret, og alle deres under-afhængigheder. Hvor package.json kun beskriver hvilke pakker du bruger, beskriver package-lock.json nøjagtigt hvilke versioner der blev installeret på det tidspunkt.

På den måde sikrer filen, at alle udviklere på projektet – og også produktionsmiljøet – får præcis den samme pakkeversion, så der ikke opstår fejl, der kun sker nogle steder. 
Den gør installationer hurtigere, fordi npm kan bruge den som opskrift i stedet for at beslutte versioner på ny. 
Den bruges også til sikkerhedsscanninger, fordi den indeholder et fuldt træ af alle pakker.


<!-- eas.json -->
eas.json bruges i Expo-projekter til at styre hele build- og deploy-processen, når man bruger Expo Application Services (EAS). Filen fortæller EAS, hvordan appen skal bygges, hvilke profiler der findes (fx development, preview eller production), og hvilke platforme der skal bygges til.


<!--  -->
