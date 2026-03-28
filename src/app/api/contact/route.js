import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { prenom, nom, email, sujet, message } = await request.json();

    if (!prenom || !nom || !email || !message) {
      return Response.json(
        { error: 'Tous les champs sont obligatoires.' },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: 'Duo Sutre-Kim <onboarding@resend.dev>',
      to: 'guiguisutre@gmail.com',
      replyTo: email,
      subject: `[Duo Sutre-Kim] ${sujet} — ${prenom} ${nom}`,
      html: `
        <h2>Nouveau message depuis duo-sutre-kim.com</h2>
        <p><strong>De :</strong> ${prenom} ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${sujet}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return Response.json(
      { error: 'Erreur lors de l\'envoi du message.' },
      { status: 500 }
    );
  }
}