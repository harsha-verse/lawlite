// Sample data for testing the application
export const sampleUsers = [
  {
    id: '1',
    email: 'user@test.com',
    type: 'user' as const,
    name: 'John Doe',
    verified: true
  },
  {
    id: '2',
    email: 'lawyer@test.com',
    type: 'lawyer' as const,
    name: 'Adv. Jane Smith',
    licenseNumber: 'BAR/2020/12345',
    specialization: 'Family Law',
    experience: 8,
    consultationFee: 2500,
    verified: true,
    rating: 4.8,
    reviews: []
  }
];

// Initialize sample data in localStorage if not exists
export const initializeSampleData = () => {
  const existingUsers = localStorage.getItem('lawlite_users');
  if (!existingUsers) {
    localStorage.setItem('lawlite_users', JSON.stringify(sampleUsers));
  }
};