

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
    senderEmail: "student1@gmail.com",
    receiverEmail: "alumni1@gmail.com",
    senderName: "Amit Patel",
    message: "Hello Sir",
    date: "2026-06-07"
  },
  {
    id: 2,
    senderEmail: "alumni1@gmail.com",
    receiverEmail: "student1@gmail.com",
    senderName: "Rahul Sharma",
    message: "Hi, how can I help?",
    date: "2026-06-07"
  },
  {
    id: 3,
    senderEmail: "student1@gmail.com",
    receiverEmail: "alumni1@gmail.com",
    senderName: "Amit Patel",
    message: "Can I get a referral?",
    date: "2026-06-07"
  }
];

export const mockJobs = [
  { id: 1, title: "Software Engineer Intern", company: "Google", salary: "$120,000/yr", location: "Mountain View, CA", description: "Looking for a software engineering intern to join our search team." }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    jobTitle: "Software Engineer Intern",
    company: "Google",
    salary: "$120,000/yr",
    studentName: "Amit Patel",
    studentEmail: "student1@gmail.com",
    status: "Pending",
    appliedDate: "2026-06-07"
  }
];

export const mockReferrals = [
  {
    id: 1,
    studentName: "Amit Patel",
    studentEmail: "student1@gmail.com",
    alumniName: "Rahul Sharma",
    alumniEmail: "alumni1@gmail.com",
    company: "Google",
    status: "Approved",
    requestDate: "2026-06-07"
  }
];

export default mockUsers;