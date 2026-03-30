export const dynamic = 'force-static';

import Link from "next/link";

export default function NotFound() {
    return (
        <main className="not-found-page">
            <p>404</p>
            <h1>Siden findes ikke.</h1>
            <p>Prøv shoppen eller gå tilbage til forsiden.</p>
            <Link href="/shop" className="landing-primary-link">
                Gå til shop
            </Link>
        </main>
    )
}
