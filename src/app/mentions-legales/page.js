export const metadata = {
  title: 'Mentions légales — Sonarti Records',
};

export default function MentionsLegalesPage() {
  return (
    <div>
      <div style={{
        padding: '40px 40px 32px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--color-bordeaux)',
          marginBottom: '10px',
          fontWeight: '300',
        }}>Sonarti Records</p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '32px',
          fontWeight: '400',
        }}>Mentions légales</h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        borderBottom: '0.5px solid var(--color-bordure)',
      }}>
        <div style={{
          padding: '40px 36px 40px 40px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>

          {[
            {
              titre: 'Éditeur du site',
              contenu: [
                'Les Productions Sonarti',
                'Organisme à but non lucratif (OBNL)',
                'contact@sonarti.com',
              ],
            },
            {
              titre: 'Directeur de la publication',
              contenu: [
                'Guillaume Sutre',
              ],
            },
            {
              titre: 'Hébergement',
              contenu: [
                'Ce site est hébergé et administré par Les Productions Sonarti.',
              ],
            },
            {
              titre: 'Propriété intellectuelle',
              contenu: [
                'L\'ensemble du contenu de ce site (textes, images, vidéos, enregistrements sonores) est la propriété exclusive des Productions Sonarti et des artistes concernés.',
                'Toute reproduction, représentation, modification ou exploitation non autorisée de ce contenu est strictement interdite.',
              ],
            },
            {
              titre: 'Données personnelles',
              contenu: [
                'Les informations collectées via le formulaire de contact sont utilisées uniquement pour répondre à vos demandes.',
                'Elles ne sont ni vendues, ni transmises à des tiers.',
                'Conformément à la loi, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles.',
                'Pour exercer ce droit, contactez-nous à : contact@sonarti.com',
              ],
            },
            {
              titre: 'Cookies',
              contenu: [
                'Ce site utilise des cookies techniques nécessaires à son fonctionnement.',
                'Le widget Facebook intégré peut déposer des cookies tiers soumis à la politique de confidentialité de Meta.',
              ],
            },
            {
              titre: 'Liens hypertextes',
              contenu: [
                'Les Productions Sonarti ne peuvent être tenues responsables du contenu des sites externes vers lesquels ce site renvoie.',
              ],
            },
          ].map(({ titre, contenu }) => (
            <div key={titre} style={{
              marginBottom: '32px',
              paddingBottom: '32px',
              borderBottom: '0.5px solid var(--color-bordure-legere)',
            }}>
              <p style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'var(--color-bordeaux)',
                marginBottom: '12px',
                fontWeight: '300',
              }}>{titre}</p>
              {contenu.map((ligne, i) => (
                <p key={i} style={{
                  fontSize: '14px',
                  lineHeight: '1.75',
                  color: 'var(--color-texte-secondaire)',
                  fontWeight: '300',
                  marginBottom: '6px',
                }}>{ligne}</p>
              ))}
            </div>
          ))}
        </div>

        <div style={{ padding: '40px 28px' }}>
          <div style={{
            background: 'var(--color-bg-alt)',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Contact</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
              marginBottom: '10px',
            }}>Les Productions Sonarti<br />Organisme à but non lucratif</p>
            <a href="mailto:contact@sonarti.com" style={{
              fontSize: '13px',
              color: 'var(--color-bordeaux)',
              fontWeight: '300',
              borderBottom: '0.5px solid var(--color-bordeaux)',
            }}>contact@sonarti.com</a>
          </div>

          <div style={{
            background: 'var(--color-bg-alt)',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Politique de confidentialité</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
            }}>
              Pour toute question relative à la protection de vos données personnelles, 
              contactez-nous directement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}