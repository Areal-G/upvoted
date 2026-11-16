// Prisma generator that writes the schema's datamodel (models, fields, defaults,
// unique constraints and relations) to JSON for the in-memory database. The
// generated client only ships a reduced version of it at runtime.
import { writeFile } from "node:fs/promises";
import generatorHelper from "@prisma/generator-helper";

generatorHelper.generatorHandler({
  onManifest: () => ({
    prettyName: "In-memory database datamodel",
    defaultOutput: "./datamodel.generated.json",
  }),
  onGenerate: async ({ dmmf, generator }) => {
    await writeFile(generator.output.value, `${JSON.stringify(dmmf.datamodel, null, 2)}\n`);
  },
});
