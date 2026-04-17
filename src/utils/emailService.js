const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const logger = require('./logger');

/**
 * Returns true if Resend API key is configured.
 */
const isEmailConfigured = () => {
    return !!(config.email.resendApiKey && !config.email.resendApiKey.includes('dummy'));
};

// ── Load & compile template ───────────────────────────────────────────────────
const loadTemplate = (templateName, variables = {}) => {
    const filePath = path.join(
        __dirname,
        '../templates/email',
        `${templateName}.html`
    );
    let html = fs.readFileSync(filePath, 'utf8');
    Object.entries(variables).forEach(([key, value]) => {
        html = html.replaceAll(`{{${key}}}`, value);
    });
    return html;
};

// ── Send email via Resend ─────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
    if (!isEmailConfigured()) {
        logger.warn('[EmailService] RESEND_API_KEY tidak ditemukan — email tidak dikirim.');
        logger.info(`[EmailService] Tujuan: ${to} | Subjek: ${subject}`);
        return;
    }

    const resend = new Resend(config.email.resendApiKey);
    const { error } = await resend.emails.send({
        from: config.email.from,
        to,
        subject,
        html,
    });

    if (error) {
        logger.error('[EmailService] Resend error:', { name: error.name, message: error.message, statusCode: error.statusCode });
        throw new Error(`Resend: ${error.message}`);
    }
    logger.info(`[EmailService] Email terkirim ke ${to} — "${subject}"`);
};

// ── Specific email: Verifikasi Email ──────────────────────────────────────────
const sendVerificationEmail = async (toEmail, name, verifyUrl) => {
    const html = loadTemplate('verifyEmail', { name, verifyUrl });

    if (!isEmailConfigured()) {
        logger.info('─'.repeat(60));
        logger.info('[EmailService] MODE DEVELOPMENT — Email tidak dikirim (API key tidak ada).');
        logger.info(`[EmailService] Link verifikasi untuk ${toEmail}:`);
        logger.info(`[EmailService] ${verifyUrl}`);
        logger.info('─'.repeat(60));
        return;
    }

    try {
        await sendEmail({
            to: toEmail,
            subject: 'Verifikasi Email Anda — KapanNikah',
            html,
        });
    } catch (err) {
        // Dalam mode development: jangan crash — tampilkan link di terminal
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('[EmailService] Gagal kirim via Resend, fallback ke console:');
            logger.info('─'.repeat(60));
            logger.info(`[EmailService] Link verifikasi untuk ${toEmail}:`);
            logger.info(`[EmailService] ${verifyUrl}`);
            logger.info('─'.repeat(60));
            return;
        }
        throw err;
    }
};

module.exports = { sendVerificationEmail, sendEmail };
