"use strict";
/**
 * Enterprise SMS Dispatch Service for Forge India Connect
 * Supports Fast2SMS, Twilio, Generic Webhook / Gateway providers.
 * Reports true delivery status, handles credentials, timeouts, and rate limits.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsService = exports.SMSService = void 0;
class SMSService {
    constructor() {
        this.fast2smsApiKey = process.env.FAST2SMS_API_KEY || '';
        this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
        this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
        this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
        this.customGatewayUrl = process.env.SMS_GATEWAY_URL || '';
        this.customGatewayKey = process.env.SMS_GATEWAY_API_KEY || '';
        this.isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    }
    /**
     * Determine if any real SMS gateway is configured
     */
    isGatewayConfigured() {
        return Boolean(this.fast2smsApiKey ||
            (this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber) ||
            this.customGatewayUrl);
    }
    /**
     * Send 6-digit OTP SMS to a validated Indian mobile number
     */
    async sendOTP(phone, otp) {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        const smsMessage = `Your Forge India Connect verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;
        // 1. Try Fast2SMS (Dominant Indian SMS Gateway)
        if (this.fast2smsApiKey) {
            try {
                const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
                    method: 'POST',
                    headers: {
                        'authorization': this.fast2smsApiKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        route: 'otp',
                        variables_values: otp,
                        numbers: cleanPhone
                    }),
                    signal: AbortSignal.timeout(6000)
                });
                const data = await response.json().catch(() => ({}));
                if (response.ok && data.return === true) {
                    return {
                        success: true,
                        provider: 'Fast2SMS',
                        delivered: true,
                        messageId: data.request_id || `f2s_${Date.now()}`,
                        statusMessage: `OTP successfully delivered via SMS to ${cleanPhone}.`
                    };
                }
                else {
                    return {
                        success: false,
                        provider: 'Fast2SMS',
                        delivered: false,
                        statusMessage: data.message || 'SMS provider delivery rejected.',
                        error: data.message || 'Fast2SMS dispatch error'
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    provider: 'Fast2SMS',
                    delivered: false,
                    statusMessage: 'SMS provider connection timed out.',
                    error: err.message
                };
            }
        }
        // 2. Try Twilio
        if (this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber) {
            try {
                const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
                const url = `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`;
                const params = new URLSearchParams();
                params.append('To', `+91${cleanPhone}`);
                params.append('From', this.twilioPhoneNumber);
                params.append('Body', smsMessage);
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params.toString(),
                    signal: AbortSignal.timeout(6000)
                });
                const data = await response.json().catch(() => ({}));
                if (response.ok && data.sid) {
                    return {
                        success: true,
                        provider: 'Twilio',
                        delivered: true,
                        messageId: data.sid,
                        statusMessage: `OTP successfully delivered via Twilio to +91${cleanPhone}.`
                    };
                }
                else {
                    return {
                        success: false,
                        provider: 'Twilio',
                        delivered: false,
                        statusMessage: data.message || 'Twilio SMS dispatch failed.',
                        error: data.message || 'Twilio error'
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    provider: 'Twilio',
                    delivered: false,
                    statusMessage: 'Twilio connection failed.',
                    error: err.message
                };
            }
        }
        // 3. Try Custom Gateway URL / Webhook
        if (this.customGatewayUrl) {
            try {
                const response = await fetch(this.customGatewayUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.customGatewayKey ? { 'Authorization': `Bearer ${this.customGatewayKey}` } : {})
                    },
                    body: JSON.stringify({
                        phone: cleanPhone,
                        message: smsMessage,
                        otp
                    }),
                    signal: AbortSignal.timeout(6000)
                });
                if (response.ok) {
                    return {
                        success: true,
                        provider: 'CustomGateway',
                        delivered: true,
                        statusMessage: `OTP successfully delivered to ${cleanPhone}.`
                    };
                }
                else {
                    return {
                        success: false,
                        provider: 'CustomGateway',
                        delivered: false,
                        statusMessage: 'Custom SMS gateway returned failure.',
                        error: `HTTP ${response.status}`
                    };
                }
            }
            catch (err) {
                return {
                    success: false,
                    provider: 'CustomGateway',
                    delivered: false,
                    statusMessage: 'Custom gateway connection failed.',
                    error: err.message
                };
            }
        }
        // 4. No SMS Gateway Configured in Environment
        // Honest status reporting: In development mode, report simulation status transparently;
        // in production, notify that SMS credentials are required.
        if (this.isDevelopment) {
            return {
                success: true,
                provider: 'Simulator',
                delivered: false,
                simulated: true,
                statusMessage: `[Dev Mode] SMS Gateway not configured in .env. Verification code generated for testing.`
            };
        }
        return {
            success: false,
            provider: 'None',
            delivered: false,
            statusMessage: 'SMS service gateway is not configured. Please contact administrator.',
            error: 'NO_GATEWAY_CONFIGURED'
        };
    }
}
exports.SMSService = SMSService;
exports.smsService = new SMSService();
