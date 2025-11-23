import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { PgClient } from "@effect/sql-pg"
import { Config, Effect, identity, Layer, Redacted, String } from "effect"
import * as path from "node:path"
import pgTypes from "pg-types"

import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

pgTypes.setTypeParser(1082, identity)
pgTypes.setTypeParser(1114, identity)
pgTypes.setTypeParser(1184, identity)

export const PgLive = Layer.unwrapEffect(Effect.gen(function*() {
  const database = yield* Config.redacted("DB_HOST")
  const username = yield* Config.redacted("DB_USER")
  const port = yield* Config.redacted("DB_PORT")
  const password = yield* Config.redacted("DB_PWD")
  const dbName = yield* Config.redacted("DB_NAME")

  const url = Redacted.make(
    `postgres://${Redacted.value(username)}:${Redacted.value(password)}@${Redacted.value(database)}:${
      Redacted.value(port)
    }/${Redacted.value(dbName)}`
  )
  return PgClient.layer({
    url,
    maxConnections: 10,
    transformQueryNames: String.camelToSnake,
    transformResultNames: String.snakeToCamel,
    types: pgTypes
  })
})).pipe(
  Layer.provide(PlatformConfigProvider.layerDotEnv(path.join(__dirname, "..", "..", "..", ".env"))),
  Layer.provide(NodeContext.layer)
)
