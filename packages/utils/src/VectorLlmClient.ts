import { OpenAiClient } from "@effect/ai-openai"
import { NodeHttpClient } from "@effect/platform-node"
import { Config, Effect, Layer } from "effect"
import type { Plot } from "../../domain/src/imdb/ImdbResponseApiType.js"

export class VectorLlmClient extends Effect.Service<VectorLlmClient>()("VectorLlmClient", {
  effect: Effect.gen(function*() {
    yield* Effect.log("VectorLlmClient")

    const OpenAi = OpenAiClient.layerConfig({ apiKey: Config.redacted("OPENAI_API_KEY") })
    const OpenAiWithHttp = Layer.provide(OpenAi, NodeHttpClient.layerUndici)

    const vectorizeFilmdescription = (plot: Plot) =>
      Effect.gen(function*() {
        const client = yield* OpenAiClient.OpenAiClient

        const res = yield* client.createEmbedding({
          model: "text-embedding-3-small",
          input: plot,
          encoding_format: "float",
          dimensions: 1536
        })
        return res.data[0].embedding
      }).pipe(Effect.provide(OpenAiWithHttp))

    return { vectorizeFilmdescription }
  })
}) {
  static InMemory = Layer.succeed(VectorLlmClient, {
    vectorizeFilmdescription: (plot: Plot) => {
      const arr: Array<number> = Array.from({ length: 1536 }, () => Math.random())
      return Effect.succeed(arr)
    },
    _tag: "VectorLlmClient"
  })
}
