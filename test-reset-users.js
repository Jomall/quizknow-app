const demoUsers = [
  {
    id: '1',
    email: 'student@lms.com',
    name: 'Demo Student',
    password: 'student123',
    role: 'student',
    enrolledCourses: ['1', '2'],
    createdCourses: [],
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'instructor@lms.com',
    name: 'Demo Instructor',
    password: 'instructor123',
    role: 'instructor',
    enrolledCourses: [],
    createdCourses: ['1', '2'],
    createdAt: new Date(),
    isApproved: true,
  },
  {
    id: '3',
    email: 'admin@lms.com',
    name: 'Demo Admin',
    password: 'admin123',
    role: 'admin',
    enrolledCourses: [],
    createdCourses: [],
    createdAt: new Date(),
  },
];

localStorage.setItem('tec_net_solutions_quizknow_users', JSON.stringify(demoUsers));
console.log('Demo users reset in localStorage');
