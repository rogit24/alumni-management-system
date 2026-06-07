

export const mockUsers = [
  {
    id: 1,
    name: "Amit Patel",
    email: "student1@gmail.com",
    password: "123",
    role: "student",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "alumni1@gmail.com",
    password: "123",
    role: "alumni",
  },
  {
    id: 3,
    name: "Raghav Singh",
    email: "student2@gmail.com",
    password: "123",
    role: "student",
  },
  {
    id: 4,
    name: "Shubham Sharma",
    email: "alumni2@gmail.com",
    password: "123",
    role: "alumni",
  },
  {
    id: 5,
    name: "Rekha Sharma",
    email: "student3@gmail.com",
    password: "123",
    role: "student",
  },
  {
    id: 6,
    name: "Admin User",
    email: "admin@gmail.com",
    password: "123",
    role: "admin",
  }
];

export const mockMessages = [
  {
    id: 1,
    senderEmail: "student@gmail.com",
    receiverEmail: "alumni@gmail.com",
    senderName: "Amit Patel",
    message: "Hello Sir",
    date: "2026-06-07"
  },
  {
    id: 2,
    senderEmail: "alumni@gmail.com",
    receiverEmail: "student@gmail.com",
    senderName: "Rahul Sharma",
    message: "Hi, how can I help?",
    date: "2026-06-07"
  },
  {
    id: 3,
    senderEmail: "student@gmail.com",
    receiverEmail: "alumni@gmail.com",
    senderName: "Amit Patel",
    message: "Can I get a referral?",
    date: "2026-06-07"
  }
];

export const mockJobs = [
  { id: 1, title: "Software Engineer Intern", company: "Google" }
];

export const mockApplications = [
  { id: 1, jobId: 1, studentEmail: "student@gmail.com", status: "Pending" }
];

export const mockReferrals = [
  { id: 1, studentEmail: "student@gmail.com", alumniEmail: "alumni@gmail.com", status: "Approved" }
];

export default mockUsers;