import "../profile.css";
import "../profil.css";

export default function IndstillingerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="profile-page profile-page--standalone">{children}</div>;
}
