export enum Role {
  CITIZEN = "Citizen",
  OFFICER = "Government Officer",
  DEPT_ADMIN = "Department Admin",
  SUPER_ADMIN = "Super Admin"
}

export interface UserProfile {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: Role;
  dateOfBirth: string;
  gender: string;
  state: string;
  district: string;
  preferredLanguage: string;
  interests: string[];
  occupation: string;
  income: number; // annual
  isFarmer: boolean;
  isStudent: boolean;
  isSeniorCitizen: boolean;
  isDisabled: boolean;
  isMfaEnabled: boolean;
  avatarUrl?: string;
  idStatus: {
    aadhaar: "Verified" | "Pending" | "Unverified";
    pan: "Verified" | "Pending" | "Unverified";
    passport: "Verified" | "Pending" | "Unverified";
    drivingLicense: "Verified" | "Pending" | "Unverified";
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  audioUrl?: string;
  suggestedServices?: string[];
  suggestedSchemes?: string[];
  citations?: { source: string; snippet: string }[];
  confidenceScore?: number;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  benefits: string;
  eligibility: string;
  applicationSteps: string[];
  category: "Healthcare" | "Education" | "Agriculture" | "Employment" | "Finance" | "Women Welfare" | "Social Welfare";
}

export interface DocumentChecklist {
  id: string;
  name: string;
  status: "Verified" | "Missing" | "Error" | "Not Uploaded";
  details?: string;
  updatedAt?: string;
}

export interface CivicComplaint {
  id: string;
  title: string;
  category: "Road Pothole" | "Garbage" | "Water Leakage" | "Broken Street Light" | "Illegal Construction" | "Drainage" | "Traffic Signal" | "Other" | string;
  description: string;
  location: string;
  imageUrl?: string;
  department?: string;
  assignedDepartment?: string;
  priority: "Low" | "Medium" | "High" | string;
  status: "Submitted" | "Assigned" | "In Progress" | "Resolved" | "In-Progress" | "Solved" | string;
  timeline?: {
    status: string;
    date: string;
    description: string;
  }[];
  updates?: {
    timestamp: string;
    comment: string;
    officer: string;
  }[];
  predictedDays?: number;
  confidence?: number;
  confidenceScore?: number;
  reporterName?: string;
  createdAt?: string;
}

export type Complaint = CivicComplaint;

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  severity: "Info" | "Warning" | "Critical";
  details: string;
}
