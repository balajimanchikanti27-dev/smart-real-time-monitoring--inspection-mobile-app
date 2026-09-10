"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSubmissionSms = exports.onInspectorCreated = exports.onInspectionCreated = exports.onProjectCreated = exports.onNgoCreated = exports.onInstitutionCreated = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const firestore_1 = require("firebase-admin/firestore");
admin.initializeApp();
const db = (0, firestore_1.getFirestore)();
// Configure the email transport using Environment Variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const generateEmailTemplate = (userName, userEmail, recordType, recordName, recordId, extraDetails = "") => {
    const dateStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #0056b3;">
        <h2 style="margin: 0; color: #0056b3;">SMART INSPECT</h2>
        <p style="margin: 5px 0 0; font-size: 14px; color: #666;">Real-Time Inspection & Monitoring</p>
      </div>
      
      <div style="padding: 20px;">
        <h3 style="color: #28a745;">Submission Successful</h3>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Your ${recordType} has been successfully submitted to Smart Inspect.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #0056b3;">
          <h4 style="margin-top: 0;">Submission Details:</h4>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 4px 0; width: 120px;"><strong>Type:</strong></td><td>${recordType}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Name/Title:</strong></td><td>${recordName}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Reference ID:</strong></td><td>${recordId}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Submitted By:</strong></td><td>${userName}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Registered Email:</strong></td><td>${userEmail}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Date & Time:</strong></td><td>${dateStr}</td></tr>
            <tr><td style="padding: 4px 0;"><strong>Status:</strong></td><td><span style="color: #28a745; font-weight: bold;">Successfully Submitted</span></td></tr>
            ${extraDetails}
          </table>
        </div>
        
        <p>Your submission has been successfully recorded in the Smart Inspect system. You can log into your dashboard to view the details at any time.</p>
      </div>
      
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #888; border-top: 1px solid #eee;">
        <p>Thank you,<br/><strong>Smart Inspect</strong><br/>Real-Time Inspection & Monitoring</p>
        <p style="margin-top: 10px;"><em>This is an automated confirmation message. Please do not reply directly to this email.</em></p>
      </div>
    </div>
  `;
};
async function sendConfirmationEmail(uid, recordType, recordName, recordId, extraDetails = "") {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("SMTP credentials not configured. Skipping email for:", recordType, recordId);
            return;
        }
        const userSnap = await db.collection("users").doc(uid).get();
        if (!userSnap.exists) {
            console.warn(`User ${uid} not found. Cannot send confirmation email.`);
            return;
        }
        const userData = userSnap.data();
        const userName = (userData === null || userData === void 0 ? void 0 : userData.name) || "User";
        const userEmail = userData === null || userData === void 0 ? void 0 : userData.email;
        if (!userEmail) {
            console.warn(`User ${uid} has no registered email. Skipping confirmation.`);
            return;
        }
        const htmlContent = generateEmailTemplate(userName, userEmail, recordType, recordName, recordId, extraDetails);
        const mailOptions = {
            from: `"Smart Inspect" <${process.env.SMTP_USER}>`,
            to: userEmail,
            subject: `Smart Inspect \u2013 ${recordType} Submitted Successfully`,
            html: htmlContent,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully for ${recordType} ${recordId} to ${userEmail}. MessageId: ${info.messageId}`);
    }
    catch (error) {
        console.error(`Failed to send email for ${recordType} ${recordId}:`, error);
    }
}
// --------------------------------------------------------------------------------
// Firestore Triggers
// --------------------------------------------------------------------------------
exports.onInstitutionCreated = functions.firestore
    .document("institutions/{id}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    // In our system, createdBy might not always be present or we might use auth if it was a callable, 
    // but assuming there is a 'createdBy' field, or we might need to derive it from audit logs.
    // If 'createdBy' isn't available, we might skip or send it to the org email.
    // Assuming user ID is saved in 'createdBy' field or 'updatedBy'
    const uid = data.createdBy || data.updatedBy;
    if (uid) {
        await sendConfirmationEmail(uid, "Institution", data.name || "N/A", context.params.id);
    }
});
exports.onNgoCreated = functions.firestore
    .document("ngos/{id}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const uid = data.createdBy || data.updatedBy;
    if (uid) {
        await sendConfirmationEmail(uid, "NGO", data.name || "N/A", context.params.id);
    }
});
exports.onProjectCreated = functions.firestore
    .document("projects/{id}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const uid = data.createdBy || data.updatedBy;
    if (uid) {
        await sendConfirmationEmail(uid, "Project", data.title || "N/A", context.params.id);
    }
});
exports.onInspectionCreated = functions.firestore
    .document("inspections/{id}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    const uid = data.createdBy || data.updatedBy || data.inspectorId;
    if (uid) {
        await sendConfirmationEmail(uid, "Inspection", `Inspection for Project ${data.projectId || 'N/A'}`, context.params.id);
    }
});
exports.onInspectorCreated = functions.firestore
    .document("users/{id}")
    .onCreate(async (snap, context) => {
    const data = snap.data();
    if (data.role === "INSPECTOR") {
        // The person who created the inspector gets the email (usually the admin)
        const uid = data.createdBy || data.updatedBy;
        if (uid) {
            await sendConfirmationEmail(uid, "Inspector", data.name || "N/A", context.params.id);
        }
    }
});
// --------------------------------------------------------------------------------
// Callable Functions for SMS Notifications
// --------------------------------------------------------------------------------
// Initialize Twilio using require to avoid TS export conflicts
const twilioSDK = require("twilio");
const twilioClient = twilioSDK(process.env.TWILIO_ACCOUNT_SID || "", process.env.TWILIO_AUTH_TOKEN || "");
exports.sendSubmissionSms = functions.https.onCall(async (data, context) => {
    var _a;
    // Validate request
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to send SMS");
    }
    const { moduleType, recordName, recordId, mobileNumber } = data;
    if (!moduleType || !recordId || !mobileNumber) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    // Format and validate phone number (simple validation, add +91 if 10 digits)
    let formattedNumber = mobileNumber.trim();
    if (/^\d{10}$/.test(formattedNumber)) {
        formattedNumber = `+91${formattedNumber}`;
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(formattedNumber)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid phone number format");
    }
    // Check idempotency (prevent duplicates)
    const notificationId = `sms_${moduleType}_${recordId}`;
    const logRef = db.collection("notification_logs").doc(notificationId);
    try {
        const doc = await logRef.get();
        if (doc.exists && ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.status) === "delivered") {
            console.log(`SMS already delivered for ${notificationId}`);
            return { success: true, message: "Already delivered" };
        }
        // Determine message text based on moduleType
        let messageText = "";
        if (moduleType === "Institution") {
            messageText = `Smart Inspect: New Institution "${recordName}" has been successfully submitted. Reference ID: ${recordId}.`;
        }
        else if (moduleType === "NGO") {
            messageText = `Smart Inspect: New NGO "${recordName}" has been successfully submitted. Reference ID: ${recordId}.`;
        }
        else if (moduleType === "Project") {
            messageText = `Smart Inspect: New Project "${recordName}" has been successfully created. Reference ID: ${recordId}.`;
        }
        else if (moduleType === "Inspection") {
            messageText = `Smart Inspect: Inspection "${recordId}" has been successfully submitted.`;
        }
        else if (moduleType === "Inspector") {
            messageText = `Smart Inspect: Inspector "${recordName}" has been successfully added. Reference ID: ${recordId}.`;
        }
        else {
            messageText = `Smart Inspect: New ${moduleType} "${recordName}" has been successfully submitted. Reference ID: ${recordId}.`;
        }
        // Send SMS
        if (!process.env.TWILIO_PHONE_NUMBER || !process.env.TWILIO_ACCOUNT_SID) {
            console.warn("Twilio credentials not configured. Skipping SMS.");
            await logRef.set({
                notificationId,
                moduleType,
                recordId,
                recipient: formattedNumber,
                type: "SMS",
                timestamp: firestore_1.FieldValue.serverTimestamp(),
                status: "failed",
                error: "Twilio credentials not configured"
            });
            return { success: false, error: "Twilio credentials not configured" };
        }
        const message = await twilioClient.messages.create({
            body: messageText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber,
        });
        // Log success
        await logRef.set({
            notificationId,
            moduleType,
            recordId,
            recipient: formattedNumber,
            type: "SMS",
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            status: "delivered",
            messageSid: message.sid
        });
        return { success: true };
    }
    catch (error) {
        console.error("Error sending SMS:", error);
        // Log error
        await logRef.set({
            notificationId,
            moduleType,
            recordId,
            recipient: formattedNumber,
            type: "SMS",
            timestamp: firestore_1.FieldValue.serverTimestamp(),
            status: "failed",
            error: error.message || "Unknown error"
        });
        return { success: false, error: error.message };
    }
});
//# sourceMappingURL=index.js.map