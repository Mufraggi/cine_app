import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import * as path from "node:path"
import { ImdbClientHttp } from "./ImdbClientHttp.js"

const appLayer = ImdbClientHttp.Default.pipe(
  Layer.provide(PlatformConfigProvider.layerDotEnv(path.join(process.cwd(), ".env"))),
  Layer.provide(NodeContext.layer)
)

const main = Effect.gen(function*(_) {
  const imdbClientHttp = yield* ImdbClientHttp
  const response = yield* imdbClientHttp.callImdbApi()
  console.log("IMDB API Response:", response)
}).pipe(Effect.provide(appLayer))

Effect.runPromise(main).catch((error) => {
  console.error("Error occurred:", error)
  process.exit(1)
})
