import { randomUUID } from "crypto"
import { Effect } from "effect"

export class Uuid extends Effect.Service<Uuid>()("Uuid", {
  succeed: {
    generate: Effect.sync(() => randomUUID())
  }
}) {}
