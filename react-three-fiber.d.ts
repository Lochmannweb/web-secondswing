/// <reference types="@react-three/fiber" />

// ambient type definition-fil
// Den bruges, når du vil fortælle TypeScript, at projektet skal indlæse typer fra en bestemt pakke – også selvom du ikke importerer noget direkte i filen.
// TypeScript skal automatisk inkludere alle typer, som @react-three/fiber eksporterer.
// Det gør projektet i stand til at forstå JSX-elementer og props, der kommer fra React Three Fiber, uden at du manuelt skal importere typer.
// Den bruges især i projekter, hvor TypeScript ellers ikke opdager typerne af sig selv (fx i Next.js, hvor typer nogle gange ikke bliver hentet automatisk).

// <mesh />
// <ambientLight />
// <OrbitControls />