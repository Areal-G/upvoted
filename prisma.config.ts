import { defineConfig } from "prisma/config";

// The demo has no database: Prisma only generates the client types and the
// datamodel for the in-memory database (see prisma/schema.prisma).
export default defineConfig({
  schema: "prisma/schema.prisma",
});
