import type { DMMF } from "@prisma/generator-helper";
import { seedDemoWorkspace } from "@/lib/demo/seed";
import { createMemoryDatabase, type MemoryDatabase } from "@/lib/memory-db/engine";
import datamodel from "@/lib/memory-db/datamodel.generated.json";

// The demo runs without a database. Each server instance keeps its own in-memory
// copy, seeded with the same demo workspace (and the same IDs) on startup.
const globalForDb = globalThis as unknown as { memoryDb?: MemoryDatabase };

const memoryDb = (globalForDb.memoryDb ??= createMemoryDatabase(
  datamodel as unknown as DMMF.Datamodel,
  { seed: seedDemoWorkspace },
));

export const db = memoryDb.client;

// Restores the demo workspace to its seeded state
export const resetDemoWorkspace = () => memoryDb.reset();
