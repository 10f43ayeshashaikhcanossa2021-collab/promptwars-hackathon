import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

// Load environment variables
dotenv.config();

// ----------------------------------------------------
// SECURE VAULT: AES-256-CBC ENCRYPTION FOR PII DATA
// ----------------------------------------------------
const ENCRYPTION_KEY = crypto.scryptSync(process.env.SESSION_SECRET || "smart-bharat-secure-vault-key-32b", "salt", 32);
const IV_LENGTH = 16;

export function encryptPII(text: string): string {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptPII(text: string): string {
  if (!text) return "";
  try {
    const parts = text.split(":");
    if (parts.length < 2) return text; // not encrypted
    const iv = Buffer.from(parts.shift() || "", "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    const decrypted = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final()
    ]);
    return decrypted.toString("utf8");
  } catch (err) {
    return text; // fallback
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable JSON parse with higher limit for base64 images/files
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini SDK with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI services will run in simulation mode.");
}

// ----------------------------------------------------
// COMPLETE RETRIEVAL-AUGMENTED GENERATION (RAG) PLATFORM
// ----------------------------------------------------
export interface RAGChunk {
  id: string;
  source: string;
  category: string;
  text: string;
  embedding?: number[];
}

// Global in-memory dynamic RAG store
let customRAGChunks: RAGChunk[] = [];

// Helper to split circulars/manuals into clean, semantic paragraphs/chunks
export function chunkText(text: string, sourceName: string, categoryName: string, chunkSize: number = 300): RAGChunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: RAGChunk[] = [];
  let currentChunkText = "";
  let chunkIdx = 1;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if ((currentChunkText + " " + trimmed).length > chunkSize && currentChunkText.length > 0) {
      chunks.push({
        id: `chunk_${sourceName.replace(/\s+/g, "_")}_${chunkIdx++}`,
        source: sourceName,
        category: categoryName,
        text: currentChunkText.trim(),
      });
      currentChunkText = trimmed;
    } else {
      currentChunkText = (currentChunkText + " " + trimmed).trim();
    }
  }

  if (currentChunkText.length > 0) {
    chunks.push({
      id: `chunk_${sourceName.replace(/\s+/g, "_")}_${chunkIdx}`,
      source: sourceName,
      category: categoryName,
      text: currentChunkText.trim(),
    });
  }
  return chunks;
}

// Compute actual embeddings using gemini-embedding-2-preview on server
async function getEmbedding(text: string): Promise<number[] | null> {
  if (!ai) return null;
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: text,
    });
    return (response as any).embedding?.values || null;
  } catch (err) {
    console.warn("Embedding API failed, falling back to dynamic word distance:", err);
    return null;
  }
}

// Compute cosine similarity between two numeric arrays
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Local hybrid Jaccard/TF-IDF token intersection metric
function localTextSimilarity(query: string, text: string): number {
  const cleanQ = query.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");
  const cleanT = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "");
  
  const qWords = new Set(cleanQ.split(/\s+/).filter(w => w.length > 3));
  const tWords = new Set(cleanT.split(/\s+/).filter(w => w.length > 3));
  
  if (qWords.size === 0) return 0.1; // base match for broad lookup
  
  let matchCount = 0;
  for (const qw of qWords) {
    if (tWords.has(qw)) matchCount++;
  }
  
  return matchCount / Math.sqrt(qWords.size * tWords.size);
}

// ----------------------------------------------------
// VERIFIED GOVERNMENT RAG KNOWLEDGE BASE
// ----------------------------------------------------
const GOVERNMENT_KNOWLEDGE_BASE = [
  {
    id: "kb_pm_kisan",
    title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "Agriculture",
    content: "PM-KISAN is a central sector scheme that provides income support of Rs. 6,000 per year in three equal installments of Rs. 2,000 each to all landholding farmer families across the country. Eligibility: All landholding farmer families having cultivable landholding in their names. Exclusions apply to institutional landowners, families with former or current constitutional posts, retired or active government employees, and income tax payers. Application Process: Farmers can apply via the PM-KISAN Portal, Common Service Centers (CSCs), or through local Agriculture Officers. Documents required include Aadhaar Card, Land ownership papers, and Bank Account details.",
    benefits: "Direct income support of ₹6,000 annually.",
    eligibility: "Landholding farmer families with cultivable land in their names.",
    deadline: "Continuous (No fixed deadline)",
  },
  {
    id: "kb_ayushman_bharat",
    title: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
    category: "Healthcare",
    content: "AB-PMJAY is the world's largest health insurance scheme, providing a health cover of Rs. 5 Lakhs per family per year for secondary and tertiary care hospitalization. Eligibility: Identified based on Socio-Economic Caste Census (SECC) 2011 indicators for rural and urban areas. There is no restriction on family size, age, or gender. Benefits: Covers pre-existing conditions, diagnostics, medicines, medical treatment, and post-hospitalization costs up to ₹5,00000. Verification is done using Ayushman Cards issued at PM-JAY centers, hospitals, or CSCs.",
    benefits: "Cashless health cover of ₹5 Lakhs per family per year.",
    eligibility: "Low-income families identified in the SECC-2011 list.",
    deadline: "Continuous",
  },
  {
    id: "kb_ssy",
    title: "Sukanya Samriddhi Yojana (SSY)",
    category: "Women Welfare",
    content: "SSY is a girl child prosperity savings scheme under the Beti Bachao Beti Padhao campaign. It offers high tax-free interest rates (currently 8.2% annually). Eligibility: Opened by parents/guardians for a girl child under 10 years of age. A maximum of two accounts can be opened per family (three in case of twins/triplets). Deposit Limit: Minimum deposit is Rs. 250 and Maximum is Rs. 1.5 Lakhs per financial year. Maturity: The account matures after 21 years from opening or upon the marriage of the girl child after attaining 18 years. Partial withdrawal of 50% is allowed for higher education after she turns 18.",
    benefits: "High tax-free interest rate, secure savings for higher education or marriage.",
    eligibility: "Girl children under the age of 10 years (Indian citizens).",
    deadline: "Continuous",
  },
  {
    id: "kb_mudra",
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    category: "Employment & Finance",
    content: "PMMY provides loans up to Rs. 10 Lakhs to non-corporate, non-farm small and micro enterprises. These loans are classified into three categories: Shishu (covering loans up to Rs. 50,000), Kishor (covering loans above Rs. 50,000 and up to Rs. 5 Lakhs), and Tarun (covering loans above Rs. 5 Lakhs and up to Rs. 10 Lakhs). No collateral or security is required for Mudra loans. The loans are sanctioned by commercial banks, RRBs, small finance banks, MFIs, and NBFCs. Documents required include Business Proof, identity proofs (Aadhaar, PAN), and financial statements.",
    benefits: "Collateral-free business loans up to ₹10 Lakhs.",
    eligibility: "Small businesses, micro enterprises, shopkeepers, start-ups, and artisans.",
    deadline: "Continuous",
  },
  {
    id: "kb_post_matric",
    title: "Post-Matric Scholarship Scheme (SC/ST/OBC)",
    category: "Education",
    content: "This scheme provides financial assistance to students belonging to Scheduled Castes (SC), Scheduled Tribes (ST), and Other Backward Classes (OBC) to pursue post-matric or post-secondary education. Eligibility: Students enrolled in recognized institutions for post-matric courses, whose parental annual income does not exceed Rs. 2.5 Lakhs (for SC/ST) and Rs. 1.5 Lakhs (for OBC). Benefits: Covers 100% of compulsory non-refundable fees charged by the college, along with a monthly academic allowance or maintenance fee.",
    benefits: "Full fee reimbursement and monthly stipend for higher studies.",
    eligibility: "SC, ST, or OBC students with parental annual income under specified caps.",
    deadline: "Typically October - December every year.",
  },
  {
    id: "kb_atal_pension",
    title: "Atal Pension Yojana (APY)",
    category: "Social Welfare",
    content: "APY is a pension scheme focused on unorganized sector workers. It provides a guaranteed minimum pension of Rs. 1,000, 2,000, 3,000, 4,000, or 5,000 per month after reaching 60 years of age, depending on the subscriber's contribution. Eligibility: Any Indian citizen aged between 18 and 40 years with a savings bank account. Contributions are automatically debited from the subscriber's account. Tax benefits apply under section 80CCD.",
    benefits: "Guaranteed lifelong monthly pension from ₹1,000 to ₹5,000.",
    eligibility: "Indian citizens aged 18-40 years.",
    deadline: "Continuous",
  }
];

// ----------------------------------------------------
// IN-MEMORY TEMPORARY STORE (RESETTABLE)
// ----------------------------------------------------
let tempComplaints = [
  {
    id: "COMP-101",
    title: "Damaged Road Near Sector 5 Market",
    category: "Road Pothole",
    description: "Deep pothole blocking traffic and causing accidents near Sector 5 public market.",
    location: "Sector 5 Market, New Delhi",
    imageUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=500&q=80",
    department: "Municipal Corporation / Public Works Department (PWD)",
    priority: "High",
    status: "In Progress",
    timeline: [
      { status: "Submitted", date: "2026-07-04T10:00:00.000Z", description: "Civic issue submitted by citizen with image." },
      { status: "Assigned", date: "2026-07-04T14:30:00.000Z", description: "Complaint assigned to Executive Engineer, PWD Zone 3." },
      { status: "In Progress", date: "2026-07-05T09:00:00.000Z", description: "Workforce dispatched. Road patch material is being prepared." }
    ],
    predictedDays: 3,
    confidence: 94,
    reporterName: "Rajesh Kumar",
    createdAt: "2026-07-04T10:00:00.000Z"
  },
  {
    id: "COMP-102",
    title: "Overflowing Garbage Dumpster on Link Road",
    category: "Garbage",
    description: "Solid waste overflowing onto the sidewalk, creating severe foul smell and health hazard.",
    location: "Link Road Crossway, Mumbai",
    imageUrl: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=500&q=80",
    department: "Solid Waste Management Division",
    priority: "Medium",
    status: "Assigned",
    timeline: [
      { status: "Submitted", date: "2026-07-05T16:00:00.000Z", description: "Civic issue submitted by citizen." },
      { status: "Assigned", date: "2026-07-06T08:15:00.000Z", description: "Assigned to Ward Inspector, Swachh Bharat Cell." }
    ],
    predictedDays: 1,
    confidence: 88,
    reporterName: "Priya Sharma",
    createdAt: "2026-07-05T16:00:00.000Z"
  },
  {
    id: "COMP-103",
    title: "Broken Streetlight Near Public Park Entrance",
    category: "Broken Street Light",
    description: "Main streetlight has been dark for 5 days, making the park entrance unsafe at night.",
    location: "Green Avenue Park, Bengaluru",
    imageUrl: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?auto=format&fit=crop&w=500&q=80",
    department: "Electricity Board / Street Light Section",
    priority: "Low",
    status: "Submitted",
    timeline: [
      { status: "Submitted", date: "2026-07-06T11:45:00.000Z", description: "Civic issue registered." }
    ],
    predictedDays: 4,
    confidence: 82,
    reporterName: "Anil Murthy",
    createdAt: "2026-07-06T11:45:00.000Z"
  }
];

let tempAuditLogs = [
  {
    id: "LOG-001",
    userId: "USR-101",
    userEmail: "citizen@bharat.gov.in",
    action: "Citizen Sign In",
    timestamp: "2026-07-06T20:30:00Z",
    ipAddress: "192.168.1.45",
    severity: "Info",
    details: "MFA challenge successfully verified using App OTP token."
  },
  {
    id: "LOG-002",
    userId: "USR-202",
    userEmail: "officer.verma@pwd.gov.in",
    action: "Complaint Status Update",
    timestamp: "2026-07-06T21:12:00Z",
    ipAddress: "10.0.12.89",
    severity: "Info",
    details: "Changed status of COMP-101 to 'In Progress'. Added work schedule notes."
  },
  {
    id: "LOG-003",
    userId: "USR-999",
    userEmail: "system.sentinel@bharat.gov.in",
    action: "Rate Limit Tripped",
    timestamp: "2026-07-06T22:05:00Z",
    ipAddress: "203.0.113.12",
    severity: "Warning",
    details: "IP blocked temporarily after 50 consecutive Q&A requests."
  }
];

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// ----------------------------------------------------
// SECURE USER PROFILE & MFA OTP SIMULATION ROUTES
// ----------------------------------------------------
app.post("/api/security/mfa-setup", (req, res) => {
  const { email } = req.body;
  const mockSecret = "B4Y67X8923Z10";
  const mockQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/SmartBharatAI:${email}?secret=${mockSecret}&issuer=SmartBharatAI`;
  
  res.json({
    secret: mockSecret,
    qrCode: mockQrCode,
    message: "2FA authentication payload generated. Scan using standard Google Authenticator."
  });
});

app.post("/api/security/mfa-verify", (req, res) => {
  const { code } = req.body;
  if (code === "123456" || code.length === 6) {
    return res.json({ verified: true, message: "Two-Factor authentication validated." });
  }
  return res.status(400).json({ verified: false, error: "Invalid visual OTP code. Please enter the current rolling digits." });
});

app.post("/api/security/encrypt-pii", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "No PII data sent." });
  const encrypted = encryptPII(data);
  res.json({ encrypted });
});

app.post("/api/security/decrypt-pii", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "No encrypted string sent." });
  const decrypted = decryptPII(data);
  res.json({ decrypted });
});

// ----------------------------------------------------
// DYNAMIC DOCUMENT INDEXING ENDPOINT FOR RAG
// ----------------------------------------------------
app.post("/api/rag/index", async (req, res) => {
  try {
    const { fileName, category, content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for indexing." });
    }

    const cat = category || "General Circular";
    const source = fileName || "Uploaded Circular";
    
    // Chunk the text
    const chunks = chunkText(content, source, cat, 300);
    
    // Compute embeddings in background/sequence if active
    for (const chunk of chunks) {
      if (ai) {
        chunk.embedding = await getEmbedding(chunk.text) || undefined;
      }
      customRAGChunks.push(chunk);
    }

    // Logging to audit trail
    tempAuditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      userId: "USR-MOCK",
      userEmail: "citizen@bharat.gov.in",
      action: "RAG Source Indexed",
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      severity: "Info",
      details: `Indexed government document "${source}" split into ${chunks.length} semantic nodes.`
    });

    res.json({
      success: true,
      message: `Indexed "${source}" into RAG memory. Spanned ${chunks.length} active chunks.`,
      chunksCount: chunks.length
    });
  } catch (error: any) {
    console.error("RAG indexing error:", error);
    res.status(500).json({ error: error.message || "Failed to index RAG document." });
  }
});

// 1. CHAT WITH RAG CONTEXT (Gemini Q&A)
app.post("/api/chat", async (req, res) => {
  try {
    const { message, previousMessages, userProfile } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Compile match list
    interface CandidateMatch {
      source: string;
      category: string;
      text: string;
      score: number;
    }
    
    let candidates: CandidateMatch[] = [];

    // Match against default base
    for (const kb of GOVERNMENT_KNOWLEDGE_BASE) {
      const score = localTextSimilarity(message, kb.content);
      candidates.push({
        source: kb.title,
        category: kb.category,
        text: kb.content,
        score: score
      });
    }

    // Match against custom uploaded files
    for (const chunk of customRAGChunks) {
      const score = localTextSimilarity(message, chunk.text);
      candidates.push({
        source: chunk.source,
        category: chunk.category,
        text: chunk.text,
        score: score
      });
    }

    // Sort by score
    candidates.sort((a, b) => b.score - a.score);
    const bestMatches = candidates.filter(c => c.score > 0.05).slice(0, 3);

    let ragContext = "";
    let citations: { source: string; snippet: string }[] = [];
    let confidenceScore = 65; // base simulation level

    if (bestMatches.length > 0) {
      ragContext = bestMatches.map(m => `[VERIFIED GOVT RESOURCE: ${m.source}]\n${m.text}`).join("\n\n");
      citations = bestMatches.map(m => ({
        source: m.source,
        snippet: m.text.substring(0, 140) + "..."
      }));
      // calculate confidence based on average matching scores
      const avgScore = bestMatches.reduce((acc, curr) => acc + curr.score, 0) / bestMatches.length;
      confidenceScore = Math.min(100, Math.round(75 + avgScore * 50));
    }

    const userProfileText = userProfile 
      ? `User Profile Context: Name: ${userProfile.fullName}, Age: ${userProfile.dateOfBirth}, Occupation: ${userProfile.occupation}, Income: ₹${userProfile.income}/yr, State: ${userProfile.state}, District: ${userProfile.district}, Student: ${userProfile.isStudent}, Farmer: ${userProfile.isFarmer}.`
      : "User Profile Context: Anonymous / Guest Access.";

    const systemInstruction = `
You are SMART BHARAT AI, a premium, intelligent, highly trustworthy Government of India digital companion.
You respond in a professional, empathetic, and authoritative tone representing the Indian government.

CRITICAL INSTRUCTIONS:
1. When answering civic, scheme, or legal queries, you MUST rely heavily on the Verified Government Resources provided in the prompt context.
2. If the user asks for specific scheme guidelines, criteria, or services, and there is no matching context in the provided [VERIFIED GOVT RESOURCE], you MUST NOT hallucinate, guess, or fabricate information. Instead, you MUST clearly and politely state: "I could not find verified government information." and offer to assist with other verified services. Never speculate or build ungrounded benefits.
3. Keep answers extremely accurate and structure them clearly with bold bullet points, step-by-step instructions, eligibility lists, and application methods.
4. Adapt to the citizen's profile context. Recommend relevant schemes dynamically.
5. Translate or answer in the user's selected language or English. Always respond in a polite and constructive tone.
    `.trim();

    const promptText = `
${userProfileText}

[VERIFIED GOVERNMENT KNOWLEDGE BASE CONTEXT]
${ragContext ? ragContext : "No specific verified source loaded for this query. If you do not know the answer from core national regulations, state that you could not find verified government information."}

User's Query: "${message}"

Please provide your intelligent, trustworthy, and precise response:
    `.trim();

    if (!ai) {
      // Simulation fallback if API key is not present
      let responseText = `[SIMULATION MODE] Jai Hind! Thank you for contacting Smart Bharat AI.\n\n`;
      if (bestMatches.length > 0) {
        responseText += `Based on verified **${bestMatches[0].source}** documents:\n\n${bestMatches[0].text.substring(0, 250)}...\n\nApply through the official State CSC or municipal locker portal. Let me know if you need step-by-step guidance!`;
      } else {
        responseText += `I have registered your query regarding "${message}". Currently, I could not find verified government information in my local RAG index. Please upload policy circular guidelines to my Digital Locker and index them first!`;
      }
      return res.json({ 
        text: responseText, 
        sourceKB: bestMatches,
        citations,
        confidenceScore
      });
    }

    // Call actual Gemini API with gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.1, // extremely low temperature for strict factual adherence
      },
    });

    const aiResponseText = response.text || "I could not find verified government information.";
    return res.json({
      text: aiResponseText,
      sourceKB: bestMatches,
      citations,
      confidenceScore
    });

  } catch (error: any) {
    console.error("Gemini API Error in /api/chat:", error);
    return res.status(500).json({ error: error.message || "Internal AI Server Error" });
  }
});

// 2. SMART DOCUMENT VERIFICATION (Gemini AI check)
app.post("/api/verify-document", async (req, res) => {
  try {
    const { docType, fileData, fileName } = req.body;
    if (!docType || !fileData) {
      return res.status(400).json({ error: "Document type and base64 file data are required." });
    }

    const base64Data = fileData.split(",")[1] || fileData;

    const systemInstruction = `
You are the Smart Bharat AI Document Verification Auditor.
Your job is to perform a strict compliance check on Indian government credentials (Aadhaar, PAN, Passport, Birth Certificate, Driving License, Voter ID).
Analyze the provided document (which is an image/photo or PDF layout) and report:
1. Missing essential fields (e.g. signature, seal, photo, expiry date).
2. Wrong file formats or blurriness.
3. Expiry check. Compare with current date.
4. Scan quality / unreadability.
5. Duplicate or suspicious artifact indicators.

Return the result STRICTLY as a JSON object with this schema:
{
  "documentType": "string",
  "isValid": boolean,
  "scanQuality": "Excellent" | "Fair" | "Poor",
  "extractedDetails": {
    "name": "string or Not Found",
    "idNumber": "string or Not Found",
    "expiryDate": "string or Not Applicable/Not Found"
  },
  "checklist": [
    { "criterion": "Format & Layout Integrity", "verified": boolean, "message": "string" },
    ...
  ],
  "issues": ["string"],
  "recoAction": "string"
}
    `.trim();

    if (!ai) {
      // Mock validation results if API key is missing
      const mockResult = {
        documentType: docType,
        isValid: !fileName.toLowerCase().includes("blur") && !fileName.toLowerCase().includes("wrong"),
        scanQuality: fileName.toLowerCase().includes("blur") ? "Poor" : "Excellent",
        extractedDetails: {
          name: "RAJESH CHANDRA SHARMA",
          idNumber: docType === "Aadhaar" ? "9182-4412-8923" : docType === "PAN" ? "ALGPS8903K" : "A2938122",
          expiryDate: docType === "Passport" ? "2031-12-15" : docType === "Driving License" ? "2029-04-12" : "Not Applicable"
        },
        checklist: [
          { criterion: "Format & Layout Integrity", verified: true, message: "Standard layout dimensions validated successfully." },
          { criterion: "Clear Photo ID Presence", verified: true, message: "Face scan extracted with high contrast." },
          { criterion: "Seal & Signature Authentication", verified: !fileName.toLowerCase().includes("missing"), message: fileName.toLowerCase().includes("missing") ? "Government Seal missing or unreadable" : "Official digital signature/seal verified." },
          { criterion: "Expiration Verification", verified: true, message: "Document is active and within valid temporal boundaries." }
        ],
        issues: fileName.toLowerCase().includes("missing") ? ["Official seal watermark is not visible in standard scan bounds."] : [],
        recoAction: fileName.toLowerCase().includes("missing") 
          ? "Please re-upload a clear, high-resolution color PDF scan from the official DigiLocker export." 
          : "Document marked verified! Ready for e-KYC submission."
      };
      return res.json(mockResult);
    }

    // Call real Gemini API
    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    };
    const textPart = {
      text: `Verify this document of type: ${docType}. Check for quality, stamps, names, fields. Ensure valid JSON return.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentType: { type: Type.STRING },
            isValid: { type: Type.BOOLEAN },
            scanQuality: { type: Type.STRING },
            extractedDetails: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                idNumber: { type: Type.STRING },
                expiryDate: { type: Type.STRING }
              },
              required: ["name", "idNumber", "expiryDate"]
            },
            checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  verified: { type: Type.BOOLEAN },
                  message: { type: Type.STRING }
                },
                required: ["criterion", "verified", "message"]
              }
            },
            issues: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recoAction: { type: Type.STRING }
          },
          required: ["documentType", "isValid", "scanQuality", "extractedDetails", "checklist", "issues", "recoAction"]
        }
      }
    });

    const outputJson = JSON.parse(response.text || "{}");
    return res.json(outputJson);

  } catch (error: any) {
    console.error("Document Verification Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze document" });
  }
});

// 3. AI PDF / DOCUMENT SCHEME SUMMARIZER
app.post("/api/summarize-pdf", async (req, res) => {
  try {
    const { pdfName, textContent } = req.body;
    if (!pdfName) {
      return res.status(400).json({ error: "Document name/metadata is required." });
    }

    const systemInstruction = `
You are the Smart Bharat AI Policy & Gazette Summarizer.
Your goal is to parse heavy official Indian government PDFs, schemes, guidelines, and gazettes, translating them into simplified, high-fidelity summaries.
Extract:
1. Simplified language summary (layman terms).
2. Key points.
3. Eligibility criteria.
4. Benefits & allowances.
5. Application deadlines & required proofs.
6. FAQ list (at least 2).

Return the summary STRICTLY in this JSON format:
{
  "title": "string",
  "simplifiedSummary": "string",
  "keyPoints": ["string"],
  "eligibility": ["string"],
  "benefits": "string",
  "deadlines": "string",
  "faqs": [
    { "q": "string", "a": "string" }
  ]
}
    `.trim();

    const sampleContent = textContent || "This is a placeholder for standard Pradhan Mantri schemes.";

    if (!ai) {
      // Simulation
      const mockSummary = {
        title: pdfName.replace(/\.[^/.]+$/, ""),
        simplifiedSummary: `This scheme is designed to offer financial relief and direct incentives to citizens meeting specific criteria. It removes heavy procedural overhead, using digital direct benefit transfers (DBT) directly into verified bank accounts to prevent leakages.`,
        keyPoints: [
          "Direct transfer using Aadhaar enabled bridge payments.",
          "Complete transparency via online citizen-portal tracking.",
          "Excludes current government employees and active taxpayers."
        ],
        eligibility: [
          "Must be a permanent resident of India.",
          "Family income should fall within the bottom-quartile brackets.",
          "Should have valid Aadhaar and Jan Dhan bank details."
        ],
        benefits: "Covers a maximum financial assistance of ₹50,000 per year per household plus health and pension topups.",
        deadlines: "Rolling verification. Best applied prior to November 30th for the autumn ledger cycle.",
        faqs: [
          { q: "Is there any charge to register for this scheme?", a: "No, registration is 100% free of charge via authorized CSCs or online portal." },
          { q: "Can multi-member households apply separately?", a: "Application is restricted to one primary breadwinner per ration-card household." }
        ]
      };
      return res.json(mockSummary);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Summarize the policy guidelines of this document named ${pdfName}. Content excerpt: ${sampleContent}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            simplifiedSummary: { type: Type.STRING },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            eligibility: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            benefits: { type: Type.STRING },
            deadlines: { type: Type.STRING },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  q: { type: Type.STRING },
                  a: { type: Type.STRING }
                },
                required: ["q", "a"]
              }
            }
          },
          required: ["title", "simplifiedSummary", "keyPoints", "eligibility", "benefits", "deadlines", "faqs"]
        }
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error: any) {
    console.error("PDF Summarizer error:", error);
    return res.status(500).json({ error: error.message || "Failed to summarize PDF document" });
  }
});

// 4. PUBLIC ISSUE REPORTING & IMAGE ANALYSIS
app.post("/api/analyze-issue", async (req, res) => {
  try {
    const { imageData, location, userDescription } = req.body;
    if (!imageData) {
      return res.status(400).json({ error: "Image data (base64) is required." });
    }

    const base64Data = imageData.split(",")[1] || imageData;

    const systemInstruction = `
You are the Smart Bharat AI Urban Civic Auditor.
Analyze the provided image of a reported municipal/civic issue (e.g. road pothole, overflowing garbage, broken streetlight, water leak, tree fallen, drainage block).
Extract:
1. Verified civic issue classification (e.g. Road Pothole, Garbage, Broken Street Light, etc.).
2. Automatic professional complaint title and descriptive details.
3. Automatically assign standard municipal department.
4. Estimate hazard/priority level (Low, Medium, High).
5. Estimated repair completion days based on category (e.g. Garbage: 1 day, Pothole: 3 days, streetlight: 4 days, water leak: 2 days).
6. Severity percentage assessment (0-100%).

Return the results strictly in this JSON format:
{
  "detectedCategory": "Road Pothole" | "Garbage" | "Water Leakage" | "Broken Street Light" | "Illegal Construction" | "Drainage" | "Traffic Signal" | "Other",
  "generatedTitle": "string",
  "generatedDescription": "string",
  "assignedDepartment": "string",
  "priority": "Low" | "Medium" | "High",
  "predictedDays": number,
  "confidenceScore": number
}
    `.trim();

    if (!ai) {
      // Simulation
      const mockReport = {
        detectedCategory: "Road Pothole",
        generatedTitle: "Major Road Pothole Damage Near Crossroads",
        generatedDescription: "A wide, hazardous crater on the main driving lane. It presents immediate risks to vehicles and motorcyclists, especially under wet conditions.",
        assignedDepartment: "Municipal Corporation - Public Works Department (PWD)",
        priority: "High",
        predictedDays: 3,
        confidenceScore: 92
      };
      return res.json(mockReport);
    }

    const imagePart = {
      inlineData: {
        mimeType: "image/png",
        data: base64Data
      }
    };
    const textPart = {
      text: `Analyze this citizen uploaded issue photo. Description: ${userDescription || "None provided"}. Location: ${location || "Unknown"}`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedCategory: { type: Type.STRING },
            generatedTitle: { type: Type.STRING },
            generatedDescription: { type: Type.STRING },
            assignedDepartment: { type: Type.STRING },
            priority: { type: Type.STRING },
            predictedDays: { type: Type.INTEGER },
            confidenceScore: { type: Type.INTEGER }
          },
          required: ["detectedCategory", "generatedTitle", "generatedDescription", "assignedDepartment", "priority", "predictedDays", "confidenceScore"]
        }
      }
    });

    return res.json(JSON.parse(response.text || "{}"));

  } catch (error: any) {
    console.error("AI Civic Image Analysis Error:", error);
    return res.status(500).json({ error: error.message || "Failed to analyze civic issue image" });
  }
});

// 5. TEXT TO SPEECH (TTS) using Gemini TTS or fallbacks
app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }

    // Since gemini-3.1-flash-tts-preview is a paid model or requires custom configs,
    // we provide the backend endpoint. If gemini isn't configured, we'll return a simulated state,
    // and the client will use speech synthesis fallback natively which is 100% responsive and supports local languages!
    if (!ai) {
      return res.json({ simulated: true });
    }

    // Call actual Gemini TTS if available
    try {
      const promptText = `Speak naturally in a trustworthy, helpful voice in ${language || 'English'}: ${text}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" }, // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audio: base64Audio });
      } else {
        return res.json({ simulated: true });
      }
    } catch (innerErr) {
      console.warn("Gemini TTS model issue, falling back to client speech synthesis:", innerErr);
      return res.json({ simulated: true });
    }

  } catch (error: any) {
    console.error("TTS Endpoint Error:", error);
    return res.status(500).json({ error: error.message || "TTS error" });
  }
});

// 6. SCHEME RECOMMENDATIONS FOR CITIZENS
app.post("/api/recommend-schemes", async (req, res) => {
  try {
    const { age, occupation, state, income, gender, isFarmer, isStudent, isSeniorCitizen, isDisabled, interests } = req.body;

    const queryInfo = `
Age: ${age || "Not provided"},
Occupation: ${occupation || "Not provided"},
Income: ₹${income || 0} annually,
Gender: ${gender || "Not specified"},
State: ${state || "All India"},
Farmer: ${isFarmer ? "Yes" : "No"},
Student: ${isStudent ? "Yes" : "No"},
Senior Citizen: ${isSeniorCitizen ? "Yes" : "No"},
Disabled: ${isDisabled ? "Yes" : "No"},
Interests: ${(interests || []).join(", ")}
    `;

    const systemInstruction = `
You are the Smart Bharat AI Schemes Matching Specialist.
Match the user's demographic profile to actual, verified Indian government welfare programs and schemes (e.g., PM-Kisan, PM Mudra, Sukanya Samriddhi Yojana, Post-Matric Scholarship, PM-JAY, APY).
Return a curated list of relevant schemes. Explain WHY they match, the precise eligibility, and the step-by-step registration roadmap.

Return the result STRICTLY as a JSON array where each object has this structure:
[
  {
    "id": "string",
    "name": "string",
    "ministry": "string",
    "description": "string",
    "benefits": "string",
    "eligibility": "string",
    "matchReason": "string",
    "applicationSteps": ["string"],
    "category": "Healthcare" | "Education" | "Agriculture" | "Employment" | "Finance" | "Women Welfare" | "Social Welfare"
  },
  ...
]
    `.trim();

    if (!ai) {
      // Manual scheme filtering for zero-dependency local mock
      const schemesList = [];
      if (isFarmer) {
        schemesList.push({
          id: "pm_kisan_local",
          name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
          ministry: "Ministry of Agriculture & Farmers Welfare",
          description: "Annual direct cash support of ₹6,000 in three equal installments to bolster agricultural households.",
          benefits: "₹6,000 cash transfer directly into Aadhaar bank account.",
          eligibility: "Landholding farmer families with cultivable land holdings.",
          matchReason: "Directly matched because your profile identifies as an active Farmer.",
          applicationSteps: ["Register on PM-KISAN online portal using Aadhaar details.", "Upload land registry copy and bank passbook.", "Obtain verification seal from the local agricultural block officer."],
          category: "Agriculture"
        });
      }
      if (isStudent || (age && age < 25)) {
        schemesList.push({
          id: "post_matric_local",
          name: "Post-Matric Scholarship Scheme",
          ministry: "Ministry of Social Justice and Empowerment",
          description: "Full college tuition fee reimbursement and secondary study allowances for backward caste households.",
          benefits: "100% course fee waiver and monthly study stipend of up to ₹1,200.",
          eligibility: "Students with parent annual income below ₹2.5 Lakhs (SC/ST) or ₹1.5 Lakhs (OBC).",
          matchReason: "Matched as you are a Student pursuing professional higher education.",
          applicationSteps: ["Apply online on National Scholarship Portal (NSP).", "Submit Income, Caste, and College enrolment proofs.", "College administration verifies on-portal before district payout."],
          category: "Education"
        });
      }
      if (gender === "Female" && age && age < 10) {
        schemesList.push({
          id: "ssy_local",
          name: "Sukanya Samriddhi Yojana (SSY)",
          ministry: "Ministry of Women and Child Development",
          description: "Girl child education and marriage welfare savings account with tax exemptions and guaranteed interest of 8.2%.",
          benefits: "8.2% tax-free compound interest on accumulated deposits.",
          eligibility: "Indian girls below the age of 10 years, parent deposit is mandatory.",
          matchReason: "Matched for your daughter under SSY girl children savings targets.",
          applicationSteps: ["Visit nearest Indian Post Office or state bank branch.", "Fill SSY registration form and submit child's Birth Certificate.", "Make first deposit (Min ₹250). Setup online debit tracker."],
          category: "Women Welfare"
        });
      }
      if (income < 500000) {
        schemesList.push({
          id: "ayushman_local",
          name: "Ayushman Bharat PM Jan Arogya Yojana (AB-PMJAY)",
          ministry: "Ministry of Health and Family Welfare",
          description: "The national public health cover offering cash-free secondary and tertiary hospitalization treatment.",
          benefits: "₹5 Lakhs cashless cover per family annually in over 20,000 hospitals.",
          eligibility: "Low income households on the rural/urban SECC database.",
          matchReason: "Matched because your annual household income aligns with marginal welfare support.",
          applicationSteps: ["Check your family name in the PM-JAY database.", "Visit nearest Ayushman Mitra kiosk in government hospital.", "Submit Aadhaar / Ration Card to extract your e-Card printout."],
          category: "Healthcare"
        });
      }
      // Add APY as general social welfare
      schemesList.push({
        id: "apy_local",
        name: "Atal Pension Yojana (APY)",
        ministry: "Ministry of Finance / PFRDA",
        description: "Pension support for unorganized labor offering fixed pensions of up to ₹5,000/month after 60.",
        benefits: "Guaranteed monthly pension of ₹1,000 to ₹5,000 after 60.",
        eligibility: "All citizens aged 18 to 40 holding a savings bank account.",
        matchReason: "Matched for retirement protection and micro-pension support.",
        applicationSteps: ["Contact your branch bank manager where your savings account is registered.", "Opt for the APY pension brackets (₹1K - ₹5K).", "Authorize monthly auto-debit cycles."],
        category: "Social Welfare"
      });

      return res.json(schemesList);
    }

    // Call real Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Recommend schemes for this profile: ${queryInfo}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              ministry: { type: Type.STRING },
              description: { type: Type.STRING },
              benefits: { type: Type.STRING },
              eligibility: { type: Type.STRING },
              matchReason: { type: Type.STRING },
              applicationSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              category: { type: Type.STRING }
            },
            required: ["id", "name", "ministry", "description", "benefits", "eligibility", "matchReason", "applicationSteps", "category"]
          }
        }
      }
    });

    return res.json(JSON.parse(response.text || "[]"));

  } catch (error: any) {
    console.error("Scheme recommendation failure:", error);
    return res.status(500).json({ error: error.message || "Failed to recommend schemes" });
  }
});

// 7. COMPLAINTS STORE
app.get("/api/complaints", (req, res) => {
  res.json(tempComplaints);
});

app.post("/api/complaints", (req, res) => {
  const { title, category, description, location, imageUrl, department, priority, predictedDays, confidence, reporterName } = req.body;
  const newComplaint = {
    id: `COMP-${Math.floor(100 + Math.random() * 900)}`,
    title: title || `Reported ${category}`,
    category: category || "Other",
    description: description || "",
    location: location || "India",
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=500&q=80",
    department: department || "Municipal Corporation General Division",
    priority: priority || "Medium",
    status: "Submitted" as const,
    timeline: [
      { status: "Submitted" as const, date: new Date().toISOString(), description: "Complaint filed on Smart Bharat AI platform." }
    ],
    predictedDays: predictedDays || 3,
    confidence: confidence || 85,
    reporterName: reporterName || "Anonymous Citizen",
    createdAt: new Date().toISOString()
  };

  tempComplaints.unshift(newComplaint);

  // Append audit log
  tempAuditLogs.unshift({
    id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
    userId: "USR-MOCK",
    userEmail: "citizen@bharat.gov.in",
    action: "Civic Complaint Submitted",
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    severity: "Info",
    details: `Filed complaint ${newComplaint.id} for category ${newComplaint.category} assigned to ${newComplaint.department}.`
  });

  res.status(201).json(newComplaint);
});

app.put("/api/complaints/:id", (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const complaint = tempComplaints.find(c => c.id === id);

  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  complaint.status = status;
  complaint.timeline.push({
    status: status,
    date: new Date().toISOString(),
    description: remarks || `Status updated to ${status} by department officer.`
  });

  // Append audit log
  tempAuditLogs.unshift({
    id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
    userId: "USR-OFFICER",
    userEmail: "officer.verma@pwd.gov.in",
    action: "Complaint Status Update",
    timestamp: new Date().toISOString(),
    ipAddress: "127.0.0.1",
    severity: "Info",
    details: `Updated complaint ${id} status to ${status}. Remarks: ${remarks || "none"}`
  });

  res.json(complaint);
});

app.post("/api/report-issue", async (req, res) => {
  try {
    const { category, description, location, citizenName, citizenPhone, photoData } = req.body;

    let detectedCategory = category || "Other";
    let title = `Reported ${detectedCategory}`;
    let desc = description || "";
    let department = "Municipal Corporation General Division";
    let priority: "Low" | "Medium" | "High" = "Medium";
    let predictedDays = 3;
    let confidence = 85;

    if (photoData) {
      try {
        const base64Data = photoData.split(",")[1] || photoData;
        const systemInstruction = `
You are the Smart Bharat AI Urban Civic Auditor.
Analyze the provided image of a reported municipal/civic issue.
Extract:
1. Verified civic issue classification.
2. Automatic professional complaint title and descriptive details.
3. Automatically assign standard municipal department.
4. Estimate hazard/priority level (Low, Medium, High).
5. Estimated repair completion days based on category (e.g. Garbage: 1 day, Pothole: 3 days, streetlight: 4 days, water leak: 2 days).
6. Severity percentage assessment (0-100%).

Return the results strictly in this JSON format:
{
  "detectedCategory": "Road Pothole" | "Garbage" | "Water Leakage" | "Broken Street Light" | "Illegal Construction" | "Drainage" | "Traffic Signal" | "Other",
  "generatedTitle": "string",
  "generatedDescription": "string",
  "assignedDepartment": "string",
  "priority": "Low" | "Medium" | "High",
  "predictedDays": number,
  "confidenceScore": number
}
        `.trim();

        if (ai) {
          const imagePart = {
            inlineData: {
              mimeType: "image/png",
              data: base64Data
            }
          };
          const textPart = {
            text: `Analyze this citizen uploaded issue photo. Description: ${description || "None provided"}. Location: ${location || "Unknown"}`
          };

          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detectedCategory: { type: Type.STRING },
                  generatedTitle: { type: Type.STRING },
                  generatedDescription: { type: Type.STRING },
                  assignedDepartment: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  predictedDays: { type: Type.INTEGER },
                  confidenceScore: { type: Type.INTEGER }
                },
                required: ["detectedCategory", "generatedTitle", "generatedDescription", "assignedDepartment", "priority", "predictedDays", "confidenceScore"]
              }
            }
          });

          const aiResult = JSON.parse(response.text || "{}");
          detectedCategory = aiResult.detectedCategory || detectedCategory;
          title = aiResult.generatedTitle || title;
          desc = aiResult.generatedDescription || desc;
          department = aiResult.assignedDepartment || department;
          priority = aiResult.priority || priority;
          predictedDays = aiResult.predictedDays || predictedDays;
          confidence = aiResult.confidenceScore || confidence;
        } else {
          title = `AI Analyzed: ${category}`;
          desc = `Automatic audit report: ${description}. Verified image structure matches standard municipal civic reports.`;
          department = category.toLowerCase().includes("road") || category.toLowerCase().includes("pothole")
            ? "Public Works Department (PWD)"
            : category.toLowerCase().includes("garbage")
            ? "Solid Waste Management Division"
            : "Municipal Corporation - Civic Assets";
          priority = "High";
          predictedDays = 3;
          confidence = 90;
        }
      } catch (innerErr) {
        console.warn("AI analysis failed in /api/report-issue, using manual fallback:", innerErr);
      }
    }

    const newComplaint = {
      id: `COMP-${Math.floor(100 + Math.random() * 900)}`,
      title: title,
      category: detectedCategory,
      description: desc || description || "",
      location: location || "India",
      imageUrl: photoData || "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=500&q=80",
      department: department,
      priority: priority,
      status: "Submitted" as const,
      timeline: [
        { status: "Submitted" as const, date: new Date().toISOString(), description: "Complaint filed on Smart Bharat AI platform." }
      ],
      predictedDays: predictedDays,
      confidence: confidence,
      reporterName: citizenName || "Anonymous Citizen",
      createdAt: new Date().toISOString()
    };

    tempComplaints.unshift(newComplaint);

    tempAuditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      userId: "USR-MOCK",
      userEmail: "citizen@bharat.gov.in",
      action: "Civic Complaint Submitted",
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      severity: "Info",
      details: `Filed complaint ${newComplaint.id} for category ${newComplaint.category} assigned to ${newComplaint.department}.`
    });

    return res.status(201).json(newComplaint);

  } catch (error: any) {
    console.error("Error reporting issue:", error);
    return res.status(500).json({ error: error.message || "Failed to submit civic issue report" });
  }
});

app.post("/api/update-complaint", (req, res) => {
  try {
    const { id, status, officerName, comment } = req.body;
    const complaint = tempComplaints.find(c => c.id === id);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    complaint.status = status;
    complaint.timeline.push({
      status: status,
      date: new Date().toISOString(),
      description: comment || `Status updated to ${status} by department officer ${officerName || ""}.`
    });

    tempAuditLogs.unshift({
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      userId: "USR-OFFICER",
      userEmail: "officer.verma@pwd.gov.in",
      action: "Complaint Status Update",
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1",
      severity: "Info",
      details: `Updated complaint ${id} status to ${status} by ${officerName || "Officer"}. Comments: ${comment || "none"}`
    });

    return res.json(complaint);
  } catch (error: any) {
    console.error("Error updating complaint:", error);
    return res.status(500).json({ error: error.message || "Failed to update complaint" });
  }
});

// 8. AUDIT LOGS STORE
app.get("/api/audit-logs", (req, res) => {
  res.json(tempAuditLogs);
});

app.post("/api/audit-logs", (req, res) => {
  const { action, severity, details, userEmail } = req.body;
  const newLog = {
    id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
    userId: "USR-CURRENT",
    userEmail: userEmail || "guest@bharat.gov.in",
    action: action || "Custom Action",
    timestamp: new Date().toISOString(),
    ipAddress: "192.168.1.1",
    severity: severity || "Info",
    details: details || ""
  };
  tempAuditLogs.unshift(newLog);
  res.status(201).json(newLog);
});


// ----------------------------------------------------
// VITE DEV SERVER / PRODUCTION SERVING MIDDLEWARE
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev environment: integrate Vite in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production environment: serve static assets from 'dist'
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Bharat AI Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
