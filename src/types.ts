/**
 * Types and interfaces for Edweso Royal Academy Portal
 */

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface UserSession {
  id: string;
  role: UserRole;
  username: string;
  name: string;
  email: string;
  profileImage?: string;
  classId?: string; // For students
}

export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  classId: string; // References SchoolClass.id
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: 'Active' | 'Suspended' | 'Alumni';
  balanceGHS: number;
  gender: 'Male' | 'Female';
  dob: string;
  profilePhoto?: string;
}

export interface Teacher {
  id: string;
  name: string;
  staffNumber: string;
  email: string;
  phone: string;
  subjectId: string; // References Subject.id or name
  status: 'Active' | 'On Leave';
  gender: 'Male' | 'Female';
  profilePhoto?: string;
  subjectSpecialization?: string; // Specialization alias
  department?: 'Daycare-JHS' | 'SHS'; // Separate Daycare-JHS from SHS
}

export interface SchoolClass {
  id: string;
  name: string;
  teacherId: string; // References Teacher.id (Form Teacher)
  room: string;
  gradeLevel: 'Primary' | 'JHS' | 'SHS';
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string; // References SchoolClass.id
  teacherId?: string; // Optional teacherId mapping
}

export interface Attendance {
  id: string;
  studentId: string; // References Student.id
  classId: string; // References SchoolClass.id
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
}

export interface ExamGrade {
  id: string;
  studentId: string; // References Student.id
  subjectId: string; // References Subject.id
  term: 'Term 1' | 'Term 2' | 'Term 3';
  classScore: number; // Max 30 (continuous assessment in Ghana standard)
  examScore: number;  // Max 70 (exam score in Ghana standard)
  totalScore: number; // Max 100
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  remarks: string;
  date: string;
}

export interface TimetableEntry {
  id: string;
  classId: string; // References SchoolClass.id
  subjectId: string; // References Subject.id
  teacherId: string; // References Teacher.id
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:30"
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD HH:MM
  authorRole: string;
  authorName: string;
  targetAudience: 'All' | 'Teachers' | 'Students';
}

export interface PaymentTransaction {
  id: string;
  studentId: string; // References Student.id
  studentName: string;
  amountGHS: number;
  date: string; // YYYY-MM-DD HH:MM
  status: 'Successful' | 'Pending' | 'Failed';
  reference: string;
  paystackRef: string;
  paymentMethod: 'Card' | 'MTN Mobile Money' | 'Telecel Cash' | 'AirtelTigo Money' | 'Bank Transfer';
  email: string;
  term: 'Term 1' | 'Term 2' | 'Term 3';
}

export interface PublicInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'Admission' | 'General' | 'Feedback';
  message: string;
  date: string;
  status: 'Pending' | 'Reviewed' | 'Contacted';
  studentGradeLevel?: string;
}

export interface SimulatedEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'Announcement' | 'FeeDeadline' | 'MorningReport';
  status: 'Sent' | 'Failed';
}

export interface ClassNote {
  id: string;
  studentId: string; // References Student.id
  teacherId: string; // References Teacher.id (authoring teacher)
  note: string;      // Private observation message
  date: string;      // Date created/updated
}

export interface SyllabusPlan {
  id: string;
  subjectId: string;
  subjectName: string;
  classId?: string;
  className?: string;
  teacherId?: string;
  teacherName?: string;
  weekNumber: number;
  topic?: string;
  objectives?: string;
  studyMaterials?: string;
  dateCreated?: string;
  
  // Component-level alias fields to support different views
  topicTitle?: string;
  learningObjectives?: string[];
  resources?: string[];
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Scheduled' | 'Complete';
  scheduleDates?: string;
}

export interface TeacherAbsence {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  status: 'Absent' | 'Covered' | 'Unassigned' | 'Pending';
  reason?: string;
}

export interface CoverAssignment {
  id: string;
  absenceId: string;
  classId?: string;
  className?: string;
  timetableEntryId?: string;
  originalTeacherId?: string;
  coverTeacherId: string;
  coverTeacherName: string;
  period?: string; // e.g. "08:00 - 09:30"
  day?: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Confirmed';
  
  // Custom substitution fields
  absentTeacherId?: string;
  absentTeacherName?: string;
  assignedBy?: string;
}

export interface HomeworkAssignment {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  dateCreated: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submissionText: string;
  fileAttachment?: string; // e.g., "submit_math_geometry.pdf"
  submittedAt: string;
  status: 'Submitted' | 'Graded';
  score?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface StaffClockIn {
  id: string;
  staffId: string;
  staffName: string;
  role: 'Teacher' | 'Admin' | 'Security' | 'Canteen' | 'Driver';
  clockInTime: string;
  clockOutTime?: string;
  date: string;
  latitude: number;
  longitude: number;
  status: 'In-Range' | 'Out-Of-Range';
  distanceFromFenceM: number;
}

export interface StaffPayroll {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  month: string;
  status: 'Paid' | 'Processing' | 'Pending';
  paymentDate?: string;
  processedOn?: string;
}

export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: 'Sick' | 'Maternity' | 'Annual' | 'Compassionate';
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}


