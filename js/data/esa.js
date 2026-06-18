const ESA_DATA = {
  ontario: {
    name: "Ontario",
    act: "Employment Standards Act, 2000",
    source: "https://www.ontario.ca/document/your-guide-employment-standards-act-0/termination-employment",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      if (years < 1) return 1;
      if (years < 2) return 2;
      if (years < 3) return 3;
      if (years < 4) return 4;
      if (years < 5) return 5;
      if (years < 6) return 6;
      if (years < 7) return 7;
      return 8;
    },
    getSeveranceWeeks(years) {
      if (years < 5) return 0;
      return Math.min(Math.ceil(years), 26);
    },
    severanceNote:
      "Severance Pay applies only if your employer's annual payroll is ≥ $2.5M, or 50+ employees were laid off in the last 6 months.",
  },

  bc: {
    name: "British Columbia",
    act: "Employment Standards Act (RSBC 1996)",
    source: "https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards/termination",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      if (years < 1) return 1;
      if (years < 3) return 2;
      if (years < 4) return 3;
      if (years < 5) return 4;
      if (years < 6) return 5;
      if (years < 7) return 6;
      if (years < 8) return 7;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  alberta: {
    name: "Alberta",
    act: "Employment Standards Code (RSA 2000)",
    source: "https://www.alberta.ca/termination-pay",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 90 / 365) return 0;
      if (years < 2) return 1;
      if (years < 4) return 2;
      if (years < 6) return 4;
      if (years < 8) return 5;
      if (years < 10) return 6;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  quebec: {
    name: "Quebec",
    act: "Act Respecting Labour Standards (RLRQ c N-1.1)",
    source: "https://www.cnesst.gouv.qc.ca/en/working-conditions/end-of-employment/notice-of-termination",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      if (years < 1) return 1;
      if (years < 5) return 2;
      if (years < 10) return 4;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  manitoba: {
    name: "Manitoba",
    act: "Employment Standards Code (CCSM c E110)",
    source: "https://www.gov.mb.ca/labour/standards/doc,termination-and-notice,factsheet.html",
    minServiceMonths: 1,
    getTerminationWeeks(years) {
      if (years < 30 / 365) return 0;
      if (years < 1) return 1;
      if (years < 3) return 2;
      if (years < 5) return 4;
      if (years < 10) return 6;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  saskatchewan: {
    name: "Saskatchewan",
    act: "Saskatchewan Employment Act (SS 2013)",
    source: "https://www.saskatchewan.ca/business/employment-standards/termination-of-employment",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 13 / 52) return 0;
      if (years < 1) return 1;
      if (years < 3) return 2;
      if (years < 5) return 4;
      if (years < 10) return 6;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  nova_scotia: {
    name: "Nova Scotia",
    act: "Labour Standards Code (RSNS 1989)",
    source: "https://novascotia.ca/lae/employmentrights/terminationpay.asp",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      if (years < 2) return 1;
      if (years < 5) return 2;
      if (years < 10) return 4;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  new_brunswick: {
    name: "New Brunswick",
    act: "Employment Standards Act (SNB 1982)",
    source: "https://www2.gnb.ca/content/gnb/en/departments/post-secondary_education_training_and_labour/labour/content/employment_standards.html",
    minServiceMonths: 6,
    getTerminationWeeks(years) {
      if (years < 0.5) return 0;
      if (years < 5) return 2;
      return 4 + Math.floor(years - 5);
    },
    getSeveranceWeeks() { return 0; },
    note: "New Brunswick notice accumulates after 5 years of service. Verify the maximum with the official source.",
  },

  pei: {
    name: "Prince Edward Island",
    act: "Employment Standards Act (RSPEI 1988)",
    source: "https://www.princeedwardisland.ca/en/information/economic-development-innovation-and-trade/employment-standards-termination",
    minServiceMonths: 6,
    getTerminationWeeks(years) {
      if (years < 0.5) return 0;
      if (years < 1) return 1;
      if (years < 5) return 2;
      if (years < 10) return 4;
      if (years < 15) return 6;
      return 8;
    },
    getSeveranceWeeks() { return 0; },
  },

  newfoundland: {
    name: "Newfoundland & Labrador",
    act: "Labour Standards Act (RSNL 1990)",
    source: "https://www.gov.nl.ca/ecc/labour/labour-standards/",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      if (years < 2) return 1;
      if (years < 5) return 2;
      if (years < 10) return 3;
      if (years < 15) return 4;
      return 6;
    },
    getSeveranceWeeks() { return 0; },
  },

  yukon: {
    name: "Yukon",
    act: "Employment Standards Act (RSY 2002, c 72)",
    source: "https://yukon.ca/en/doing-business/employer-responsibilities/understand-employment-standards",
    minServiceMonths: 6,
    getTerminationWeeks(years) {
      if (years < 0.5) return 0;
      if (years < 1)   return 1;
      if (years < 3)   return 2;
      if (years < 5)   return 3;
      if (years < 10)  return 4;
      return 6;
    },
    getSeveranceWeeks() { return 0; },
    note: "Yukon minimum notice is based on length of service. Common law entitlements often significantly exceed the statutory minimum.",
  },

  northwest_territories: {
    name: "Northwest Territories",
    act: "Employment Standards Act (SNWT 2007, c 13)",
    source: "https://www.justice.gov.nt.ca/en/legislation/employment-standards/",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 90 / 365) return 0;
      if (years < 1)  return 1;
      if (years < 3)  return 2;
      if (years < 5)  return 3;
      if (years < 10) return 4;
      return 6;
    },
    getSeveranceWeeks() { return 0; },
    note: "Northwest Territories termination notice scales with length of service. Consult official sources for most current tables.",
  },

  nunavut: {
    name: "Nunavut",
    act: "Labour Standards Act (RSNWT 1988, as adopted by Nunavut)",
    source: "https://nu-lsco.ca/",
    minServiceMonths: 1,
    getTerminationWeeks(years) {
      if (years < 30 / 365) return 0;
      if (years < 1)  return 1;
      if (years < 3)  return 2;
      if (years < 5)  return 3;
      if (years < 10) return 4;
      return 6;
    },
    getSeveranceWeeks() { return 0; },
    note: "Nunavut labour standards are administered by the Labour Standards Office of Nunavut. Verify current tables at nu-lsco.ca.",
  },

  federal: {
    name: "Federal Employee (Canada Labour Code)",
    act: "Canada Labour Code (RSC 1985), Part III",
    source: "https://www.canada.ca/en/employment-social-development/services/labour-standards/reports/termination.html",
    minServiceMonths: 3,
    getTerminationWeeks(years) {
      if (years < 3 / 12) return 0;
      return 2;
    },
    getSeveranceWeeks() { return 0; },
    note: "Federal employees with 12+ months of service also have unjust dismissal protection — entitlements can far exceed the 2-week statutory minimum. Applies to banks, airlines, telecoms, railways, and interprovincial transport.",
  },
};
