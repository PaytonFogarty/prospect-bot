/**
 * Apply ICP filter rules to a list of profiles.
 * Rules have shape: { field, operator, value, required }
 * Operators: contains, equals, notContains
 */
function applyFilters(profiles, rules) {
  if (!rules || rules.length === 0) return profiles;

  return profiles.filter(profile => {
    return rules.every(rule => {
      const fieldValue = (profile[rule.field] || '').toString().toLowerCase();
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

      // If the rule is not required, a non-match is still okay
      return rule.required ? passes : true;
    });
  });
}

module.exports = { applyFilters };
