/**
 * Map ICP rule fields to Lusha profile data paths.
 */
function getFieldValue(profile, field) {
  switch (field) {
    case 'currentTitle':
      return profile.jobTitle || profile.currentTitle || '';
    case 'companyName':
      return profile.company?.name || profile.companyName || '';
    case 'location':
      return [profile.city, profile.state, profile.country].filter(Boolean).join(' ');
    case 'industry':
      return profile.company?.industry || profile.industry || '';
    case 'seniority':
      return profile.seniority || '';
    default:
      return profile[field] || '';
  }
}

/**
 * Apply ICP filter rules to a list of profiles.
 * Rules have shape: { field, operator, value, required }
 * Operators: contains (case insensitive), equals (case insensitive), notContains
 * Returns only profiles that pass all required rules.
 */
function applyFilters(profiles, rules) {
  if (!rules || rules.length === 0) return profiles;

  return profiles.filter(profile => {
    return rules.every(rule => {
      const fieldValue = getFieldValue(profile, rule.field).toString().toLowerCase();
      const ruleValue = (rule.value || '').toString().toLowerCase();

      let passes;
      switch (rule.operator) {
        case 'contains':
          passes = fieldValue.includes(ruleValue);
          break;
        case 'equals':
          passes = fieldValue === ruleValue;
          break;
        case 'notContains':
          passes = !fieldValue.includes(ruleValue);
          break;
        default:
          passes = true;
      }

      return rule.required ? passes : true;
    });
  });
}

module.exports = { applyFilters };
