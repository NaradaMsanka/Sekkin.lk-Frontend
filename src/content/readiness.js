export function getReadinessIssues(business) {
  const issues = [];
  for (const key of ['registeredName', 'supportPhone', 'supportEmail', 'postalAddress']) {
    if (!business[key]?.trim() || /REVIEW REQUIRED/i.test(business[key])) issues.push(`Confirm business.${key}`);
  }
  if (business.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.supportEmail)) issues.push('Provide a valid support email');
  for (const group of ['refund', 'shipping', 'privacy', 'terms']) {
    for (const [key, value] of Object.entries(business[group])) {
      if (typeof value !== 'string' || !value.trim() || /REVIEW REQUIRED/i.test(value)) issues.push(`Review ${group}.${key}`);
    }
  }
  for (const flag of ['contactsConfirmed', 'policiesApproved', 'catalogReviewed', 'paymentSafetyReviewed']) {
    if (business[flag] !== true) issues.push(`Owner/technical sign-off required: ${flag}`);
  }
  return issues;
}

export function getDraftContentIssues(pages) {
  const issues = [];
  for (const [route, page] of Object.entries(pages)) {
    if (/\bdrafts?\b|REVIEW REQUIRED/i.test(page.intro)) issues.push(`Approve final introduction: /${route}`);
    for (const section of page.sections) {
      if (section.body.some(text => /\bdrafts?\b|REVIEW REQUIRED/i.test(text))) issues.push(`Approve final policy text: /${route}#${section.id}`);
    }
  }
  return issues;
}
