const nodemailer = require('nodemailer');
const twilio = require('twilio');
const supabase = require('../config/supabase');

// Node.js native fetch is used for direct HTTP integrations (Meta WhatsApp, Resend API)

// 1. Configure SMTP Transporter (Brevo SMTP or similar)
let smtpTransporter;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// 2. Configure Twilio Client (SMS / WhatsApp sandbox)
let twilioClient;
const twilioSid = process.env.TWILIO_SID || process.env.TWILIO_ACCOUNT_SID;
const twilioToken = process.env.TWILIO_AUTH_TOKEN;
if (twilioSid && twilioToken) {
  twilioClient = twilio(twilioSid, twilioToken);
}

/**
 * Sends an email using Resend API (HTTP) or Nodemailer (SMTP).
 */
const sendEmail = async (to, subject, htmlBody) => {
  try {
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
          to: [to],
          subject: subject,
          html: htmlBody,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Resend API Error');
      }

      console.log(`Email successfully dispatched via Resend API. ID: ${resData.id}`);
      return { success: true, provider: 'resend', id: resData.id };
    }

    if (smtpTransporter) {
      const info = await smtpTransporter.sendMail({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to,
        subject,
        html: htmlBody,
        text: htmlBody.replace(/<[^>]*>/g, ''),
      });

      console.log(`Email successfully dispatched via SMTP. MsgId: ${info.messageId}`);
      return { success: true, provider: 'smtp', id: info.messageId };
    }

    console.log(`[Messaging Mock - EMAIL DISPATCH]
To: ${to}
Subject: ${subject}
HTML Body: ${htmlBody.substring(0, 300)}...
---------------------------------------------`);
    return { success: true, provider: 'mock' };
  } catch (err) {
    console.error('sendEmail failure:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends a WhatsApp message using Meta's Cloud API directly, or falling back to Twilio.
 */
const sendWhatsApp = async (to, body) => {
  try {
    let formattedTo = to.trim().replace(/[\s-()]/g, '');

    if (process.env.WHATSAPP_RECIPIENT_OVERRIDE) {
      formattedTo = process.env.WHATSAPP_RECIPIENT_OVERRIDE.trim().replace(/[\s-()]/g, '');
    }

    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (process.env.WHATSAPP_TOKEN && whatsappPhoneId) {
      const cleanPhone = formattedTo.replace('whatsapp:', '').replace('+', '');
      
      const response = await fetch(`https://graph.facebook.com/v19.0/${whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: {
            preview_url: false,
            body: body,
          },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Meta WhatsApp Cloud API Error');
      }

      console.log(`WhatsApp message successfully dispatched via Meta Cloud API. MsgId: ${resData.messages?.[0]?.id}`);
      return { success: true, provider: 'meta', id: resData.messages?.[0]?.id };
    }

    if (twilioClient) {
      const twilioTo = formattedTo.startsWith('whatsapp:') ? formattedTo : `whatsapp:${formattedTo}`;
      const twilioFrom = process.env.TWILIO_PHONE || process.env.TWILIO_PHONE_NUMBER || 'whatsapp:+14155238886';

      const message = await twilioClient.messages.create({
        body: body,
        from: twilioFrom,
        to: twilioTo,
      });

      console.log(`WhatsApp message successfully dispatched via Twilio API. SID: ${message.sid}`);
      return { success: true, provider: 'twilio', id: message.sid };
    }

    console.log(`[Messaging Mock - WHATSAPP DISPATCH]
To: ${formattedTo}
Body: ${body}
---------------------------------------------`);
    return { success: true, provider: 'mock' };
  } catch (err) {
    console.error('sendWhatsApp failure:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Sends an SMS using Twilio trial credits.
 */
const sendSMS = async (to, body) => {
  try {
    let formattedTo = to.trim().replace(/[\s-()]/g, '');
    if (process.env.WHATSAPP_RECIPIENT_OVERRIDE) {
      formattedTo = process.env.WHATSAPP_RECIPIENT_OVERRIDE.trim().replace(/[\s-()]/g, '');
    }

    if (twilioClient) {
      const cleanPhone = formattedTo.replace('whatsapp:', '');
      const twilioSmsFrom = process.env.TWILIO_SMS_FROM;

      if (twilioSmsFrom) {
        const message = await twilioClient.messages.create({
          body: body,
          from: twilioSmsFrom,
          to: cleanPhone,
        });

        console.log(`SMS successfully dispatched via Twilio. SID: ${message.sid}`);
        return { success: true, provider: 'twilio-sms', id: message.sid };
      }
    }

    console.log(`[Messaging Mock - SMS DISPATCH]
To: ${formattedTo}
Body: ${body}
---------------------------------------------`);
    return { success: true, provider: 'mock' };
  } catch (err) {
    console.error('sendSMS failure:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Helper to interpolate template variables.
 */
const compileTemplate = (templateText, variables) => {
  let output = templateText;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    output = output.replace(regex, variables[key] !== undefined && variables[key] !== null ? variables[key] : '');
  });
  return output;
};

/**
 * Renders a premium HTML email wrapper with clinic branding, treatments image, and footers.
 */
const renderBrandedEmail = (patientName, bodyContent, treatmentName, imageUrl, clinicInfo) => {
  const defaultImage = 'https://images.unsplash.com/photo-1579684389782-64d84b5e901d?q=80&w=600';
  const imgUrl = imageUrl || defaultImage;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verdant Skin Clinic</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF9F6; margin: 0; padding: 0; color: #1E2A28; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border: 1px solid rgba(18, 33, 30, 0.06); border-radius: 20px; overflow: hidden; box-shadow: 0 12px 30px rgba(18, 33, 30, 0.04); }
    .header { background-color: #1E2A28; padding: 35px 20px; text-align: center; color: #FAF9F6; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 300; letter-spacing: 3px; }
    .content { padding: 45px 35px; }
    .greeting { font-size: 18px; font-weight: 700; color: #1E2A28; margin-bottom: 24px; }
    .body-text { font-size: 15px; line-height: 1.65; color: #4A5553; margin-bottom: 30px; white-space: pre-line; }
    .treatment-card { background: #FAF9F6; border: 1px solid rgba(18, 33, 30, 0.08); border-radius: 14px; padding: 24px; text-align: center; margin: 35px 0; }
    .treatment-img { max-width: 100%; height: auto; border-radius: 10px; margin-bottom: 18px; box-shadow: 0 4px 12px rgba(18, 33, 30, 0.05); }
    .treatment-name { font-size: 16px; font-weight: 700; color: #1E2A28; margin-bottom: 4px; }
    .treatment-tag { font-size: 12px; color: #7A8583; letter-spacing: 0.5px; text-transform: uppercase; }
    .footer { background: #FAF9F6; border-top: 1px solid rgba(18, 33, 30, 0.06); padding: 30px 25px; text-align: center; font-size: 12px; color: #7A8583; line-height: 1.6; }
    .contact-info { margin-top: 16px; font-weight: 700; color: #1E2A28; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VERDANT SKIN CLINIC</h1>
    </div>
    <div class="content">
      <div class="greeting">Hello ${patientName},</div>
      <div class="body-text">${bodyContent}</div>
      <div class="treatment-card">
        <img class="treatment-img" src="${imgUrl}" alt="${treatmentName}" />
        <div class="treatment-name">${treatmentName}</div>
        <div class="treatment-tag">Your Consultation Selection</div>
      </div>
    </div>
    <div class="footer">
      <p>Thank you for choosing Verdant Skin Clinic. We look forward to seeing you.</p>
      <p>${clinicInfo.address}</p>
      <div class="contact-info">
        Call: ${clinicInfo.phone} | WhatsApp: ${clinicInfo.whatsapp}<br>
        Lead Practitioner: ${clinicInfo.doctor}
      </div>
    </div>
  </div>
</body>
</html>`;
};

/**
 * Auto-selects and dispatches the welcome greeting to a new Lead.
 */
const sendAutoWelcome = async (lead) => {
  try {
    let matchedTreatment = null;
    let template = null;

    // 1. Resolve Treatment from Supabase
    if (lead.treatment_id) {
      const { data: treatment } = await supabase
        .from('treatments')
        .select('*')
        .eq('id', lead.treatment_id)
        .maybeSingle();
      matchedTreatment = treatment;
    }

    // Load templates to find specific greeting
    const { data: allTemplates } = await supabase.from('templates').select('*');

    if (matchedTreatment && allTemplates) {
      // Find template matching treatment name (e.g. "Laser Resurfacing Welcome")
      template = allTemplates.find((t) =>
        t.name.toLowerCase().includes(matchedTreatment.name.toLowerCase())
      );
    }

    // Fall back to general greetings
    if (!template && allTemplates) {
      template = allTemplates.find((t) =>
        ['New Lead Welcome', 'Standard Welcome Greeting', 'Laser Resurfacing Welcome'].includes(t.name)
      );
    }

    if (!template) {
      console.warn('No welcome templates found in database. Message aborted.');
      return null;
    }

    // 2. Fetch Clinic Details from environment configs
    const clinicInfo = {
      phone: process.env.CLINIC_PHONE || '+91 98765 43210',
      whatsapp: process.env.CLINIC_WHATSAPP || '+91 98765 43210',
      address: process.env.CLINIC_ADDRESS || '404 Green Valley Blvd, Suite 100',
      doctor: process.env.DOCTOR_NAME || 'Dr. Ananya Sharma, MD',
    };

    const variables = {
      PatientName: lead.name,
      TreatmentInterested: lead.treatment_name || (matchedTreatment ? matchedTreatment.name : 'our treatments'),
      ClinicPhone: clinicInfo.phone,
      ClinicWhatsApp: clinicInfo.whatsapp,
      ClinicAddress: clinicInfo.address,
      DoctorName: clinicInfo.doctor,
    };

    // 3. Compile and Send message
    const compiledBody = compileTemplate(template.body, variables);

    if (template.channel === 'Email' && lead.email) {
      const subject = template.subject ? compileTemplate(template.subject, variables) : 'Welcome to Verdant Skin Clinic';
      const brandedHTML = renderBrandedEmail(lead.name, compiledBody, variables.TreatmentInterested, template.image, clinicInfo);

      await sendEmail(lead.email, subject, brandedHTML);

      return {
        channel: 'Email',
        direction: 'outbound',
        body: `Subject: ${subject}\n\n${compiledBody}`,
      };
    } else if (template.channel === 'WhatsApp' && lead.phone) {
      await sendWhatsApp(lead.phone, compiledBody);
      return {
        channel: 'WhatsApp',
        direction: 'outbound',
        body: compiledBody,
      };
    } else if (template.channel === 'SMS' && lead.phone) {
      await sendSMS(lead.phone, compiledBody);
      return {
        channel: 'SMS',
        direction: 'outbound',
        body: compiledBody,
      };
    }

    return null;
  } catch (err) {
    console.error('sendAutoWelcome failed:', err.message);
    return null;
  }
};

/**
 * Flexible dispatch of a custom message or template to a recipient.
 */
const send = async ({ templateId, customBody, channel, recipientEmail, recipientPhone, variables }) => {
  let finalBody = '';
  let finalChannel = channel;
  let subject = 'Notification from Verdant Skin Clinic';

  const clinicInfo = {
    phone: process.env.CLINIC_PHONE || '+91 98765 43210',
    whatsapp: process.env.CLINIC_WHATSAPP || '+91 98765 43210',
    address: process.env.CLINIC_ADDRESS || '404 Green Valley Blvd, Suite 100',
    doctor: process.env.DOCTOR_NAME || 'Dr. Ananya Sharma, MD',
  };

  const mergeFields = {
    ClinicPhone: clinicInfo.phone,
    ClinicWhatsApp: clinicInfo.whatsapp,
    ClinicAddress: clinicInfo.address,
    DoctorName: clinicInfo.doctor,
    ...(variables || {}),
  };

  if (templateId) {
    // Fetch template from Supabase
    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      throw new Error('Template not found');
    }
    finalChannel = template.channel;
    finalBody = compileTemplate(template.body, mergeFields);
    subject = template.subject ? compileTemplate(template.subject, mergeFields) : subject;
  } else if (customBody && channel) {
    finalBody = customBody;
    finalChannel = channel;
  } else {
    throw new Error('Must provide templateId or both customBody and channel');
  }

  if (finalChannel === 'Email') {
    if (!recipientEmail) throw new Error('Recipient email is required for Email channel');
    const emailHTML = renderBrandedEmail(mergeFields.PatientName || 'Client', finalBody, mergeFields.TreatmentInterested || 'Consultation', null, clinicInfo);
    await sendEmail(recipientEmail, subject, emailHTML);
    return {
      channel: 'Email',
      direction: 'outbound',
      body: `Subject: ${subject}\n\n${finalBody}`,
    };
  } else if (finalChannel === 'WhatsApp') {
    if (!recipientPhone) throw new Error('Recipient phone is required for WhatsApp channel');
    await sendWhatsApp(recipientPhone, finalBody);
    return {
      channel: 'WhatsApp',
      direction: 'outbound',
      body: finalBody,
    };
  } else if (finalChannel === 'SMS') {
    if (!recipientPhone) throw new Error('Recipient phone is required for SMS channel');
    await sendSMS(recipientPhone, finalBody);
    return {
      channel: 'SMS',
      direction: 'outbound',
      body: finalBody,
    };
  }

  throw new Error(`Unsupported channel: ${finalChannel}`);
};

module.exports = {
  sendEmail,
  sendWhatsApp,
  sendSMS,
  compileTemplate,
  sendAutoWelcome,
  send,
};
