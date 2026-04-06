const NAMES = [
  "Mike Johnson", "Sarah Williams", "David Martinez", "Jennifer Brown",
  "Robert Taylor", "Lisa Anderson", "James Wilson", "Maria Garcia",
  "Chris Thompson", "Amanda Davis", "Kevin Robinson", "Michelle Clark",
];

const CITIES = [
  "Austin", "Houston", "Dallas", "San Antonio", "Fort Worth",
  "Phoenix", "Denver", "Nashville", "Charlotte", "Tampa",
];

const STATES = [
  "TX", "TX", "TX", "TX", "TX",
  "AZ", "CO", "TN", "NC", "FL",
];

const JOB_TYPES = [
  "Residential Garage", "Commercial Floor", "Patio/Outdoor",
  "Basement Floor", "Workshop Floor", "Showroom Floor",
];

const SERVICE_TYPES = [
  "Full Flake Epoxy", "Metallic Epoxy", "Solid Color Epoxy",
  "Polyaspartic Coating", "Epoxy + Polyaspartic", "Quartz Epoxy",
];

const MESSAGES = [
  "Interested in getting a quote for my 2-car garage.",
  "Looking to redo our warehouse floor. About 3000 sqft.",
  "Need pricing for a residential garage floor coating.",
  "Want to update our showroom floors before the grand opening.",
  null,
  "How soon can you start? We need this done within 2 weeks.",
  null,
  "Saw your work on a neighbor's garage. Would love a similar look.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateDemoLead() {
  const cityIndex = Math.floor(Math.random() * CITIES.length);
  return {
    name: pick(NAMES),
    phone: `(${Math.floor(200 + Math.random() * 800)}) ${Math.floor(200 + Math.random() * 800)}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`,
    email: null,
    city: CITIES[cityIndex],
    state: STATES[cityIndex],
    job_type: pick(JOB_TYPES),
    service_type: pick(SERVICE_TYPES),
    message: pick(MESSAGES),
  };
}
