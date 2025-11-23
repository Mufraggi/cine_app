import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { Effect, Layer } from "effect"
import * as path from "node:path"
import { Plot } from "../../domain/src/imdb/ImdbResponseApiType.js"
import { VectorLlmClient } from "./VectorLlmClient.js"

const appLayer = VectorLlmClient.InMemory.pipe(
  Layer.provide(PlatformConfigProvider.layerDotEnv(path.join(process.cwd(), ".env"))),
  Layer.provide(NodeContext.layer)
)

const main = Effect.gen(function*(_) {
  const imdbClientHttp = yield* VectorLlmClient
  const response = yield* imdbClientHttp.vectorizeFilmdescription(
    Plot.make(
      "Forced to balance their roles as heroes with the strength of their family bond, the Fantastic Four must defend Earth from a ravenous space god called Galactus and his enigmatic herald, the Silver Surfer."
    )
  )
  console.log("IMDB API Response:", response)
}).pipe(Effect.provide(appLayer))

Effect.runPromise(main).catch((error) => {
  console.error("Error occurred:", error)
  process.exit(1)
})
