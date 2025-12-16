import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Força rota dinâmica
export const dynamic = 'force-dynamic'

// Criar transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, password } = body

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://malaquiascontabilidade.com.br'}/admin/login`
    const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER

    await transporter.sendMail({
      from: `"Malaquias Contabilidade" <${fromEmail}>`,
      to: email,
      subject: 'Suas credenciais de acesso - Painel Admin',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #d4af37; margin: 0; font-size: 24px; font-weight: 700;">
                Malaquias Contabilidade
              </h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">
                Painel Administrativo
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 20px;">
                Olá, ${name}!
              </h2>

              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Sua conta de acesso ao painel administrativo foi criada. Abaixo estão suas credenciais de login:
              </p>

              <!-- Credentials Box -->
              <div style="background-color: #f8f9fa; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #d4af37;">
                <div style="margin-bottom: 15px;">
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Email</span>
                  <p style="color: #1a1a2e; font-size: 16px; margin: 5px 0 0 0; font-weight: 600;">${email}</p>
                </div>
                <div>
                  <span style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Senha</span>
                  <p style="color: #1a1a2e; font-size: 16px; margin: 5px 0 0 0; font-weight: 600; font-family: monospace; background: #fff; padding: 8px 12px; border-radius: 6px; display: inline-block;">${password}</p>
                </div>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%); color: #1a1a2e; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Acessar Painel
                </a>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #fff3cd; border-radius: 8px; padding: 15px; border-left: 4px solid #ffc107;">
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.5;">
                  <strong>Importante:</strong> Recomendamos que você altere sua senha após o primeiro acesso. Mantenha suas credenciais em segurança e não compartilhe com terceiros.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                Este email foi enviado automaticamente pelo sistema.<br>
                Malaquias Contabilidade - Menos impostos, mais lucro no seu bolso.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ message: 'Email enviado com sucesso' })
  } catch (error) {
    console.error('Erro no POST /api/admin/users/send-credentials:', error)
    return NextResponse.json({ error: 'Erro ao enviar email' }, { status: 500 })
  }
}
