import { 
  Student, 
  Teacher, 
  SchoolClass, 
  Subject, 
  Attendance, 
  ExamGrade, 
  TimetableEntry, 
  Announcement, 
  PaymentTransaction,
  PublicInquiry,
  SimulatedEmail,
  SimulatedSMS,
  ClassNote,
  SyllabusPlan,
  TeacherAbsence,
  CoverAssignment,
  HomeworkAssignment,
  HomeworkSubmission,
  StaffClockIn,
  StaffPayroll,
  StaffLeaveRequest,
  PaymentSchedulerPlan,
  PaymentSchedulerRunLog
} from './types';

// Initial School Classes
export const initialClasses: SchoolClass[] = [
  { id: 'c1', name: 'Primary 5', teacherId: 't3', room: 'Block A, Room 1', gradeLevel: 'Primary' },
  { id: 'c2', name: 'Primary 6', teacherId: 't4', room: 'Block A, Room 2', gradeLevel: 'Primary' },
  { id: 'c3', name: 'JHS 1', teacherId: 't2', room: 'Block B, JHS 1', gradeLevel: 'JHS' },
  { id: 'c4', name: 'JHS 2', teacherId: 't1', room: 'Block B, JHS 2', gradeLevel: 'JHS' },
  { id: 'c5', name: 'JHS 3', teacherId: 't5', room: 'Block B, JHS 3', gradeLevel: 'JHS' },
  { id: 'c6', name: 'SHS 1', teacherId: 't6', room: 'Science Lab Block', gradeLevel: 'SHS' }
];

// Initial Teachers
export const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Mr. Kwame Boateng', staffNumber: 'ERA-T-001', email: 'kwame@edweso.edu.gh', phone: '+233 24 412 3456', subjectId: 'Mathematics', status: 'Active', gender: 'Male', department: 'Daycare-JHS' },
  { id: 't2', name: 'Mrs. Ama Serwaa Addo', staffNumber: 'ERA-T-002', email: 'ama.serwaa@edweso.edu.gh', phone: '+233 27 755 8910', subjectId: 'Integrated Science', status: 'Active', gender: 'Female', department: 'Daycare-JHS' },
  { id: 't3', name: 'Mr. Kofi Mensah', staffNumber: 'ERA-T-003', email: 'kofi.mensah@edweso.edu.gh', phone: '+233 20 123 4567', subjectId: 'English Language', status: 'Active', gender: 'Male', department: 'Daycare-JHS' },
  { id: 't4', name: 'Miss Abena Osei', staffNumber: 'ERA-T-004', email: 'abena.osei@edweso.edu.gh', phone: '+233 54 876 5432', subjectId: 'Social Studies', status: 'Active', gender: 'Female', department: 'Daycare-JHS' },
  { id: 't5', name: 'Mr. Yaw Asante', staffNumber: 'ERA-T-005', email: 'yaw.asante@edweso.edu.gh', phone: '+233 24 333 4444', subjectId: 'ICT', status: 'Active', gender: 'Male', department: 'Daycare-JHS' },
  { id: 't6', name: 'Dr. Joseph Darko', staffNumber: 'ERA-T-006', email: 'j.darko@edweso.edu.gh', phone: '+233 26 999 8888', subjectId: 'RME', status: 'Active', gender: 'Male', department: 'SHS' }
];

// Initial Subjects (curriculum aligned)
export const initialSubjects: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MATH', classId: 'c4' },
  { id: 's2', name: 'Integrated Science', code: 'INT-SCI', classId: 'c4' },
  { id: 's3', name: 'English Language', code: 'ENG', classId: 'c4' },
  { id: 's4', name: 'Social Studies', code: 'SOC-ST', classId: 'c4' },
  { id: 's5', name: 'ICT (Information Tech)', code: 'ICT', classId: 'c4' },
  { id: 's6', name: 'Religious & Moral Education (RME)', code: 'RME', classId: 'c4' },
  { id: 's7', name: 'Fante / Twi', code: 'GHA-LANG', classId: 'c4' },
  
  // Primary 6
  { id: 's8', name: 'Mathematics', code: 'MATH-P6', classId: 'c2' },
  { id: 's9', name: 'English Language', code: 'ENG-P6', classId: 'c2' },
  { id: 's10', name: 'Science', code: 'SCI-P6', classId: 'c2' }
];

// Initial Students
export const initialStudents: Student[] = [
  { id: 'st1', name: 'Kofi Mensah Jnr', admissionNumber: 'ERA-S-2024-001', classId: 'c4', parentName: 'Isaac Mensah', parentPhone: '+233 24 455 6677', parentEmail: 'isaac.mensah@gmail.com', status: 'Active', balanceGHS: 1250.00, gender: 'Male', dob: '2012-04-12' },
  { id: 'st2', name: 'Ama Serwaa Prempeh', admissionNumber: 'ERA-S-2024-002', classId: 'c4', parentName: 'Nana Prempeh II', parentPhone: '+233 20 888 9900', parentEmail: 'prempeh.family@yahoo.com', status: 'Active', balanceGHS: 0.00, gender: 'Female', dob: '2012-08-25' },
  { id: 'st3', name: 'Kwame Boateng Jr', admissionNumber: 'ERA-S-2024-003', classId: 'c4', parentName: 'Kojo Boateng', parentPhone: '+233 27 666 5544', parentEmail: 'kboateng@outlook.com', status: 'Active', balanceGHS: 2400.00, gender: 'Male', dob: '2012-01-15' },
  { id: 'st4', name: 'Esi Pokuaa Owusu', admissionNumber: 'ERA-S-2023-104', classId: 'c4', parentName: 'Beatrice Owusu', parentPhone: '+233 54 111 2222', parentEmail: 'owusu.bea@gmail.com', status: 'Active', balanceGHS: 450.00, gender: 'Female', dob: '2011-11-03' },
  { id: 'st5', name: 'Emmanuel Tetteh', admissionNumber: 'ERA-S-2023-085', classId: 'c4', parentName: 'Seth Tetteh', parentPhone: '+233 24 777 6666', parentEmail: 'tettehseth67@gmail.com', status: 'Active', balanceGHS: 0.00, gender: 'Male', dob: '2012-06-30' },
  
  // Others
  { id: 'st6', name: 'Akosua Dufie Asante', admissionNumber: 'ERA-S-2024-099', classId: 'c2', parentName: 'Yaw Asante', parentPhone: '+233 24 333 4444', parentEmail: 'yaw.asante@edweso.edu.gh', status: 'Active', balanceGHS: 1500.00, gender: 'Female', dob: '2014-03-20' },
  { id: 'st7', name: 'Yao Dzamesi', admissionNumber: 'ERA-S-2023-202', classId: 'c5', parentName: 'Justice Dzamesi', parentPhone: '+233 26 444 3333', parentEmail: 'jdzamesi@gmail.com', status: 'Active', balanceGHS: 3100.00, gender: 'Male', dob: '2010-09-09' },
  { id: 'st8', name: 'Kojo Antwi', admissionNumber: 'ERA-S-2022-012', classId: 'c6', parentName: 'Ebenezer Antwi', parentPhone: '+233 20 555 1212', parentEmail: 'eb.antwi@gmail.com', status: 'Active', balanceGHS: 0.00, gender: 'Male', dob: '2009-02-14' }
];

// Initial Attendance
export const initialAttendance: Attendance[] = [
  { id: 'at1', studentId: 'st1', classId: 'c4', date: '2026-07-02', status: 'Present' },
  { id: 'at2', studentId: 'st2', classId: 'c4', date: '2026-07-02', status: 'Present' },
  { id: 'at3', studentId: 'st3', classId: 'c4', date: '2026-07-02', status: 'Late', remarks: 'Lorry was delayed at Edweso Junction' },
  { id: 'at4', studentId: 'st4', classId: 'c4', date: '2026-07-02', status: 'Absent', remarks: 'Sick leave (Malaria treatment)' },
  { id: 'at5', studentId: 'st5', classId: 'c4', date: '2026-07-02', status: 'Present' },
  
  // Previous day
  { id: 'at6', studentId: 'st1', classId: 'c4', date: '2026-07-01', status: 'Present' },
  { id: 'at7', studentId: 'st2', classId: 'c4', date: '2026-07-01', status: 'Present' },
  { id: 'at8', studentId: 'st3', classId: 'c4', date: '2026-07-01', status: 'Present' },
  { id: 'at9', studentId: 'st4', classId: 'c4', date: '2026-07-01', status: 'Present' },
  { id: 'at10', studentId: 'st5', classId: 'c4', date: '2026-07-01', status: 'Present' }
];

// Helper to determine Grade from total scores (Ghana GES standards)
export function calculateGhanaGrade(total: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (total >= 80) return 'A'; // Excellent
  if (total >= 70) return 'B'; // Very Good
  if (total >= 60) return 'C'; // Credit
  if (total >= 50) return 'D'; // Pass
  if (total >= 40) return 'E'; // Weak Pass
  return 'F';                 // Fail
}

export function getGradeRemark(grade: string): string {
  switch (grade) {
    case 'A': return 'Excellent performance, keep it up!';
    case 'B': return 'Very good work, minor improvements needed.';
    case 'C': return 'Good score, can do better.';
    case 'D': return 'Average performance, needs dedication.';
    case 'E': return 'Weak pass, seek extra guidance.';
    default: return 'Fail. Remedial classes recommended.';
  }
}

// Initial Exam Grades
export const initialGrades: ExamGrade[] = [
  // Kofi Mensah Jnr Grades
  { id: 'g1', studentId: 'st1', subjectId: 's1', term: 'Term 1', classScore: 24, examScore: 58, totalScore: 82, grade: 'A', remarks: 'Outstanding math conceptual understanding.', date: '2026-04-10' },
  { id: 'g2', studentId: 'st1', subjectId: 's2', term: 'Term 1', classScore: 21, examScore: 52, totalScore: 73, grade: 'B', remarks: 'Solid work in science experiments.', date: '2026-04-12' },
  { id: 'g3', studentId: 'st1', subjectId: 's3', term: 'Term 1', classScore: 25, examScore: 61, totalScore: 86, grade: 'A', remarks: 'Exceptional creative writing.', date: '2026-04-14' },
  { id: 'g1_t2_s1', studentId: 'st1', subjectId: 's1', term: 'Term 2', classScore: 26, examScore: 60, totalScore: 86, grade: 'A', remarks: 'Improved standard math proofs.', date: '2026-08-10' },
  { id: 'g1_t2_s2', studentId: 'st1', subjectId: 's2', term: 'Term 2', classScore: 22, examScore: 56, totalScore: 78, grade: 'B', remarks: 'Active in science labs.', date: '2026-08-12' },
  { id: 'g1_t3_s1', studentId: 'st1', subjectId: 's1', term: 'Term 3', classScore: 28, examScore: 62, totalScore: 90, grade: 'A', remarks: 'Exceptional year-end performance.', date: '2026-11-10' },
  { id: 'g1_t3_s2', studentId: 'st1', subjectId: 's2', term: 'Term 3', classScore: 25, examScore: 58, totalScore: 83, grade: 'A', remarks: 'Superb focus and retention.', date: '2026-11-12' },
  
  // Ama Serwaa Grades
  { id: 'g4', studentId: 'st2', subjectId: 's1', term: 'Term 1', classScore: 28, examScore: 65, totalScore: 93, grade: 'A', remarks: 'Flawless score in all algebra tests.', date: '2026-04-10' },
  { id: 'g5', studentId: 'st2', subjectId: 's2', term: 'Term 1', classScore: 27, examScore: 64, totalScore: 91, grade: 'A', remarks: 'Remarkable research on electricity circuits.', date: '2026-04-12' },
  { id: 'g2_t2_s1', studentId: 'st2', subjectId: 's1', term: 'Term 2', classScore: 29, examScore: 67, totalScore: 96, grade: 'A', remarks: 'Top-tier analytical reasoning.', date: '2026-08-10' },
  { id: 'g2_t2_s2', studentId: 'st2', subjectId: 's2', term: 'Term 2', classScore: 26, examScore: 63, totalScore: 89, grade: 'A', remarks: 'Splendid scientific report format.', date: '2026-08-12' },
  { id: 'g2_t3_s1', studentId: 'st2', subjectId: 's1', term: 'Term 3', classScore: 30, examScore: 68, totalScore: 98, grade: 'A', remarks: 'Near perfect scores all year.', date: '2026-11-10' },
  { id: 'g2_t3_s2', studentId: 'st2', subjectId: 's2', term: 'Term 3', classScore: 28, examScore: 66, totalScore: 94, grade: 'A', remarks: 'Excellent project work.', date: '2026-11-12' },
  
  // Kwame Boateng Jr Grades
  { id: 'g6', studentId: 'st3', subjectId: 's1', term: 'Term 1', classScore: 18, examScore: 42, totalScore: 60, grade: 'C', remarks: 'Good attempt, can solve complex equations with practice.', date: '2026-04-10' },
  { id: 'g7', studentId: 'st3', subjectId: 's2', term: 'Term 1', classScore: 15, examScore: 38, totalScore: 53, grade: 'D', remarks: 'Needs more focus during biology labs.', date: '2026-04-12' },
  { id: 'g3_t2_s1', studentId: 'st3', subjectId: 's1', term: 'Term 2', classScore: 20, examScore: 45, totalScore: 65, grade: 'C', remarks: 'Showing positive attitude to equations.', date: '2026-08-10' },
  { id: 'g3_t2_s2', studentId: 'st3', subjectId: 's2', term: 'Term 2', classScore: 18, examScore: 40, totalScore: 58, grade: 'D', remarks: 'Practical works are getting better.', date: '2026-08-12' },
  { id: 'g3_t3_s1', studentId: 'st3', subjectId: 's1', term: 'Term 3', classScore: 22, examScore: 50, totalScore: 72, grade: 'B', remarks: 'A wonderful leap to B grade!', date: '2026-11-10' },
  { id: 'g3_t3_s2', studentId: 'st3', subjectId: 's2', term: 'Term 3', classScore: 21, examScore: 49, totalScore: 70, grade: 'B', remarks: 'Significant improvement in lab work.', date: '2026-11-12' },

  // Esi Pokuaa Owusu Grades
  { id: 'g4_t1_s1', studentId: 'st4', subjectId: 's1', term: 'Term 1', classScore: 22, examScore: 50, totalScore: 72, grade: 'B', remarks: 'Consistent study routine yields results.', date: '2026-04-10' },
  { id: 'g4_t1_s2', studentId: 'st4', subjectId: 's2', term: 'Term 1', classScore: 20, examScore: 48, totalScore: 68, grade: 'C', remarks: 'Solid passing scores.', date: '2026-04-12' },
  { id: 'g4_t2_s1', studentId: 'st4', subjectId: 's1', term: 'Term 2', classScore: 23, examScore: 54, totalScore: 77, grade: 'B', remarks: 'Impressive effort.', date: '2026-08-10' },
  { id: 'g4_t2_s2', studentId: 'st4', subjectId: 's2', term: 'Term 2', classScore: 22, examScore: 51, totalScore: 73, grade: 'B', remarks: 'Moving up nicely.', date: '2026-08-12' },
  { id: 'g4_t3_s1', studentId: 'st4', subjectId: 's1', term: 'Term 3', classScore: 25, examScore: 58, totalScore: 83, grade: 'A', remarks: 'Outstanding term-end grades!', date: '2026-11-10' },
  { id: 'g4_t3_s2', studentId: 'st4', subjectId: 's2', term: 'Term 3', classScore: 24, examScore: 56, totalScore: 80, grade: 'A', remarks: 'Superb upward growth.', date: '2026-11-12' },

  // Emmanuel Tetteh Grades
  { id: 'g5_t1_s1', studentId: 'st5', subjectId: 's1', term: 'Term 1', classScore: 25, examScore: 58, totalScore: 83, grade: 'A', remarks: 'Outstanding math solutions.', date: '2026-04-10' },
  { id: 'g5_t1_s2', studentId: 'st5', subjectId: 's2', term: 'Term 1', classScore: 23, examScore: 55, totalScore: 78, grade: 'B', remarks: 'Strong logical analysis.', date: '2026-04-12' },
  { id: 'g5_t2_s1', studentId: 'st5', subjectId: 's1', term: 'Term 2', classScore: 26, examScore: 61, totalScore: 87, grade: 'A', remarks: 'Brilliant algebraic calculations.', date: '2026-08-10' },
  { id: 'g5_t2_s2', studentId: 'st5', subjectId: 's2', term: 'Term 2', classScore: 24, examScore: 58, totalScore: 82, grade: 'A', remarks: 'Remarkable research on mechanics.', date: '2026-08-12' },
  { id: 'g5_t3_s1', studentId: 'st5', subjectId: 's1', term: 'Term 3', classScore: 28, examScore: 63, totalScore: 91, grade: 'A', remarks: 'Magnificent performance, top tier.', date: '2026-11-10' },
  { id: 'g5_t3_s2', studentId: 'st5', subjectId: 's2', term: 'Term 3', classScore: 26, examScore: 60, totalScore: 86, grade: 'A', remarks: 'Fabulous efforts in science fair.', date: '2026-11-12' }
];

// Initial Timetable
export const initialTimetable: TimetableEntry[] = [
  // JHS 2 (c4) Timetable
  { id: 'tt1', classId: 'c4', subjectId: 's1', teacherId: 't1', day: 'Monday', startTime: '08:00', endTime: '09:30' },
  { id: 'tt2', classId: 'c4', subjectId: 's2', teacherId: 't2', day: 'Monday', startTime: '10:00', endTime: '11:30' },
  { id: 'tt3', classId: 'c4', subjectId: 's3', teacherId: 't3', day: 'Tuesday', startTime: '08:00', endTime: '09:30' },
  { id: 'tt4', classId: 'c4', subjectId: 's4', teacherId: 't4', day: 'Tuesday', startTime: '10:00', endTime: '11:30' },
  { id: 'tt5', classId: 'c4', subjectId: 's5', teacherId: 't5', day: 'Wednesday', startTime: '08:00', endTime: '09:30' },
  { id: 'tt6', classId: 'c4', subjectId: 's6', teacherId: 't6', day: 'Wednesday', startTime: '10:00', endTime: '11:30' },
  { id: 'tt7', classId: 'c4', subjectId: 's1', teacherId: 't1', day: 'Thursday', startTime: '08:00', endTime: '09:30' },
  { id: 'tt8', classId: 'c4', subjectId: 's2', teacherId: 't2', day: 'Thursday', startTime: '10:00', endTime: '11:30' },
  { id: 'tt9', classId: 'c4', subjectId: 's7', teacherId: 't4', day: 'Friday', startTime: '08:00', endTime: '10:00' }
];

// Initial Announcements
export const initialAnnouncements: Announcement[] = [
  { id: 'a1', title: 'Edweso Royal PTA Meeting', content: 'Dear Parents, our 2nd Term Parent-Teacher Association (PTA) meeting is scheduled for Saturday, July 18th at 10:00 AM in the main School Assembly Hall. We will discuss development fees and the upcoming National STEM Championship. Please make it a point to attend.', date: '2026-07-02 08:30', authorRole: 'Admin', authorName: 'Principal J. K. Appiah', targetAudience: 'All' },
  { id: 'a2', title: 'Mid-Term Examinations Schedule', content: 'The Mid-Term examinations for all Primary, JHS, and SHS departments will commence on July 20th. Class teachers should submit their draft exam questions by July 10th. Students should clear all outstanding fee balances to avoid disruption.', date: '2026-06-28 14:00', authorRole: 'Admin', authorName: 'Madam Margaret Mensah (VP Academics)', targetAudience: 'All' },
  { id: 'a3', title: 'Science Lab Upgrade Guidelines', content: 'Teachers, please notice that the Science lab will be locked from 2:00 PM today for maintenance. Ensure all laboratory chemicals are safely sealed and the power sockets turned off.', date: '2026-07-01 11:15', authorRole: 'Admin', authorName: 'Science Coordinator', targetAudience: 'Teachers' },
  { id: 'a4', title: 'Inter-School Soccer Championship Support', content: 'Royal Warriors play today against Ejisu High School at the municipal park. Kick-off is 4:00 PM. Students can travel on the school bus after normal classes at 3:15 PM.', date: '2026-07-02 12:00', authorRole: 'Teacher', authorName: 'Mr. Kwame Boateng', targetAudience: 'Students' }
];

// Initial Payments & Transactions
export const initialTransactions: PaymentTransaction[] = [
  { id: 'tx1', studentId: 'st1', studentName: 'Kofi Mensah Jnr', amountGHS: 1250.00, date: '2026-05-15 10:20', status: 'Successful', reference: 'ERA-TX-9871', paystackRef: 'PSTK-734891240', paymentMethod: 'MTN Mobile Money', email: 'isaac.mensah@gmail.com', term: 'Term 1' },
  { id: 'tx2', studentId: 'st2', studentName: 'Ama Serwaa Prempeh', amountGHS: 2500.00, date: '2026-05-16 14:45', status: 'Successful', reference: 'ERA-TX-9872', paystackRef: 'PSTK-901248911', paymentMethod: 'Card', email: 'prempeh.family@yahoo.com', term: 'Term 1' },
  { id: 'tx3', studentId: 'st4', studentName: 'Esi Pokuaa Owusu', amountGHS: 2000.00, date: '2026-05-20 09:12', status: 'Successful', reference: 'ERA-TX-9873', paystackRef: 'PSTK-019348924', paymentMethod: 'Telecel Cash', email: 'owusu.bea@gmail.com', term: 'Term 1' },
  { id: 'tx4', studentId: 'st5', studentName: 'Emmanuel Tetteh', amountGHS: 2500.00, date: '2026-06-01 11:30', status: 'Successful', reference: 'ERA-TX-9874', paystackRef: 'PSTK-112348935', paymentMethod: 'MTN Mobile Money', email: 'tettehseth67@gmail.com', term: 'Term 1' },
  { id: 'tx5', studentId: 'st3', studentName: 'Kwame Boateng Jr', amountGHS: 100.00, date: '2026-06-05 16:00', status: 'Failed', reference: 'ERA-TX-9875', paystackRef: 'PSTK-224489311', paymentMethod: 'AirtelTigo Money', email: 'kboateng@outlook.com', term: 'Term 1' },
  { id: 'tx-p1', studentId: 'st1', studentName: 'Kofi Mensah Jnr', amountGHS: 1800.00, date: '2026-07-11 15:30', status: 'Pending', reference: 'ERA-TX-PND1', paystackRef: 'PSTK-PENDING-MOMO-910', paymentMethod: 'MTN Mobile Money', email: 'isaac.mensah@gmail.com', term: 'Term 1' },
  { id: 'tx-p2', studentId: 'st3', studentName: 'Kwame Boateng Jr', amountGHS: 1500.00, date: '2026-07-12 09:10', status: 'Pending', reference: 'ERA-TX-PND2', paystackRef: 'PSTK-PENDING-BANK-102', paymentMethod: 'Bank Transfer', email: 'kboateng@outlook.com', term: 'Term 1' }
];

// Initial Homework Assignments
export const initialHomeworkAssignments: HomeworkAssignment[] = [
  {
    id: 'hw1',
    classId: 'c4', // JHS 2
    subjectId: 's1', // Mathematics
    subjectName: 'Mathematics',
    title: 'Solving Linear Equations',
    description: 'Solve equations of the form ax + b = cx + d. Write out all step-by-step calculations. Practice problems 1 to 10 on page 42 of the GES Core Mathematics textbook.',
    dueDate: '2026-07-15',
    maxScore: 20,
    dateCreated: '2026-07-05'
  },
  {
    id: 'hw2',
    classId: 'c4', // JHS 2
    subjectId: 's2', // Integrated Science
    subjectName: 'Integrated Science',
    title: 'Photosynthesis Experiment Reflection',
    description: 'Write a 1-page essay explaining the role of chlorophyll in photosynthesis. Discuss the light-dependent and light-independent stages, and describe our classroom experiment results.',
    dueDate: '2026-07-18',
    maxScore: 10,
    dateCreated: '2026-07-06'
  }
];

// Initial Homework Submissions
export const initialHomeworkSubmissions: HomeworkSubmission[] = [
  {
    id: 'hsub1',
    assignmentId: 'hw1',
    assignmentTitle: 'Solving Linear Equations',
    studentId: 'st5', // Emmanuel Tetteh (the current active user we are testing with!)
    studentName: 'Emmanuel Tetteh',
    submissionText: 'For equation 1: 3x + 5 = 2x + 10 => 3x - 2x = 10 - 5 => x = 5. Verified correct! For equation 2: 5x - 3 = 2x + 9 => 3x = 12 => x = 4. Done.',
    submittedAt: '2026-07-06 14:30',
    status: 'Graded',
    score: 19,
    feedback: 'Excellent step-by-step proofs, Emmanuel! Keep up the brilliant math precision.',
    gradedBy: 'Mr. Kwame Boateng',
    gradedAt: '2026-07-07 10:00'
  }
];

// Helper to load/save state with LocalStorage
const STORAGE_PREFIX = 'ERA_SCHOOL_';

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const val = localStorage.getItem(STORAGE_PREFIX + key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.error(`Failed to read ${key} from storage`, e);
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save ${key} to storage`, e);
  }
}

// Database state managers
export class SchoolDatabase {
  static getStudents(): Student[] {
    return getStored<Student[]>('STUDENTS', initialStudents);
  }

  static saveStudents(students: Student[]): void {
    setStored('STUDENTS', students);
  }

  static getTeachers(): Teacher[] {
    return getStored<Teacher[]>('TEACHERS', initialTeachers);
  }

  static saveTeachers(teachers: Teacher[]): void {
    setStored('TEACHERS', teachers);
  }

  static getClasses(): SchoolClass[] {
    return getStored<SchoolClass[]>('CLASSES', initialClasses);
  }

  static saveClasses(classes: SchoolClass[]): void {
    setStored('CLASSES', classes);
  }

  static getSubjects(): Subject[] {
    return getStored<Subject[]>('SUBJECTS', initialSubjects);
  }

  static saveSubjects(subjects: Subject[]): void {
    setStored('SUBJECTS', subjects);
  }

  static getAttendance(): Attendance[] {
    return getStored<Attendance[]>('ATTENDANCE', initialAttendance);
  }

  static saveAttendance(attendance: Attendance[]): void {
    setStored('ATTENDANCE', attendance);
  }

  static getGrades(): ExamGrade[] {
    return getStored<ExamGrade[]>('GRADES', initialGrades);
  }

  static saveGrades(grades: ExamGrade[]): void {
    setStored('GRADES', grades);
  }

  static getTimetable(): TimetableEntry[] {
    return getStored<TimetableEntry[]>('TIMETABLE', initialTimetable);
  }

  static saveTimetable(timetable: TimetableEntry[]): void {
    setStored('TIMETABLE', timetable);
  }

  static getAnnouncements(): Announcement[] {
    return getStored<Announcement[]>('ANNOUNCEMENTS', initialAnnouncements);
  }

  static saveAnnouncements(announcements: Announcement[]): void {
    setStored('ANNOUNCEMENTS', announcements);
  }

  static getTransactions(): PaymentTransaction[] {
    const txs = getStored<PaymentTransaction[]>('TRANSACTIONS', initialTransactions);
    if (!txs.some(t => t.id === 'tx-p1') && !txs.some(t => t.id === 'tx-p2')) {
      const merged = [...txs, ...initialTransactions.filter(item => item.id === 'tx-p1' || item.id === 'tx-p2')];
      setStored('TRANSACTIONS', merged);
      return merged;
    }
    return txs;
  }

  static saveTransactions(transactions: PaymentTransaction[]): void {
    setStored('TRANSACTIONS', transactions);
  }

  static getInquiries(): PublicInquiry[] {
    return getStored<PublicInquiry[]>('INQUIRIES', initialInquiries);
  }

  static saveInquiries(inquiries: PublicInquiry[]): void {
    setStored('INQUIRIES', inquiries);
  }

  static getEmails(): SimulatedEmail[] {
    return getStored<SimulatedEmail[]>('EMAILS', initialEmails);
  }

  static saveEmails(emails: SimulatedEmail[]): void {
    setStored('EMAILS', emails);
  }

  static getSMS(): SimulatedSMS[] {
    return getStored<SimulatedSMS[]>('SMS_ALERTS', initialSMS);
  }

  static saveSMS(smsList: SimulatedSMS[]): void {
    setStored('SMS_ALERTS', smsList);
  }

  static getClassNotes(): ClassNote[] {
    return getStored<ClassNote[]>('CLASS_NOTES', []);
  }

  static saveClassNotes(notes: ClassNote[]): void {
    setStored('CLASS_NOTES', notes);
  }

  static getStaffClockIns(): StaffClockIn[] {
    return getStored<StaffClockIn[]>('STAFF_CLOCKINS', initialStaffClockIns);
  }

  static saveStaffClockIns(clockIns: StaffClockIn[]): void {
    setStored('STAFF_CLOCKINS', clockIns);
  }

  static getStaffPayroll(): StaffPayroll[] {
    return getStored<StaffPayroll[]>('STAFF_PAYROLL', initialStaffPayroll);
  }

  static saveStaffPayroll(payroll: StaffPayroll[]): void {
    setStored('STAFF_PAYROLL', payroll);
  }

  static getStaffLeaves(): StaffLeaveRequest[] {
    return getStored<StaffLeaveRequest[]>('STAFF_LEAVES', initialStaffLeaves);
  }

  static saveStaffLeaves(leaves: StaffLeaveRequest[]): void {
    setStored('STAFF_LEAVES', leaves);
  }

  static getSyllabusPlans(): SyllabusPlan[] {
    const initialSyllabusPlans: SyllabusPlan[] = [
      {
        id: 'sp-1',
        subjectId: 's1',
        subjectName: 'Mathematics',
        classId: 'c4',
        className: 'JHS 2',
        teacherId: 't1',
        teacherName: 'Mr. Kwame Boateng',
        weekNumber: 1,
        topic: 'Algebraic Expressions & Factorization',
        objectives: '1. Understand variables, coefficients, and terms.\n2. Expand binominal algebraic expressions using the distributive law.\n3. Factorize basic algebraic expressions by grouping common factors.',
        studyMaterials: 'GES JHS Mathematics Textbook pages 45-62, Algebraic expansion worksheets, Video reference: Introduction to Algebraic Equations.',
        dateCreated: '2026-06-15 08:00'
      },
      {
        id: 'sp-2',
        subjectId: 's2',
        subjectName: 'Integrated Science',
        classId: 'c4',
        className: 'JHS 2',
        teacherId: 't2',
        teacherName: 'Mrs. Ama Serwaa Addo',
        weekNumber: 1,
        topic: 'Matter & Physical/Chemical Changes',
        objectives: '1. Identify the three states of matter.\n2. Explain phase transitions (evaporation, sublimation, condensation).\n3. Distinguish between physical changes (reversible) and chemical changes (irreversible).',
        studyMaterials: 'GES Integrated Science Textbook JHS Chapter 2, Laboratory safety rules handout, Matter states simulation applet link.',
        dateCreated: '2026-06-16 09:15'
      },
      {
        id: 'sp-3',
        subjectId: 's3',
        subjectName: 'English Language',
        classId: 'c4',
        className: 'JHS 2',
        teacherId: 't3',
        teacherName: 'Mr. Kofi Mensah',
        weekNumber: 1,
        topic: 'Nouns, Pronouns & Subject-Verb Agreement',
        objectives: '1. Categorize nouns into proper, common, abstract, and collective.\n2. Apply subject-pronoun agreement rules in complex sentences.\n3. Identify and correct concord errors in essays.',
        studyMaterials: 'JHS Golden English Grammar Guide Book 2, concord correction exercise sheets, spelling lists.',
        dateCreated: '2026-06-17 10:30'
      }
    ];
    return getStored<SyllabusPlan[]>('SYLLABUS_PLANS', initialSyllabusPlans);
  }

  static saveSyllabusPlans(plans: SyllabusPlan[]): void {
    setStored('SYLLABUS_PLANS', plans);
  }

  static getTeacherAbsences(): TeacherAbsence[] {
    return getStored<TeacherAbsence[]>('TEACHER_ABSENCES', []);
  }

  static saveTeacherAbsences(absences: TeacherAbsence[]): void {
    setStored('TEACHER_ABSENCES', absences);
  }

  static getCoverAssignments(): CoverAssignment[] {
    return getStored<CoverAssignment[]>('COVER_ASSIGNMENTS', []);
  }

  static saveCoverAssignments(covers: CoverAssignment[]): void {
    setStored('COVER_ASSIGNMENTS', covers);
  }

  static getSystemActivities(): { id: string; type: 'login' | 'grade' | 'attendance'; user: string; details: string; timestamp: string }[] {
    const defaultActivities = [
      { id: 'act-1', type: 'login' as const, user: 'Mr. Kwame Boateng', details: 'Authenticated successfully into Teacher Portal', timestamp: '2 mins ago' },
      { id: 'act-2', type: 'attendance' as const, user: 'Mrs. Ama Serwaa Addo', details: 'Submitted attendance roll for Primary 4 (28 present, 2 absent)', timestamp: '12 mins ago' },
      { id: 'act-3', type: 'grade' as const, user: 'Mr. Yaw Asante', details: 'Uploaded JHS 2 ICT exam marks for 35 pupils', timestamp: '28 mins ago' },
      { id: 'act-4', type: 'login' as const, user: 'Admin (Principal Appiah)', details: 'Logged in from administrative console', timestamp: '1 hour ago' },
      { id: 'act-5', type: 'attendance' as const, user: 'Mr. Kofi Mensah', details: 'Attendance marked for JHS 1 (30 present, 0 absent)', timestamp: '2 hours ago' },
      { id: 'act-6', type: 'grade' as const, user: 'Miss Abena Osei', details: 'Term III Social Studies grades approved and released', timestamp: '4 hours ago' },
      { id: 'act-7', type: 'login' as const, user: 'Student (Emmanuel Tetteh)', details: 'Logged in to student terminal to view grades', timestamp: '6 hours ago' },
    ];
    return getStored<any[]>('SYSTEM_ACTIVITIES', defaultActivities);
  }

  static saveSystemActivities(activities: any[]): void {
    setStored('SYSTEM_ACTIVITIES', activities);
  }

  static addSystemActivity(type: 'login' | 'grade' | 'attendance', user: string, details: string): void {
    const current = this.getSystemActivities();
    const newActivity = {
      id: 'act-' + Date.now(),
      type,
      user,
      details,
      timestamp: 'Just now'
    };
    this.saveSystemActivities([newActivity, ...current].slice(0, 50));
  }

  static getHomeworkAssignments(): HomeworkAssignment[] {
    return getStored<HomeworkAssignment[]>('HOMEWORK_ASSIGNMENTS', initialHomeworkAssignments);
  }

  static saveHomeworkAssignments(assignments: HomeworkAssignment[]): void {
    setStored('HOMEWORK_ASSIGNMENTS', assignments);
  }

  static getHomeworkSubmissions(): HomeworkSubmission[] {
    return getStored<HomeworkSubmission[]>('HOMEWORK_SUBMISSIONS', initialHomeworkSubmissions);
  }

  static saveHomeworkSubmissions(submissions: HomeworkSubmission[]): void {
    setStored('HOMEWORK_SUBMISSIONS', submissions);
  }

  static getSchedulerPlans(): PaymentSchedulerPlan[] {
    return getStored<PaymentSchedulerPlan[]>('SCHEDULER_PLANS', initialSchedulerPlans);
  }

  static saveSchedulerPlans(plans: PaymentSchedulerPlan[]): void {
    setStored('SCHEDULER_PLANS', plans);
  }

  static getSchedulerLogs(): PaymentSchedulerRunLog[] {
    return getStored<PaymentSchedulerRunLog[]>('SCHEDULER_RUN_LOGS', initialSchedulerLogs);
  }

  static saveSchedulerLogs(logs: PaymentSchedulerRunLog[]): void {
    setStored('SCHEDULER_RUN_LOGS', logs);
  }
}

// Initial public inquiries submitted via website
export const initialInquiries: PublicInquiry[] = [
  {
    id: 'inq-1',
    name: 'Michael Kofi Badu',
    email: 'm.k.badu@yahoo.com',
    phone: '+233 24 332 2110',
    type: 'Admission',
    message: 'Hello, I would like to inquire if there are still openings for JHS 1 for the upcoming term. My ward recently completed Primary 6 at Ejisu and excelled in Mathematics and Science. We would love to join the Edweso Royal family. What is the deadline for registration?',
    date: '2026-07-01 10:30',
    status: 'Pending',
    studentGradeLevel: 'JHS 1'
  },
  {
    id: 'inq-2',
    name: 'Sister Beatrice Mensah',
    email: 'beatricemensah64@gmail.com',
    phone: '+233 20 887 7665',
    type: 'General',
    message: 'Greetings administration, I would like to ask if your school bus service routes cover the Kumasi-Deduako area, or if we have to drop our child off at the Edweso Junction bus stop. Thank you so much and God bless!',
    date: '2026-07-02 08:15',
    status: 'Reviewed'
  },
  {
    id: 'inq-3',
    name: 'Dr. Evelyn Osei-Tutu',
    email: 'evelyn.ot@edu.gh',
    phone: '+233 54 991 2233',
    type: 'Feedback',
    message: 'I am highly impressed with the recent science lab upgrade and computing curriculum at Edweso Royal Academy. Our students are receiving a top-notch STEM foundation. I would love to volunteer to host a free weekend coding session for the kids!',
    date: '2026-07-02 12:40',
    status: 'Contacted'
  }
];

export const initialEmails: SimulatedEmail[] = [
  {
    id: 'em-1',
    recipientEmail: 'isaac.mensah@gmail.com',
    recipientName: 'Isaac Mensah',
    subject: 'Edweso Royal Academy PTA Meeting Bulletin',
    body: `Dear Isaac Mensah,

This is a simulated email alert from Edweso Royal Academy regarding the new announcement:

"Edweso Royal PTA Meeting"
--------------------------------------------------
Dear Parents, our 2nd Term Parent-Teacher Association (PTA) meeting is scheduled for Saturday, July 18th at 10:00 AM in the main School Assembly Hall. We will discuss development fees and the upcoming National STEM Championship. Please make it a point to attend.

Please login to your student portal to see more details.

KNOWLEDGE • DISCIPLINE • EXCELLENCE
Edweso Royal Academy Admin Portal Dispatch`,
    sentAt: '2026-07-02 08:30',
    type: 'Announcement',
    status: 'Sent'
  },
  {
    id: 'em-2',
    recipientEmail: 'kboateng@outlook.com',
    recipientName: 'Kojo Boateng',
    subject: 'URGENT: School Fees Payment Deadline Approaching',
    body: `Dear Kojo Boateng,

This is an official fee reminder notification from the Finance Office of Edweso Royal Academy.

Our records indicate that your ward, Kwame Boateng Jr, has an outstanding fees balance of GHS 2,400.00 for the current active term.

Please ensure this balance is cleared immediately. You can securely pay online with Paystack via your student portal, or make a cash deposit at the bursar's desk.

If you have already paid, kindly upload your transaction receipt in the student portal or contact our accounts desk.

Motto: KNOWLEDGE • DISCIPLINE • EXCELLENCE
Best regards,
Bursar Office
Edweso Royal Academy`,
    sentAt: '2026-07-02 16:45',
    type: 'FeeDeadline',
    status: 'Sent'
  }
];

export const initialSMS: SimulatedSMS[] = [
  {
    id: 'sms-init-1',
    recipientPhone: '+233 24 412 3456',
    recipientName: 'Isaac Mensah',
    message: '[ALERT] Edweso Royal Academy: PTA Meeting scheduled for Saturday, July 18th at 10:00 AM in the main School Assembly Hall. Please make it a point to attend.',
    sentAt: '2026-07-02 08:32',
    type: 'Announcement',
    status: 'Sent'
  },
  {
    id: 'sms-init-2',
    recipientPhone: '+233 27 755 8910',
    recipientName: 'Kojo Boateng',
    message: '[ALERT] Edweso Royal Finance: School fee billing outstanding. Balance GHS 2,400.00 is due. Pay online via parent portal instantly.',
    sentAt: '2026-07-02 16:47',
    type: 'FeeDeadline',
    status: 'Sent'
  }
];

export const initialStaffClockIns: StaffClockIn[] = [
  {
    id: 'clk-1',
    staffId: 't1',
    staffName: 'Mr. Kwame Boateng',
    role: 'Teacher',
    clockInTime: '2026-07-10 07:45',
    date: '2026-07-10',
    latitude: 6.7022,
    longitude: -1.4933,
    status: 'In-Range',
    distanceFromFenceM: 12
  },
  {
    id: 'clk-2',
    staffId: 't2',
    staffName: 'Mrs. Ama Serwaa Addo',
    role: 'Teacher',
    clockInTime: '2026-07-10 07:51',
    date: '2026-07-10',
    latitude: 6.7025,
    longitude: -1.4931,
    status: 'In-Range',
    distanceFromFenceM: 45
  },
  {
    id: 'clk-3',
    staffId: 't3',
    staffName: 'Mr. Kofi Mensah',
    role: 'Teacher',
    clockInTime: '2026-07-09 07:48',
    clockOutTime: '2026-07-09 15:45',
    date: '2026-07-09',
    latitude: 6.7023,
    longitude: -1.4932,
    status: 'In-Range',
    distanceFromFenceM: 20
  }
];

export const initialStaffPayroll: StaffPayroll[] = [
  {
    id: 'pay-1',
    staffId: 't1',
    staffName: 'Mr. Kwame Boateng',
    role: 'Mathematics Lead',
    baseSalary: 3800,
    allowances: 350,
    deductions: 180,
    netSalary: 3970,
    month: 'July 2026',
    status: 'Processing'
  },
  {
    id: 'pay-2',
    staffId: 't2',
    staffName: 'Mrs. Ama Serwaa Addo',
    role: 'Science Form Teacher',
    baseSalary: 4000,
    allowances: 400,
    deductions: 200,
    netSalary: 4200,
    month: 'July 2026',
    status: 'Paid',
    paymentDate: '2026-07-10'
  },
  {
    id: 'pay-3',
    staffId: 't3',
    staffName: 'Mr. Kofi Mensah',
    role: 'Language Instructor',
    baseSalary: 3500,
    allowances: 250,
    deductions: 150,
    netSalary: 3600,
    month: 'July 2026',
    status: 'Paid',
    paymentDate: '2026-07-10'
  },
  {
    id: 'pay-4',
    staffId: 't4',
    staffName: 'Miss Abena Osei',
    role: 'Social Studies Teacher',
    baseSalary: 3500,
    allowances: 250,
    deductions: 150,
    netSalary: 3600,
    month: 'July 2026',
    status: 'Processing'
  }
];

export const initialStaffLeaves: StaffLeaveRequest[] = [
  {
    id: 'lv-1',
    staffId: 't3',
    staffName: 'Mr. Kofi Mensah',
    role: 'Teacher',
    startDate: '2026-07-15',
    endDate: '2026-07-17',
    reason: 'Dental surgery and follow-up consultation in Kumasi',
    type: 'Sick',
    status: 'Pending',
    appliedOn: '2026-07-10'
  },
  {
    id: 'lv-2',
    staffId: 't5',
    staffName: 'Mr. Yaw Asante',
    role: 'ICT Instructor',
    startDate: '2026-07-01',
    endDate: '2026-07-03',
    reason: 'Attending regional computing educator workshop',
    type: 'Annual',
    status: 'Approved',
    appliedOn: '2026-06-25'
  }
];

export const initialSchedulerPlans: PaymentSchedulerPlan[] = [
  {
    id: 'plan-1',
    name: 'Weekly Auto Fee Reminders',
    frequency: 'Weekly',
    targetAudience: 'AllOutstanding',
    emailSubject: 'URGENT: Outstanding Balance Reminder - Edweso Royal Academy',
    emailTemplate: 'Dear {parent_name},\n\nThis is an automated weekly reminder that your ward, {student_name}, has an outstanding fee balance of GHS {outstanding_balance} at Edweso Royal Academy.\n\nPlease log in to the portal and settle this balance promptly via Paystack. Thank you for your continued support.\n\nBest regards,\nBursar Office\nEdweso Royal Academy',
    isActive: true,
    createdAt: '2026-07-01 10:00',
    nextRunDate: '2026-07-15 08:00',
    lastRunDate: '2026-07-08 08:00'
  },
  {
    id: 'plan-2',
    name: 'JHS 3 Pre-Exam Clearing',
    frequency: 'Daily',
    targetAudience: 'c3', // references JHS 3 class in initial Classes
    emailSubject: 'IMPORTANT: Term 3 Examination Fee Clearing',
    emailTemplate: 'Dear {parent_name},\n\nAs JHS 3 pupils prepare for final term exams, we kindly request the settlement of all outstanding balances. Your ward {student_name} currently has an outstanding balance of GHS {outstanding_balance}.\n\nKindly clear this at the Bursar office or via Mobile Money on the portal to avoid exam sitting disruptions.\n\nWarm regards,\nHeadmistress Office',
    isActive: false,
    createdAt: '2026-07-05 14:30',
    nextRunDate: '2026-07-13 09:00',
    lastRunDate: undefined
  }
];

export const initialSchedulerLogs: PaymentSchedulerRunLog[] = [
  {
    id: 'log-1',
    planId: 'plan-1',
    planName: 'Weekly Auto Fee Reminders',
    runDate: '2026-07-08 08:00',
    emailsSentCount: 3,
    recipientNames: ['Kofi Mensah Parent', 'Amina Yusuf Parent', 'Ekow Taylor Parent'],
    status: 'Success'
  }
];


