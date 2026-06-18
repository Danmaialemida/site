// Common law ranges derived from Canadian case law (Bardal factors).
// Source: CanLII case analysis, McCarthy Tétrault trend data, 2023–2025 decisions.
// Returns a range [min, max] in months — never a single point estimate.

const CL_TABLES = {
  entry: [
    { maxYears: 1,        min: 3,  max: 4  },
    { maxYears: 3,        min: 3,  max: 6  },
    { maxYears: 5,        min: 5,  max: 9  },
    { maxYears: 10,       min: 8,  max: 14 },
    { maxYears: 15,       min: 12, max: 18 },
    { maxYears: 20,       min: 15, max: 22 },
    { maxYears: Infinity, min: 18, max: 24 },
  ],
  professional: [
    { maxYears: 1,        min: 3,  max: 6  },
    { maxYears: 3,        min: 4,  max: 8  },
    { maxYears: 5,        min: 6,  max: 12 },
    { maxYears: 10,       min: 10, max: 16 },
    { maxYears: 15,       min: 14, max: 20 },
    { maxYears: 20,       min: 18, max: 24 },
    { maxYears: Infinity, min: 20, max: 24 },
  ],
  manager: [
    { maxYears: 1,        min: 4,  max: 8  },
    { maxYears: 3,        min: 6,  max: 12 },
    { maxYears: 5,        min: 9,  max: 15 },
    { maxYears: 10,       min: 12, max: 18 },
    { maxYears: 15,       min: 15, max: 22 },
    { maxYears: 20,       min: 18, max: 24 },
    { maxYears: Infinity, min: 20, max: 24 },
  ],
  executive: [
    { maxYears: 0.5,      min: 4,  max: 6  },
    { maxYears: 1,        min: 5,  max: 8  },
    { maxYears: 3,        min: 8,  max: 14 },
    { maxYears: 5,        min: 12, max: 18 },
    { maxYears: 10,       min: 14, max: 22 },
    { maxYears: 15,       min: 18, max: 24 },
    { maxYears: Infinity, min: 20, max: 24 },
  ],
};

// Age shifts the result within (and slightly beyond) the base range.
// Older employees face harder reemployment → courts award more notice.
function getAgeAdjustment(age) {
  if (age < 30) return -1;
  if (age < 40) return  0;
  if (age < 50) return  1;
  if (age < 55) return  2;
  if (age < 60) return  3;
  return 4;
}

function getCommonLawRange(position, years, age) {
  const table = CL_TABLES[position];
  if (!table) return { min: 3, max: 6 };

  const row = table.find(r => years < r.maxYears) || table[table.length - 1];
  const adj = getAgeAdjustment(age);

  const min = Math.max(2,  row.min + adj);
  const max = Math.min(24, row.max + adj);

  return { min: Math.min(min, max - 1), max };
}
