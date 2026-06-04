import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firstNamesMale = [
  'Aarav', 'Amit', 'Rohan', 'Vikram', 'Aditya', 'Rahul', 'Sandeep', 'Kunal', 'Manish', 'Varun',
  'Gaurav', 'Abhinav', 'Vivek', 'Rajat', 'Siddharth', 'Akshay', 'Dev', 'Akash', 'Rohit', 'Karan',
  'Aniket', 'Shivam', 'Arjun', 'Rishabh', 'Kabir', 'Ishaan', 'Naman', 'Yash', 'Parth', 'Pranav',
  'Tushar', 'Mayank', 'Harsh', 'Pratyush', 'Shashank', 'Animesh', 'Karthik', 'Sameer', 'Puneet', 'Alok',
  'Siddhesh', 'Ganesh', 'Nikhil', 'Ayush', 'Rudra', 'Vihan', 'Ranveer', 'Ishwar', 'Madhur', 'Chinmay'
];

const firstNamesFemale = [
  'Anjali', 'Sneha', 'Priya', 'Riya', 'Aditi', 'Pooja', 'Neha', 'Tanvi', 'Shreya', 'Kriti',
  'Shruti', 'Meera', 'Payal', 'Divya', 'Aishwarya', 'Isha', 'Kavya', 'Ritu', 'Sakshi', 'Nikita',
  'Ridhima', 'Naina', 'Avani', 'Diya', 'Snehal', 'Richa', 'Priyanka', 'Shalini', 'Sonali', 'Mansi',
  'Radhika', 'Nisha', 'Aastha', 'Prisha', 'Komal', 'Garima', 'Bhavna', 'Vaidehi', 'Swati', 'Preeti',
  'Kiran', 'Nidhi', 'Simran', 'Ishita', 'Tanuja', 'Ananya', 'Rhea', 'Kriti', 'Barkha', 'Deepika'
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Iyer', 'Reddy', 'Mehta', 'Patel', 'Joshi', 'Nair', 'Deshmukh',
  'Kapoor', 'Sen', 'Banerjee', 'Chatterjee', 'Rao', 'Singh', 'Kumar', 'Mishra', 'Trivedi', 'Shah',
  'Chaudhary', 'Patil', 'Saxena', 'Malhotra', 'Bhatia', 'Dubey', 'Pandey', 'Grover', 'Shetty', 'Pillai'
];

const cities = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur'];
const religions = ['Hindu', 'Sikh', 'Jain', 'Christian'];
const castesByReligion = {
  'Hindu': ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Khatri', 'Nair', 'Reddy', 'Maratha'],
  'Sikh': ['Jat Sikh', 'Khatri Sikh', 'Arora Sikh'],
  'Jain': ['Oswal', 'Agarwal Jain', 'Khandelwal'],
  'Christian': ['Roman Catholic', 'Syrian Christian', 'Protestant']
};

const gotras = ['Kashyap', 'Bharadwaj', 'Vashishta', 'Sandilya', 'Gautam', 'Haritas', 'Kaundinya', 'Atri', 'Angiras'];
const rashis = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const nakshatras = ['Aswini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushya', 'Aslesha', 'Magha', 'Poorvaphalguni', 'Uttaraphalguni', 'Hasta', 'Chitra', 'Swati', 'Visakha', 'Anuradha', 'Jyeshta', 'Moola', 'Poorvashada', 'Uttarashada', 'Sravana', 'Dhanishta', 'Satabhisha', 'Poorvabhadrapada', 'Uttarabhadrapada', 'Revati'];

const colleges = [
  'IIT Bombay', 'BITS Pilani', 'IIT Delhi', 'SRCC Delhi', 'St. Xavier\'s College',
  'NIT Trichy', 'VIT Vellore', 'Christ University', 'Symbiosis Pune', 'RV College of Engineering',
  'Delhi Technological University', 'IIM Ahmedabad (MBA)', 'ISB Hyderabad (MBA)', 'Grant Medical College'
];

const degrees = ['B.Tech Computer Science', 'B.Com Honours', 'BBA', 'MBBS', 'M.Tech', 'MBA', 'BA Economics', 'LLB'];
const companies = ['Google', 'Amazon', 'Microsoft', 'TCS', 'McKinsey', 'Ernst & Young', 'Tata Motors', 'HDFC Bank', 'Infosys', 'Razorpay', 'Flipkart', 'Zomato', 'Deloitte'];
const designations = ['Software Engineer', 'Senior Software Engineer', 'Product Manager', 'Consultant', 'Financial Analyst', 'Marketing Lead', 'Data Scientist', 'HR Specialist', 'Design Lead', 'Medical Practitioner'];

const diets = ['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Jain', 'Vegan'];
const familyTypes = ['Nuclear', 'Joint'];
const familyValues = ['Traditional', 'Moderate', 'Liberal'];

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProfile(gender, id, forceAge = null) {
  const firstName = gender === 'Male' ? getRandomElement(firstNamesMale) : getRandomElement(firstNamesFemale);
  const lastName = getRandomElement(lastNames);
  
  // Date of Birth & Age
  const age = forceAge || getRandomInt(23, 35);
  const birthYear = 2026 - age;
  const birthMonth = String(getRandomInt(1, 12)).padStart(2, '0');
  const birthDay = String(getRandomInt(1, 28)).padStart(2, '0');
  const dob = `${birthYear}-${birthMonth}-${birthDay}`;

  // Height (Men 165-188 cm, Women 150-175 cm)
  const heightCm = gender === 'Male' ? getRandomInt(168, 188) : getRandomInt(152, 175);
  const feet = Math.floor(heightCm / 30.48);
  const inches = Math.round((heightCm % 30.48) / 2.54);
  const heightStr = `${feet}'${inches}"`;

  // Religion & Caste
  const religion = getRandomElement(religions);
  const caste = getRandomElement(castesByReligion[religion] || ['General']);
  
  // Gotra (Only relevant for Hindu/Jain)
  const gotraStr = (religion === 'Hindu' || religion === 'Jain') ? getRandomElement(gotras) : 'N/A';

  // Income: 6 LPA to 50 LPA
  const income = getRandomInt(6, 60) * 100000;

  // Siblings string
  const sibCount = getRandomInt(0, 3);
  let siblings = 'None';
  if (sibCount > 0) {
    const sibType = getRandomElement(['brother', 'sister', 'younger sister', 'elder brother']);
    siblings = `${sibCount} ${sibType}${sibCount > 1 ? 's' : ''}`;
  }

  return {
    id,
    firstName,
    lastName,
    gender,
    dob,
    age,
    city: getRandomElement(cities),
    country: 'India',
    height: heightStr,
    heightCm,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+91 ${getRandomInt(70000, 99999)} ${getRandomInt(10000, 99999)}`,
    education: {
      college: getRandomElement(colleges),
      degree: getRandomElement(degrees)
    },
    career: {
      company: getRandomElement(companies),
      designation: getRandomElement(designations),
      income
    },
    family: {
      siblings,
      familyType: getRandomElement(familyTypes),
      familyValues: getRandomElement(familyValues),
      religion,
      caste,
      gotra: gotraStr,
      fatherOccupation: getRandomElement(['Retired Government Officer', 'Businessman', 'Doctor', 'Engineer', 'Professor', 'Architect']),
      motherOccupation: getRandomElement(['Homemaker', 'School Teacher', 'Govt Employee', 'Bank Officer', 'Consultant'])
    },
    lifestyle: {
      diet: getRandomElement(diets),
      languages: ['English', getRandomElement(['Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada'])]
    },
    preferences: {
      wantKids: getRandomElement(['Yes', 'No', 'Maybe']),
      openToRelocate: getRandomElement(['Yes', 'No', 'Maybe']),
      openToPets: getRandomElement(['Yes', 'No', 'Maybe']),
      manglik: getRandomElement(['No', 'Yes', 'Anshik (Partial)']),
      rashi: getRandomElement(rashis),
      nakshatra: getRandomElement(nakshatras)
    },
    status: 'Searching',
    notes: []
  };
}

export function generateSeedData() {
  const matchmakers = [
    {
      id: 'm1',
      username: 'admin',
      password: 'password123',
      name: 'Simran Alag'
    }
  ];

  // Generate 10 assigned clients (5 males, 5 females)
  const customers = [
    { ...generateProfile('Male', 'cust1', 29), firstName: 'Vikram', lastName: 'Aditya', city: 'Bangalore', status: 'Searching' },
    { ...generateProfile('Female', 'cust2', 27), firstName: 'Sneha', lastName: 'Mehta', city: 'Mumbai', status: 'Onboarding' },
    { ...generateProfile('Male', 'cust3', 31), firstName: 'Kabir', lastName: 'Kapoor', city: 'Delhi NCR', status: 'Matching' },
    { ...generateProfile('Female', 'cust4', 28), firstName: 'Aditi', lastName: 'Sharma', city: 'Bangalore', status: 'Searching' },
    { ...generateProfile('Male', 'cust5', 33), firstName: 'Rahul', lastName: 'Reddy', city: 'Hyderabad', status: 'Searching' },
    { ...generateProfile('Female', 'cust6', 26), firstName: 'Priya', lastName: 'Nair', city: 'Chennai', status: 'Onboarding' },
    { ...generateProfile('Male', 'cust7', 28), firstName: 'Rohan', lastName: 'Verma', city: 'Pune', status: 'Engaged' },
    { ...generateProfile('Female', 'cust8', 30), firstName: 'Anjali', lastName: 'Gupta', city: 'Mumbai', status: 'Matching' },
    { ...generateProfile('Male', 'cust9', 32), firstName: 'Siddharth', lastName: 'Sen', city: 'Kolkata', status: 'Married' },
    { ...generateProfile('Female', 'cust10', 25), firstName: 'Tanvi', lastName: 'Shah', city: 'Ahmedabad', status: 'Searching' }
  ];

  // Assign standard notes to clients
  customers[0].notes = [
    { id: 'n1', date: '2026-06-01T10:00:00Z', author: 'Simran Alag', text: 'Spoke with Vikram today. He wants an educated partner who is career-oriented and open to living in Bangalore. Prefers vegetarian diet.' },
    { id: 'n2', date: '2026-06-03T15:30:00Z', author: 'Simran Alag', text: 'Vikram updated his preference: open to matching with partners who are slightly younger or the same age.' }
  ];
  customers[1].notes = [
    { id: 'n3', date: '2026-06-02T11:00:00Z', author: 'Simran Alag', text: 'Sneha completed onboarding. Her parents are very keen on matching gotra & rashi compatibility. Horoscopes must be checked before sending matches.' }
  ];
  customers[3].notes = [
    { id: 'n4', date: '2026-06-04T12:00:00Z', author: 'Simran Alag', text: 'Aditi is a tech lead. She prefers a match who works in the tech/business sector in Bangalore or is willing to relocate to Bangalore.' }
  ];

  // Generate match pool (60 males, 60 females) - 120 total dummy profiles
  const pool = [];
  for (let i = 1; i <= 60; i++) {
    pool.push(generateProfile('Male', `pool_m_${i}`));
  }
  for (let i = 1; i <= 60; i++) {
    pool.push(generateProfile('Female', `pool_f_${i}`));
  }

  // Activity logs and sent matches record
  const matches = [];

  return {
    matchmakers,
    customers,
    pool,
    matches
  };
}

// Seed executable when run directly
const dbPath = path.join(__dirname, 'db.json');
const seedData = generateSeedData();
fs.writeFileSync(dbPath, JSON.stringify(seedData, null, 2));
console.log(`Successfully generated seed data to ${dbPath}`);
console.log(`- Matchmakers: ${seedData.matchmakers.length}`);
console.log(`- Active Clients: ${seedData.customers.length}`);
console.log(`- Match Pool Profiles: ${seedData.pool.length}`);
