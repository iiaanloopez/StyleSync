// backend/src/utils/emailSender.js
const nodemailer = require('nodemailer');
const config = require('../config'); // Importar la configuración de email

/**
 * @desc    Envía un correo electrónico utilizando la configuración definida.
 * @param   {Object} options - Opciones para el correo electrónico (to, subject, text, html).
 * @returns {Promise<Object>} Información sobre el envío del correo.
 */
const sendEmail = async (options) => {
    // 1. Crear un transporter de Nodemailer usando las credenciales SMTP de tu configuración
    const transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port == 465, // true para 465, false para otros puertos (como 587)
        auth: {
            user: config.email.user, // Tu nombre de usuario SMTP (ej. API Key de SendGrid)
            pass: config.email.pass, // Tu contraseña SMTP (ej. Secreto de SendGrid)
        },
    });

    // 2. Definir las opciones del correo electrónico
    const mailOptions = {
        from: config.email.from, // Dirección del remitente (ej. 'no-reply@barberbooking.com')
        to: options.to,          // Dirección(es) del destinatario
        subject: options.subject, // Asunto del correo
        text: options.text,       // Contenido de texto plano (para clientes de email sin HTML)
        html: options.html,       // Contenido HTML (para correos más bonitos)
    };

    // 3. Enviar el correo electrónico
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        // info.response contiene la respuesta del servidor SMTP
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Lanzar el error para que sea capturado por el middleware de manejo de errores
        throw new Error('Failed to send email.');
    }
};

module.exports = {
    sendEmail,
};
