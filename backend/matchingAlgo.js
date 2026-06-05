/**
 * Calculates matching score and breakdown for a customer against a potential match.
 * @param {Object} customer - The active client profile
 * @param {Object} match - The potential match profile from the pool
 * @returns {Object|null} Match result containing compatibility score, matching highlights, gaps, and breakdown.
 */
export function calculateMatchCompatibility(customer, match) {
  // 1. Basic Validation: Must be opposite genders
  if (customer.gender === match.gender) {
    return null;
  }

  let score = 0;
  let maxPossibleScore = 100;
  const highlights = [];
  const gaps = [];
  const breakdown = {};

  // --- Astrological Gotra Check (Traditional Hindu Rule) ---
  // Same Gotra marriages are traditionally avoided (paternal lineage)
  let gotraConflict = false;
  if (
    customer.family.religion === 'Hindu' &&
    match.family.religion === 'Hindu' &&
    customer.family.gotra &&
    match.family.gotra &&
    customer.family.gotra !== 'N/A' &&
    match.family.gotra !== 'N/A' &&
    customer.family.gotra.toLowerCase() === match.family.gotra.toLowerCase()
  ) {
    gotraConflict = true;
    gaps.push(`Same Gotra (${customer.family.gotra}) - Traditionally avoided`);
  }

  // --- Gender-Specific Criteria ---
  if (customer.gender === 'Male') {
    // 1. Age: Younger women preferred
    let ageScore = 0;
    const ageDiff = customer.age - match.age;
    if (ageDiff > 0) {
      ageScore = 25;
      highlights.push(`Age: She is ${ageDiff} year${ageDiff > 1 ? 's' : ''} younger`);
    } else if (ageDiff === 0) {
      ageScore = 15;
      highlights.push('Age: Same age compatibility');
    } else {
      ageScore = 5;
      gaps.push(`Age: She is older by ${Math.abs(ageDiff)} year${Math.abs(ageDiff) > 1 ? 's' : ''}`);
    }
    score += ageScore;
    breakdown.age = { score: ageScore, max: 25, label: 'Age Preference' };

    // 2. Income: Earn less (traditional rule requested)
    let incomeScore = 0;
    if (match.career.income < customer.career.income) {
      incomeScore = 25;
      highlights.push('Income: Complementary income structure');
    } else {
      incomeScore = 10;
      gaps.push('Income: She earns equal to or more');
    }
    score += incomeScore;
    breakdown.income = { score: incomeScore, max: 25, label: 'Income Alignment' };

    // 3. Height: Shorter women preferred
    let heightScore = 0;
    if (match.heightCm < customer.heightCm) {
      heightScore = 25;
      const heightDiff = Math.round((customer.heightCm - match.heightCm) / 2.54);
      highlights.push(`Height: She is shorter by ${heightDiff} inches`);
    } else {
      heightScore = 10;
      gaps.push('Height: She is taller or same height');
    }
    score += heightScore;
    breakdown.height = { score: heightScore, max: 25, label: 'Height Compatibility' };

    // 4. Views on Kids
    let kidsScore = 0;
    if (customer.preferences.wantKids === match.preferences.wantKids) {
      kidsScore = 25;
      highlights.push(`Family Plans: Both agree on children (${customer.preferences.wantKids})`);
    } else if (
      customer.preferences.wantKids === 'Maybe' ||
      match.preferences.wantKids === 'Maybe'
    ) {
      kidsScore = 15;
      highlights.push('Family Plans: Open-ended views on children');
    } else {
      kidsScore = 0;
      gaps.push(`Family Plans: Diverging views on children (${customer.preferences.wantKids} vs ${match.preferences.wantKids})`);
    }
    score += kidsScore;
    breakdown.kids = { score: kidsScore, max: 25, label: 'Children Preference' };

  } else {
    // Customer is Female matching with Male Candidates
    // 1. Profession Compatibility
    let profScore = 0;
    const clientJob = customer.career.designation.toLowerCase();
    const matchJob = match.career.designation.toLowerCase();
    const isClientTech = clientJob.includes('software') || clientJob.includes('developer') || clientJob.includes('product') || clientJob.includes('data');
    const isMatchTech = matchJob.includes('software') || matchJob.includes('developer') || matchJob.includes('product') || matchJob.includes('data');
    
    if (isClientTech && isMatchTech) {
      profScore = 20;
      highlights.push('Profession: Shared tech ecosystem career compatibility');
    } else if (customer.career.company === match.career.company) {
      profScore = 20;
      highlights.push(`Profession: Work at the same company (${customer.career.company})`);
    } else {
      profScore = 12;
      highlights.push(`Profession: ${customer.career.designation} & ${match.career.designation}`);
    }
    score += profScore;
    breakdown.profession = { score: profScore, max: 20, label: 'Career Synergy' };

    // 2. Values Compatibility
    let valuesScore = 0;
    if (customer.family.familyValues === match.family.familyValues) {
      valuesScore = 20;
      highlights.push(`Values: Shared ${customer.family.familyValues} family mindset`);
    } else if (
      (customer.family.familyValues === 'Moderate' && match.family.familyValues !== 'Moderate') ||
      (match.family.familyValues === 'Moderate' && customer.family.familyValues !== 'Moderate')
    ) {
      valuesScore = 12;
      highlights.push('Values: Complementary value systems (Moderate & other)');
    } else {
      valuesScore = 5;
      gaps.push(`Values: Values gap (${customer.family.familyValues} vs ${match.family.familyValues})`);
    }
    score += valuesScore;
    breakdown.values = { score: valuesScore, max: 20, label: 'Family Values' };

    // 3. Relocation Preferences
    let relocateScore = 0;
    if (customer.preferences.openToRelocate === match.preferences.openToRelocate) {
      relocateScore = 20;
      if (customer.preferences.openToRelocate !== 'No') {
        highlights.push(`Relocation: Both open to relocating (${customer.preferences.openToRelocate})`);
      } else {
        highlights.push('Relocation: Both prefer staying in their current cities');
      }
    } else if (
      customer.preferences.openToRelocate === 'Yes' ||
      match.preferences.openToRelocate === 'Yes' ||
      customer.preferences.openToRelocate === 'Maybe' ||
      match.preferences.openToRelocate === 'Maybe'
    ) {
      relocateScore = 15;
      highlights.push('Relocation: Flexible location preferences');
    } else {
      relocateScore = 5;
      gaps.push('Relocation: Location flexibility mismatch');
    }
    score += relocateScore;
    breakdown.relocation = { score: relocateScore, max: 20, label: 'Relocation Flex' };

    // 4. Height: Man should be taller
    let heightScore = 0;
    if (match.heightCm > customer.heightCm) {
      heightScore = 20;
      const heightDiff = Math.round((match.heightCm - customer.heightCm) / 2.54);
      highlights.push(`Height: He is taller by ${heightDiff} inches`);
    } else {
      heightScore = 8;
      gaps.push('Height: He is shorter or same height');
    }
    score += heightScore;
    breakdown.height = { score: heightScore, max: 20, label: 'Height Preference' };

    // 5. Income: Man's income is equal to or higher
    let incomeScore = 0;
    if (match.career.income >= customer.career.income) {
      incomeScore = 20;
      highlights.push('Income: He has stable / equal-or-higher income');
    } else {
      incomeScore = 8;
      gaps.push('Income: He earns less than her');
    }
    score += incomeScore;
    breakdown.income = { score: incomeScore, max: 20, label: 'Financial Compatibility' };
  }

  // --- General Cultural & Lifestyle Bonuses (Shared between both) ---
  let bonusScore = 0;
  let maxBonus = 30; // We cap bonus to keep score calculations clean

  // 1. City / Location Match
  if (customer.city === match.city) {
    bonusScore += 10;
    highlights.push(`Location: Both are based in ${customer.city}`);
  } else {
    gaps.push(`Location: Long distance (${customer.city} to ${match.city})`);
  }

  // 2. Diet Match
  if (customer.lifestyle.diet === match.lifestyle.diet) {
    bonusScore += 8;
    highlights.push(`Diet: Perfect culinary match (both ${customer.lifestyle.diet})`);
  } else {
    // Vegetarians prefer not matching with Non-Vegetarians
    if (customer.lifestyle.diet === 'Vegetarian' || customer.lifestyle.diet === 'Jain') {
      if (match.lifestyle.diet === 'Non-Vegetarian') {
        gaps.push(`Dietary Conflict: Client is ${customer.lifestyle.diet}, Match is Non-Vegetarian`);
      }
    }
  }

  // 3. Religion and Caste Match
  if (customer.family.religion === match.family.religion) {
    bonusScore += 7;
    if (customer.family.caste === match.family.caste) {
      bonusScore += 5;
      highlights.push(`Cultural: Same community (${customer.family.religion} - ${customer.family.caste})`);
    } else {
      highlights.push(`Cultural: Same religion (${customer.family.religion})`);
    }
  } else {
    gaps.push(`Inter-religion Match: ${customer.family.religion} and ${match.family.religion}`);
  }

  // 4. Manglik Match
  if (customer.preferences.manglik === match.preferences.manglik) {
    bonusScore += 5;
    if (customer.preferences.manglik === 'Yes') {
      highlights.push('Astrology: Manglik matching Manglik (ideal astrological alignment)');
    } else {
      highlights.push('Astrology: Both are Non-Manglik');
    }
  } else if (
    (customer.preferences.manglik === 'Yes' && match.preferences.manglik === 'No') ||
    (customer.preferences.manglik === 'No' && match.preferences.manglik === 'Yes')
  ) {
    gaps.push('Astrology: Manglik & Non-Manglik combination (requires remedies)');
  }

  score += Math.min(bonusScore, maxBonus);
  breakdown.bonuses = { score: Math.min(bonusScore, maxBonus), max: maxBonus, label: 'Cultural & Lifestyle Boosts' };

  // Adjust score for Gotra conflict
  if (gotraConflict) {
    score = Math.max(score - 15, 0);
  }

  // Final normalization to percentage (clamped between 0 and 100)
  const finalPercentage = Math.max(0, Math.min(Math.round(score), 100));

  return {
    profile: match,
    score: finalPercentage,
    highlights,
    gaps,
    breakdown,
    gotraConflict
  };
}

/**
 * Ranks all profiles in the pool for a given customer.
 * @param {Object} customer - The active client profile
 * @param {Array} pool - The dummy profiles pool
 * @returns {Array} List of matched profiles sorted by compatibility score descending.
 */
export function rankMatches(customer, pool) {
  const ranked = [];
  for (const match of pool) {
    const res = calculateMatchCompatibility(customer, match);
    if (res) {
      ranked.push(res);
    }
  }
  return ranked.sort((a, b) => b.score - a.score);
}
