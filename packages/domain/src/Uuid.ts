import { Effect } from "effect"
import * as Api from "uuid"

export class Uuid extends Effect.Service<Uuid>()("Uuid", {
  succeed: {
    generate: Effect.sync(() => Api.v7())
  }
}) {
}
