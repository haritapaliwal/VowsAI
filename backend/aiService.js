import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper to initialize the OpenAI client.
 * Returns null if no key is set.
 */
function getOpenAIClient() {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
}

/**
 * Helper to initialize the Groq client.
 * Returns null if no key is set.
 */
function getGroqClient() {
  if (process.env.GROQ_API_KEY) {
    return new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return null;
}

/**
 * Generates match explanation using the three-tier AI pipeline.
 */
export async function generateMatchExplanation(customer, match, compatibilityData) {
  const prompt = `
You are the VowsAI Matchmaking Intelligence Engine. Write a concise, professional 2-3 sentence match summary evaluating the compatibility between our client, ${customer.firstName} ${customer.lastName} (${customer.age}, ${customer.gender}, ${customer.career.designation} at ${customer.career.company}), and potential match, ${match.firstName} ${match.lastName} (${match.age}, ${match.gender}, ${match.career.designation} at ${match.career.company}).

Compatibility Score: ${compatibilityData.score}%
Key Highlights: ${compatibilityData.highlights.join(', ')}
Key Gaps: ${compatibilityData.gaps.join(', ') || 'None'}

Evaluate their alignment on career, lifestyle, and values in a warm, insightful, matchmaker-like tone. Focus on why they fit and how they can navigate any gaps.
`;

  // Tier 1: OpenAI
  const openaiClient = getOpenAIClient();
  if (openaiClient) {
    try {
      console.log('AI Service: Querying OpenAI (Tier 1) for match explanation...');
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Service: OpenAI failed, falling back to Groq...', error.message);
    }
  }

  // Tier 2: Groq
  const groqClient = getGroqClient();
  if (groqClient) {
    try {
      console.log('AI Service: Querying Groq (Tier 2) for match explanation...');
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Service: Groq failed, falling back to Local Simulator...', error.message);
    }
  }

  // Tier 3: Local Smart NLP Simulator
  console.log('AI Service: Using Local Smart NLP Simulator (Tier 3) for match explanation.');
  return simulateExplanation(customer, match, compatibilityData);
}

/**
 * Generates matchmaker intro email using the three-tier AI pipeline.
 */
export async function generateIntroEmail(customer, match, compatibilityData) {
  const prompt = `
You are Simran Alag, Senior Matchmaker at VowsAI. Write a personalized, warm, and highly professional introduction email (approx. 100-120 words) to our client, ${customer.firstName}.
Introduce ${match.firstName} as a high-potential match we've selected for them.
Highlight their compatibility on: ${compatibilityData.highlights.slice(0, 3).join(', ')}.
Mention their occupation (${match.career.designation} at ${match.career.company}) and location (${match.city}).
Address how their values/lifestyle (e.g., diet: ${match.lifestyle.diet}) align with ${customer.firstName}'s preferences.
End with a call to action asking if they would like to review ${match.firstName}'s full biodata and schedule a brief call.
Keep the email structured and ready to send. Do NOT include a subject line, pre-headers, or placeholders. Sign off simply as:
"Warm regards,
Simran Alag
Senior Matchmaker, VowsAI"
`;

  // Tier 1: OpenAI
  const openaiClient = getOpenAIClient();
  if (openaiClient) {
    try {
      console.log('AI Service: Querying OpenAI (Tier 1) for intro email...');
      const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Service: OpenAI failed, falling back to Groq...', error.message);
    }
  }

  // Tier 2: Groq
  const groqClient = getGroqClient();
  if (groqClient) {
    try {
      console.log('AI Service: Querying Groq (Tier 2) for intro email...');
      const response = await groqClient.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('AI Service: Groq failed, falling back to Local Simulator...', error.message);
    }
  }

  // Tier 3: Local Smart NLP Simulator
  console.log('AI Service: Using Local Smart NLP Simulator (Tier 3) for intro email.');
  return simulateIntroEmail(customer, match, compatibilityData);
}

/**
 * Fallback match explanation generator
 */
function simulateExplanation(customer, match, compatibilityData) {
  const score = compatibilityData.score;
  const matchDesignation = match.career.designation;
  const matchCompany = match.career.company;
  const customerDesignation = customer.career.designation;
  const customerCompany = customer.career.company;
  const customerCity = customer.city;
  const matchCity = match.city;

  let introduction = `${customer.firstName} and ${match.firstName} show an impressive alignment of ${score}%. `;
  
  let careerSegment = '';
  if (customer.gender === 'Female') {
    careerSegment = `As a ${customerDesignation}, ${customer.firstName} will appreciate ${match.firstName}'s background as a ${matchDesignation} at ${matchCompany}, representing excellent professional and educational synergy. `;
  } else {
    careerSegment = `Their respective professions as a ${customerDesignation} at ${customerCompany} and a ${matchDesignation} at ${matchCompany} establish a balanced lifestyle and solid long-term stability. `;
  }

  let culturalSegment = `Cultural and lifestyle compatibility is highly robust, fueled by their shared ${customer.family.religion} background and matching dietary preferences (${customer.lifestyle.diet}). `;
  if (customer.family.religion !== match.family.religion) {
    culturalSegment = `While they come from different cultural backgrounds (${customer.family.religion} and ${match.family.religion}), their progressive values and shared lifestyle goals suggest they will adapt seamlessly. `;
  }

  let locationSegment = '';
  if (customerCity === matchCity) {
    locationSegment = `Additionally, being based in ${customerCity} eliminates any geographical hurdles, facilitating easy initial meetings.`;
  } else {
    locationSegment = `The current distance between ${customerCity} and ${matchCity} is a minor gap, but both indicate flexibility in relocation preferences, indicating a strong commitment to finding the right match.`;
  }

  return `${introduction}${careerSegment}${culturalSegment}${locationSegment}`;
}

/**
 * Fallback intro email generator
 */
function simulateIntroEmail(customer, match, compatibilityData) {
  const matchName = match.firstName;
  const matchDesignation = match.career.designation;
  const matchCompany = match.career.company;
  const matchCollege = match.education.college;
  const matchCity = match.city;
  const diet = match.lifestyle.diet.toLowerCase();

  return `Dear ${customer.firstName},

I hope this email finds you well!

I have found a high-potential match that aligns wonderfully with your preferences. Meet ${matchName}, who is currently working as a ${matchDesignation} at ${matchCompany} in ${matchCity}. ${matchName} holds a degree from ${matchCollege} and is described by family as a warm, progressive individual.

We noticed excellent compatibility between you two, particularly regarding your shared dietary preferences (both being ${diet}s), compatible lifestyle interests, and aligned family values. Additionally, ${matchName} matches your expectations on height and age criteria perfectly.

I think there is great potential here. Would you like me to share ${matchName}'s full biodata with you, or shall we schedule a quick 5-minute call to discuss this profile?

Warm regards,

Simran Alag
Senior Matchmaker, VowsAI`;
}
