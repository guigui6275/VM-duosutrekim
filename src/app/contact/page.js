'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', sujet: 'Demande de concert', message: ''
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setStatus('success');
        setForm({ prenom: '', nom: '', email: '', sujet: 'Demande de concert', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

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
          color: 'var(--color-or)',
          marginBottom: '10px',
          fontWeight: '300',
        }}>Duo Sutre-Kim</p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '32px',
          fontWeight: '400',
          marginBottom: '8px',
        }}>Contact</h1>
        <p style={{
          fontSize: '15px',
          color: 'var(--color-texte-secondaire)',
          fontWeight: '300',
        }}>Pour toute demande de concert, interview ou information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px' }}>
        <form onSubmit={handleSubmit} style={{
          padding: '36px 36px 36px 40px',
          borderRight: '0.5px solid var(--color-bordure)',
        }}>
          <p style={{
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: '20px',
            fontWeight: '300',
          }}>Nous écrire</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
            {[
              { label: 'Prénom', key: 'prenom' },
              { label: 'Nom', key: 'nom' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label style={{
                  display: 'block',
                  fontSize: '11px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--color-texte-muted)',
                  marginBottom: '6px',
                  fontWeight: '300',
                }}>{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '0.5px solid var(--color-bordure)',
                    background: 'var(--color-bg)',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '14px',
                    color: 'var(--color-texte)',
                    fontWeight: '300',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '0.5px solid var(--color-bordure)',
                background: 'var(--color-bg)',
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                color: 'var(--color-texte)',
                fontWeight: '300',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Sujet</label>
            <select
              value={form.sujet}
              onChange={e => setForm({ ...form, sujet: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '0.5px solid var(--color-bordure)',
                background: 'var(--color-bg)',
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                color: 'var(--color-texte)',
                fontWeight: '300',
                boxSizing: 'border-box',
                outline: 'none',
                appearance: 'none',
              }}
            >
              <option>Demande de concert</option>
              <option>Interview / presse</option>
              <option>Renseignement général</option>
              <option>Autre</option>
            </select>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--color-texte-muted)',
              marginBottom: '6px',
              fontWeight: '300',
            }}>Message</label>
            <textarea
              rows={5}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '0.5px solid var(--color-bordure)',
                background: 'var(--color-bg)',
                fontFamily: 'var(--font-serif)',
                fontSize: '14px',
                color: 'var(--color-texte)',
                fontWeight: '300',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {status === 'success' && (
            <p style={{
              fontSize: '13px',
              color: 'green',
              marginBottom: '16px',
              fontWeight: '300',
            }}>Message envoyé avec succès. Nous vous répondrons bientôt.</p>
          )}

          {status === 'error' && (
            <p style={{
              fontSize: '13px',
              color: 'red',
              marginBottom: '16px',
              fontWeight: '300',
            }}>Une erreur s'est produite. Veuillez réessayer.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 28px',
              background: loading ? 'var(--color-texte-muted)' : 'var(--color-noir)',
              color: '#F8F4EF',
              fontSize: '11px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-serif)',
              border: 'none',
              fontWeight: '300',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Envoi...' : 'Envoyer'}
          </button>
        </form>

        <div style={{ padding: '36px 28px' }}>
          <div style={{
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '0.5px solid var(--color-bordure-legere)',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Site web</p>
            <a href="https://duosutrekim.com" style={{
              fontSize: '13px',
              color: 'var(--color-or)',
              fontWeight: '300',
              borderBottom: '0.5px solid var(--color-or)',
            }}>duosutrekim.com</a>
          </div>

          <div style={{
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '0.5px solid var(--color-bordure-legere)',
          }}>
            <p style={{
              fontSize: '10px',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
              marginBottom: '10px',
              fontWeight: '300',
            }}>Label</p>
            <a href="https://sonarti.com/contact" style={{
              fontSize: '13px',
              color: 'var(--color-or)',
              fontWeight: '300',
              borderBottom: '0.5px solid var(--color-or)',
            }}>Sonarti Records</a>
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
            }}>Booking & presse</p>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-texte-secondaire)',
              lineHeight: '1.6',
              fontWeight: '300',
            }}>Pour les demandes de booking et de presse, contactez directement Les Productions Sonarti.</p>
          </div>
        </div>
      </div>
    </div>
  );
}