import { describe, expect, it } from "@effect/vitest"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { EmbeddingMovie, RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Uuid } from "@template/domain/Uuid"
import { Effect } from "effect"
import { RawMovieEmbeddingModel } from "../../src/model/RawMovieEmbddingModel.js"
import { RawMovieEmbeddingRepository } from "../../src/repositories/RowMovieEmbeddingRepository.js"
import { PgLive } from "../../src/Sql.js"

describe("RawMovieEmbedingRepository", () => {
  it("should succeed of create rawMovieEmbeding", async () => {
    const arr: Array<number> = Array.from({ length: 1536 }, () => Math.random())
    const program = Effect.gen(function*() {
      const uuid = yield* Uuid
      const rawMovieEmbeddingRepository = yield* RawMovieEmbeddingRepository

      const id = yield* uuid.generate
      const rawMovieApiId = yield* uuid.generate
      const data = new RawMovieEmbeddingModel({
        id: RawMovieEmbeddingId.make(id),
        rawMovieApiId: RawMovieApiId.make(rawMovieApiId),
        embedding: EmbeddingMovie.make(arr),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      yield* rawMovieEmbeddingRepository.insert(data)
      return yield* (yield* rawMovieEmbeddingRepository.findById(RawMovieEmbeddingId.make(id)))
    })

    const result = await Effect.runPromise(program.pipe(
      Effect.provide(Uuid.Default),
      Effect.provide(RawMovieEmbeddingRepository.Default),
      Effect.provide(PgLive)
    ))
    console.log(result.embedding)
    // PostgreSQL stores vectors as float32, so we check length and approximate values
    expect(result.embedding).toHaveLength(1536)
    expect(result.embedding[0]).toBeCloseTo(arr[0], 5)
  })
})
