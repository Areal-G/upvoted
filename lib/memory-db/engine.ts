import { Prisma, type PrismaClient } from "@prisma/client";
import type { DMMF } from "@prisma/generator-helper";

// A PrismaClient-compatible database that lives in memory, driven by the schema's
// datamodel. It covers the query surface this app uses: find/create/update/upsert/
// delete with where, select, include, _count, orderBy, skip and take, plus count,
// groupBy and $transaction. Unsupported arguments throw instead of being ignored.

type Row = Record<string, unknown>;
type Args = Record<string, unknown>;
type Model = DMMF.Model;
type Field = DMMF.Field;
type Seed = (db: PrismaClient) => Promise<unknown>;

export type MemoryDatabase = {
  client: PrismaClient;
  // Empties every table, restarts the ID counters and runs the seed again
  reset: () => Promise<void>;
};

const SORT_DIRECTIONS = new Set(["asc", "desc"]);
const FILTER_OPERATORS = new Set([
  "equals",
  "in",
  "notIn",
  "not",
  "lt",
  "lte",
  "gt",
  "gte",
  "contains",
  "startsWith",
  "endsWith",
]);

function knownError(code: string, message: string) {
  return new Prisma.PrismaClientKnownRequestError(message, {
    code,
    clientVersion: Prisma.prismaVersion.client,
  });
}

function unsupported(what: string): never {
  throw new Error(`The in-memory database does not support ${what}`);
}

const isObject = (value: unknown): value is Args =>
  typeof value === "object" && value !== null && !(value instanceof Date) && !Array.isArray(value);

const copy = (value: unknown) => (value instanceof Date ? new Date(value) : value);

const sameValue = (a: unknown, b: unknown) =>
  a instanceof Date && b instanceof Date ? a.getTime() === b.getTime() : a === b;

const lowerFirst = (name: string) => name.charAt(0).toLowerCase() + name.slice(1);

export function createMemoryDatabase(
  datamodel: DMMF.Datamodel,
  options: { seed?: Seed } = {},
): MemoryDatabase {
  const models = new Map(datamodel.models.map((m) => [m.name, m]));
  const enums = new Map(datamodel.enums.map((e) => [e.name, e.values.map((v) => v.name)]));

  let tables = new Map<string, Row[]>(datamodel.models.map((m) => [m.name, []]));
  let counters = new Map<string, number>();

  const model = (name: string) => models.get(name)!;
  const table = (name: string) => tables.get(name)!;
  const field = (m: Model, name: string) => m.fields.find((f) => f.name === name);

  // ── IDs and defaults ─────────────────────────────────────────────────

  // Counter-based IDs, so every instance seeded the same way holds identical IDs.
  // cuid()s are 25 lowercase alphanumerics starting with "c", which keeps zod's
  // cuid and cuid2 validators happy.
  function nextId(m: Model, kind: string) {
    const n = (counters.get(m.name) ?? 0) + 1;
    counters.set(m.name, n);
    if (kind === "cuid") {
      const tag = m.name.toLowerCase().slice(0, 12);
      return `c${tag}${n.toString(36).padStart(24 - tag.length, "0")}`;
    }
    if (kind === "uuid") {
      return `00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;
    }
    if (kind === "autoincrement") return n;
    return unsupported(`@default(${kind}())`);
  }

  function defaultValue(m: Model, f: Field) {
    if (f.isUpdatedAt) return new Date();
    if (!f.hasDefaultValue) return f.isRequired ? undefined : null;
    const def = f.default;
    if (isObject(def) && "name" in def) {
      return def["name"] === "now" ? new Date() : nextId(m, String(def["name"]));
    }
    return def;
  }

  // ── Relations ────────────────────────────────────────────────────────

  // The foreign key always sits on one side of a relation. Returns the pairs of
  // [field on this row, field on the related row] that must be equal.
  function relationKeys(m: Model, f: Field): [string, string][] {
    if (f.relationFromFields?.length) {
      return f.relationFromFields.map((from, i) => [from, f.relationToFields![i]!]);
    }
    const back = model(f.type).fields.find(
      (b) => b.relationName === f.relationName && (b.type !== m.name || b.name !== f.name),
    );
    if (!back?.relationFromFields?.length) return unsupported(`relation ${m.name}.${f.name}`);
    return back.relationFromFields.map((from, i) => [back.relationToFields![i]!, from]);
  }

  function relatedRows(m: Model, row: Row, f: Field) {
    const keys = relationKeys(m, f);
    if (keys.some(([own]) => row[own] == null)) return [];
    return table(f.type).filter((other) =>
      keys.every(([own, rel]) => sameValue(other[rel], row[own])),
    );
  }

  // ── Filtering ────────────────────────────────────────────────────────

  function compoundUnique(m: Model, key: string) {
    if (m.primaryKey && (m.primaryKey.name ?? m.primaryKey.fields.join("_")) === key) {
      return m.primaryKey.fields;
    }
    return m.uniqueIndexes.find((u) => (u.name ?? u.fields.join("_")) === key)?.fields;
  }

  function matchesScalar(value: unknown, filter: unknown, f: Field): boolean {
    if (!isObject(filter)) return sameValue(value, filter);
    return Object.entries(filter).every(([op, arg]) => {
      if (arg === undefined) return true;
      if (!FILTER_OPERATORS.has(op)) return unsupported(`the "${op}" filter`);
      switch (op) {
        case "equals":
          return sameValue(value, arg);
        case "in":
          return (arg as unknown[]).some((a) => sameValue(value, a));
        case "notIn":
          return !(arg as unknown[]).some((a) => sameValue(value, a));
        case "not":
          return !matchesScalar(value, arg, f);
        case "contains":
          return typeof value === "string" && value.includes(String(arg));
        case "startsWith":
          return typeof value === "string" && value.startsWith(String(arg));
        case "endsWith":
          return typeof value === "string" && value.endsWith(String(arg));
        default: {
          if (value == null || arg == null) return false;
          const order = compareValues(value, arg, f);
          if (op === "lt") return order < 0;
          if (op === "lte") return order <= 0;
          if (op === "gt") return order > 0;
          return order >= 0;
        }
      }
    });
  }

  function matchesRelation(m: Model, row: Row, f: Field, filter: unknown): boolean {
    const related = relatedRows(m, row, f);
    const target = model(f.type);
    if (f.isList) {
      if (!isObject(filter)) return unsupported(`list relation filter on ${m.name}.${f.name}`);
      return Object.entries(filter).every(([op, where]) => {
        if (op === "some") return related.some((r) => matches(target, r, where));
        if (op === "every") return related.every((r) => matches(target, r, where));
        if (op === "none") return !related.some((r) => matches(target, r, where));
        return unsupported(`the "${op}" relation filter`);
      });
    }
    const one = related[0];
    if (filter === null) return !one;
    if (isObject(filter) && ("is" in filter || "isNot" in filter)) {
      if ("is" in filter)
        return filter["is"] === null ? !one : !!one && matches(target, one, filter["is"]);
      return filter["isNot"] === null ? !!one : !one || !matches(target, one, filter["isNot"]);
    }
    return !!one && matches(target, one, filter);
  }

  function matches(m: Model, row: Row, where: unknown): boolean {
    if (where === undefined) return true;
    if (!isObject(where)) return unsupported("a non-object where");
    return Object.entries(where).every(([key, filter]) => {
      if (filter === undefined) return true;
      if (key === "AND") return [filter].flat().every((w) => matches(m, row, w));
      if (key === "OR") return (filter as unknown[]).some((w) => matches(m, row, w));
      if (key === "NOT") return ![filter].flat().some((w) => matches(m, row, w));
      const f = field(m, key);
      if (f?.kind === "object") return matchesRelation(m, row, f, filter);
      if (f) return matchesScalar(row[key], filter, f);
      const fields = compoundUnique(m, key);
      if (!fields || !isObject(filter)) return unsupported(`where.${key} on ${m.name}`);
      return fields.every((name) => sameValue(row[name], filter[name]));
    });
  }

  // ── Ordering ─────────────────────────────────────────────────────────

  function compareValues(a: unknown, b: unknown, f: Field) {
    if (f.kind === "enum") {
      const values = enums.get(f.type)!;
      return values.indexOf(String(a)) - values.indexOf(String(b));
    }
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    if (typeof a === "string" && typeof b === "string") return a < b ? -1 : a > b ? 1 : 0;
    return Number(a) - Number(b);
  }

  // Sort key and direction for one orderBy entry, following relations as needed
  function sortKey(m: Model, row: Row, order: Args): { value: unknown; f: Field; dir: string } {
    const entries = Object.entries(order).filter(([, v]) => v !== undefined);
    if (entries.length !== 1) return unsupported("orderBy objects with several keys");
    const [key, spec] = entries[0]!;
    const f = field(m, key);
    if (!f) return unsupported(`orderBy.${key} on ${m.name}`);
    if (f.kind !== "object") {
      const dir = isObject(spec) ? spec["sort"] : spec;
      if (typeof dir !== "string" || !SORT_DIRECTIONS.has(dir)) {
        return unsupported(`orderBy.${key} = ${JSON.stringify(spec)}`);
      }
      return { value: row[key], f, dir };
    }
    if (!isObject(spec)) return unsupported(`orderBy.${key} on ${m.name}`);
    if (f.isList) {
      const dir = spec["_count"];
      if (typeof dir !== "string" || !SORT_DIRECTIONS.has(dir)) {
        return unsupported(`orderBy.${key} other than _count`);
      }
      const count = relatedRows(m, row, f).length;
      return { value: count, f: { ...f, kind: "scalar", type: "Int" }, dir };
    }
    const related = relatedRows(m, row, f)[0];
    return sortKey(model(f.type), related ?? {}, spec);
  }

  function sortRows(m: Model, rows: Row[], orderBy: unknown) {
    if (orderBy === undefined) return rows;
    const orders = [orderBy].flat() as Args[];
    // Array.prototype.sort is stable, so ties keep insertion order
    return [...rows].sort((a, b) => {
      for (const order of orders) {
        const ka = sortKey(m, a, order);
        const kb = sortKey(m, b, order);
        const desc = ka.dir === "desc";
        // Postgres puts NULLs last when ascending and first when descending
        if (ka.value == null || kb.value == null) {
          if (ka.value == null && kb.value == null) continue;
          return (ka.value == null ? 1 : -1) * (desc ? -1 : 1);
        }
        const diff = compareValues(ka.value, kb.value, ka.f);
        if (diff !== 0) return desc ? -diff : diff;
      }
      return 0;
    });
  }

  // ── Reading ──────────────────────────────────────────────────────────

  function query(m: Model, args: Args = {}, rows = table(m.name)) {
    for (const key of Object.keys(args)) {
      if (!["where", "orderBy", "skip", "take", "select", "include"].includes(key)) {
        unsupported(`the "${key}" argument`);
      }
    }
    const filtered = rows.filter((row) => matches(m, row, args["where"]));
    const sorted = sortRows(m, filtered, args["orderBy"]);
    const skip = (args["skip"] as number | undefined) ?? 0;
    const take = args["take"] as number | undefined;
    if (take !== undefined && take < 0) unsupported("a negative take");
    return sorted.slice(skip, take === undefined ? undefined : skip + take);
  }

  function countRelations(m: Model, row: Row, spec: unknown) {
    const counts: Row = {};
    const selected = isObject(spec) && isObject(spec["select"]) ? spec["select"] : undefined;
    const lists = m.fields.filter((f) => f.kind === "object" && f.isList);
    for (const f of lists) {
      const option = selected ? selected[f.name] : true;
      if (!option) continue;
      const where = isObject(option) ? option["where"] : undefined;
      counts[f.name] = relatedRows(m, row, f).filter((r) =>
        matches(model(f.type), r, where),
      ).length;
    }
    return counts;
  }

  function project(m: Model, row: Row, args: Args = {}): Row {
    const select = args["select"];
    const include = args["include"];
    if (select !== undefined && include !== undefined) unsupported("select and include together");
    const out: Row = {};
    if (!isObject(select)) {
      for (const f of m.fields) if (f.kind !== "object") out[f.name] = copy(row[f.name]);
    }
    const picks = isObject(select) ? select : isObject(include) ? include : {};
    for (const [key, option] of Object.entries(picks)) {
      if (!option) continue;
      if (key === "_count") {
        out[key] = countRelations(m, row, option);
        continue;
      }
      const f = field(m, key);
      if (!f) return unsupported(`selecting ${m.name}.${key}`);
      if (f.kind !== "object") {
        out[key] = copy(row[key]);
        continue;
      }
      const nested = isObject(option) ? option : {};
      const target = model(f.type);
      if (f.isList) {
        const { select: s, include: i, ...rest } = nested;
        const rows = query(target, rest, relatedRows(m, row, f));
        out[key] = rows.map((r) => project(target, r, { select: s, include: i }));
      } else {
        const related = relatedRows(m, row, f)[0];
        out[key] = related ? project(target, related, nested) : null;
      }
    }
    return out;
  }

  // ── Writing ──────────────────────────────────────────────────────────

  function uniqueSets(m: Model): readonly (readonly string[])[] {
    const sets: (readonly string[])[] = m.fields
      .filter((f) => f.isId || f.isUnique)
      .map((f) => [f.name]);
    if (m.primaryKey) sets.push(m.primaryKey.fields);
    return [...sets, ...m.uniqueFields];
  }

  function findConflict(m: Model, candidate: Row, self?: Row) {
    return uniqueSets(m).find((fields) =>
      table(m.name).some(
        (row) =>
          row !== self &&
          fields.every((name) => candidate[name] != null && sameValue(row[name], candidate[name])),
      ),
    );
  }

  function checkForeignKeys(m: Model, row: Row) {
    for (const f of m.fields) {
      if (f.kind !== "object" || !f.relationFromFields?.length) continue;
      if (f.relationFromFields.some((name) => row[name] == null)) continue;
      if (relatedRows(m, row, f).length === 0) {
        throw knownError("P2003", `Foreign key constraint violated on ${m.name}.${f.name}`);
      }
    }
  }

  function assignScalars(m: Model, row: Row, data: Args) {
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      const f = field(m, key);
      if (!f) return unsupported(`writing ${m.name}.${key}`);
      if (f.kind === "object") return unsupported(`nested writes (${m.name}.${key})`);
      if (!isObject(value)) {
        row[key] = copy(value);
        continue;
      }
      const [op, arg] = Object.entries(value)[0] ?? [];
      const current = Number(row[key]);
      if (op === "set") row[key] = copy(arg);
      else if (op === "increment") row[key] = current + Number(arg);
      else if (op === "decrement") row[key] = current - Number(arg);
      else return unsupported(`the "${op}" update operator`);
    }
  }

  function insert(m: Model, data: Args, skipDuplicates = false) {
    const row: Row = {};
    assignScalars(m, row, data);
    for (const f of m.fields) {
      if (f.kind === "object" || row[f.name] !== undefined) continue;
      const value = defaultValue(m, f);
      if (value === undefined) {
        throw new Prisma.PrismaClientValidationError(`Missing ${m.name}.${f.name}`, {
          clientVersion: Prisma.prismaVersion.client,
        });
      }
      row[f.name] = value;
    }
    const conflict = findConflict(m, row);
    if (conflict) {
      if (skipDuplicates) return null;
      throw knownError("P2002", `Unique constraint failed on ${m.name} (${conflict.join(", ")})`);
    }
    checkForeignKeys(m, row);
    table(m.name).push(row);
    return row;
  }

  function update(m: Model, row: Row, data: Args) {
    const next = { ...row };
    assignScalars(m, next, data);
    for (const f of m.fields)
      if (f.isUpdatedAt && data[f.name] === undefined) next[f.name] = new Date();
    const conflict = findConflict(m, next, row);
    if (conflict) {
      throw knownError("P2002", `Unique constraint failed on ${m.name} (${conflict.join(", ")})`);
    }
    checkForeignKeys(m, next);
    Object.assign(row, next);
    return row;
  }

  // Applies each dependent relation's onDelete rule, then removes the row
  function remove(m: Model, row: Row) {
    for (const dependent of models.values()) {
      for (const f of dependent.fields) {
        if (f.type !== m.name || !f.relationFromFields?.length) continue;
        const keys = f.relationFromFields.map((from, i) => [from, f.relationToFields![i]!]);
        const children = table(dependent.name).filter((child) =>
          keys.every(([from, to]) => sameValue(child[from!], row[to!])),
        );
        if (children.length === 0) continue;
        const required = f.relationFromFields.some((name) => field(dependent, name)!.isRequired);
        const action = f.relationOnDelete ?? (required ? "Restrict" : "SetNull");
        if (action === "Cascade") children.forEach((child) => remove(dependent, child));
        else if (action === "SetNull")
          children.forEach((child) => keys.forEach(([from]) => (child[from!] = null)));
        else
          throw knownError(
            "P2003",
            `Foreign key constraint violated on ${dependent.name}.${f.name}`,
          );
      }
    }
    tables.set(
      m.name,
      table(m.name).filter((r) => r !== row),
    );
  }

  function findUniqueRow(m: Model, where: unknown) {
    return table(m.name).find((row) => matches(m, row, where));
  }

  function mustFind(m: Model, where: unknown, operation: string) {
    const row = findUniqueRow(m, where);
    if (!row) throw knownError("P2025", `No ${m.name} record found for ${operation}`);
    return row;
  }

  const output = (args: Args) => ({ select: args["select"], include: args["include"] });

  // ── Client ───────────────────────────────────────────────────────────

  function delegate(m: Model): Record<string, (args: Args) => unknown> {
    const findMany = (args: Args = {}) => {
      const { select, include, ...rest } = args;
      return query(m, rest).map((row) => project(m, row, { select, include }));
    };
    const findFirst = (args: Args = {}) => findMany({ ...args, take: 1 })[0] ?? null;
    const findUnique = (args: Args) => {
      const row = findUniqueRow(m, args["where"]);
      return row ? project(m, row, output(args)) : null;
    };
    const orThrow = (find: (args: Args) => Row | null) => (args: Args) => {
      const row = find(args);
      if (!row) throw knownError("P2025", `No ${m.name} record found`);
      return row;
    };

    return {
      findUnique,
      findUniqueOrThrow: orThrow(findUnique),
      findFirst,
      findFirstOrThrow: orThrow(findFirst),
      findMany,
      count: (args: Args = {}) => query(m, { where: args["where"] }).length,
      groupBy: (args: Args) => {
        const by = [args["by"]].flat() as string[];
        const groups = new Map<string, Row[]>();
        for (const row of query(m, { where: args["where"] })) {
          const key = JSON.stringify(by.map((name) => row[name]));
          groups.set(key, [...(groups.get(key) ?? []), row]);
        }
        return [...groups.values()].map((rows) => {
          const group: Row = Object.fromEntries(by.map((name) => [name, copy(rows[0]![name])]));
          if (isObject(args["_count"])) {
            group["_count"] = Object.fromEntries(
              Object.keys(args["_count"]).map((name) => [
                name,
                name === "_all" ? rows.length : rows.filter((r) => r[name] != null).length,
              ]),
            );
          }
          return group;
        });
      },
      create: (args: Args) => project(m, insert(m, args["data"] as Args)!, output(args)),
      createMany: (args: Args) => ({
        count: [args["data"]]
          .flat()
          .filter((data) => insert(m, data as Args, args["skipDuplicates"] === true)).length,
      }),
      createManyAndReturn: (args: Args) =>
        ([args["data"]].flat() as Args[])
          .map((data) => insert(m, data, args["skipDuplicates"] === true))
          .filter((row): row is Row => row !== null)
          .map((row) => project(m, row, output(args))),
      update: (args: Args) =>
        project(
          m,
          update(m, mustFind(m, args["where"], "update"), args["data"] as Args),
          output(args),
        ),
      updateMany: (args: Args) => {
        const rows = query(m, { where: args["where"] });
        rows.forEach((row) => update(m, row, args["data"] as Args));
        return { count: rows.length };
      },
      upsert: (args: Args) => {
        const existing = findUniqueRow(m, args["where"]);
        const row = existing
          ? update(m, existing, args["update"] as Args)
          : insert(m, args["create"] as Args)!;
        return project(m, row, output(args));
      },
      delete: (args: Args) => {
        const row = mustFind(m, args["where"], "delete");
        const result = project(m, row, output(args));
        remove(m, row);
        return result;
      },
      deleteMany: (args: Args = {}) => {
        const rows = query(m, { where: args["where"] });
        rows.forEach((row) => remove(m, row));
        return { count: rows.length };
      },
    };
  }

  // Every public call waits for the seed; the seed itself uses the ungated client
  function buildClient(gate: () => Promise<void>) {
    const client: Record<string, unknown> = {
      $connect: async () => {},
      $disconnect: async () => {},
      $transaction: async (arg: unknown) => {
        if (Array.isArray(arg)) return Promise.all(arg);
        if (typeof arg !== "function") return unsupported("this $transaction form");
        await gate();
        const snapshot = { tables: structuredClone(tables), counters: new Map(counters) };
        try {
          return await arg(client);
        } catch (error) {
          ({ tables, counters } = snapshot);
          throw error;
        }
      },
    };
    for (const m of models.values()) {
      client[lowerFirst(m.name)] = Object.fromEntries(
        Object.entries(delegate(m)).map(([name, operation]) => [
          name,
          async (args: Args) => {
            await gate();
            return operation(args);
          },
        ]),
      );
    }
    return client as unknown as PrismaClient;
  }

  let ready = Promise.resolve();
  const seedClient = buildClient(() => Promise.resolve());

  // Resets run one after another: clearing the tables while an earlier seed is
  // still writing would let both seeds insert the same rows.
  const reset = () => {
    ready = ready
      .catch(() => {})
      .then(async () => {
        tables = new Map(datamodel.models.map((m) => [m.name, []]));
        counters = new Map();
        await options.seed?.(seedClient);
      });
    return ready;
  };

  void reset();
  return { client: buildClient(() => ready), reset };
}
