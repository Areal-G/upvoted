// Sign-in for the seeded board owner. The defaults are for a local database only:
// set SEED_OWNER_EMAIL and SEED_OWNER_PASSWORD before seeding any shared or deployed database.
export const SEED_OWNER = {
  // Lowercase, as sign-in lowercases the identifier
  email: (process.env["SEED_OWNER_EMAIL"] || "owner@upvoted.local").toLowerCase(),
  password: process.env["SEED_OWNER_PASSWORD"] || "upvoted-local-only",
};
