// backend/src/services/paymentService.js
const stripe = require('stripe')(require('../config').stripe.secretKey); // Initialize Stripe with secret key
const Booking = require('../models/Booking'); // To update booking payment status
const config = require('../config');

/**
 * @desc    Crea un Payment Intent de Stripe.
 * @param   {string} bookingId - ID de la reserva asociada al pago.
 * @param   {number} amount - Monto a pagar en la unidad más pequeña de la moneda (ej. centavos para USD).
 * @param   {string} currency - Moneda (ej. 'eur', 'usd').
 * @returns {Object} El Payment Intent (client_secret).
 * @throws  {Error} Si ocurre un error con Stripe o los datos son inválidos.
 */
const createPaymentIntent = async (bookingId, amount, currency = 'eur') => {
    try {
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            throw new Error('Booking not found for payment.');
        }

        // Ensure amount is positive and valid
        if (amount <= 0 || !Number.isInteger(amount)) {
            throw new Error('Invalid amount for payment intent. Amount must be a positive integer.');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents/smallest currency unit
            currency: currency,
            metadata: { booking_id: bookingId.toString() }, // Link to your booking
            // Optional: description, receipt_email etc.
        });

        // Update booking status to reflect pending payment if needed
        booking.paymentStatus = 'pending';
        await booking.save();

        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error('Error in createPaymentIntent service:', error.message);
        throw new Error(`Could not create payment intent: ${error.message}`);
    }
};

/**
 * @desc    Procesa un evento de webhook de Stripe (ej. pago exitoso, reembolso).
 * @param   {Object} event - El objeto de evento de Stripe.
 * @returns {Object} Resultado del procesamiento del evento.
 * @throws  {Error} Si el evento no puede ser verificado o procesado.
 */
const handleWebhookEvent = async (event) => {
    try {
        // En un entorno real, aquí verificarías la firma del webhook para seguridad
        // const signature = req.headers['stripe-signature'];
        // const event = stripe.webhooks.constructEvent(req.rawBody, signature, config.stripe.webhookSecret);

        let bookingId;
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                bookingId = paymentIntent.metadata.booking_id;
                console.log(`PaymentIntent for ${paymentIntent.amount} was successful for booking ${bookingId}!`);
                if (bookingId) {
                    const booking = await Booking.findById(bookingId);
                    if (booking) {
                        booking.paymentStatus = 'paid';
                        booking.paymentId = paymentIntent.id;
                        await booking.save();
                        console.log(`Booking ${bookingId} payment status updated to PAID.`);
                    }
                }
                // Handle successful payment: update order status, fulfill service, send confirmation
                break;
            case 'payment_intent.payment_failed':
                const failedPaymentIntent = event.data.object;
                bookingId = failedPaymentIntent.metadata.booking_id;
                console.log(`PaymentIntent for ${failedPaymentIntent.amount} failed for booking ${bookingId}.`);
                if (bookingId) {
                    const booking = await Booking.findById(bookingId);
                    if (booking) {
                        booking.paymentStatus = 'pending'; // Or 'failed'
                        await booking.save();
                        console.log(`Booking ${bookingId} payment status updated to FAILED.`);
                    }
                }
                // Handle payment failure: notify user, mark order as failed
                break;
            case 'charge.refunded':
                const charge = event.data.object;
                // Assuming you store charge IDs in bookings or other related records
                // Find booking by paymentIntentId or chargeId and update status to 'refunded'
                console.log(`Charge ${charge.id} was refunded.`);
                // Implement logic to find and update relevant booking/record
                break;
            // Handle other event types as needed
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        return { received: true };
    } catch (error) {
        console.error('Error handling Stripe webhook event:', error.message);
        throw new Error(`Failed to process webhook event: ${error.message}`);
    }
};

/**
 * @desc    Procesa un reembolso para un pago exitoso.
 * @param   {string} paymentIntentId - El ID del Payment Intent a reembolsar.
 * @param   {number} [amount] - Cantidad a reembolsar (opcional, si es un reembolso parcial).
 * @returns {Object} El objeto de reembolso.
 * @throws  {Error} Si el reembolso falla.
 */
const processPaymentRefund = async (paymentIntentId, amount = null) => {
    try {
        const refundOptions = { payment_intent: paymentIntentId };
        if (amount !== null && Number.isInteger(amount) && amount > 0) {
            refundOptions.amount = amount;
        }

        const refund = await stripe.refunds.create(refundOptions);

        // Optional: Update booking's paymentStatus to 'refunded'
        // You'd need to find the booking linked to this paymentIntentId
        const booking = await Booking.findOne({ paymentId: paymentIntentId });
        if (booking) {
            booking.paymentStatus = 'refunded';
            await booking.save();
        }

        return refund;
    } catch (error) {
        console.error('Error processing refund:', error.message);
        throw new Error(`Could not process refund: ${error.message}`);
    }
};


module.exports = {
    createPaymentIntent,
    handleWebhookEvent,
    processPaymentRefund,
};
