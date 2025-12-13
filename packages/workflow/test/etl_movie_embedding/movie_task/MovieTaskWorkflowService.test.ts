import { describe, expect, it } from "@effect/vitest"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { PgLive } from "@template/database/Sql"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import { Effect, Option } from "effect"
import { MovieRepository } from "../../../../database/src/repositories/MovieRepository.js"
import { RawMovieEmbeddingRepository } from "../../../../database/src/repositories/RowMovieEmbeddingRepository.js"
import { VectorLlmClient } from "../../../../utils/src/VectorLlmClient.js"
import { ApiTaskWorkFlowService } from "../../../src/etl_movie_embedding/api_task/ApiTaskWorkflowService.js"
import { MovieTaskWorkflowService } from "../../../src/etl_movie_embedding/movie_task/MovieTaskWorkflowService.js"
import { VectorTaskWorkflowService } from "../../../src/etl_movie_embedding/vector_task/VectorTaskWorkflowService.js"

describe("movieTaskWorkflowService", () => {
  it("should run the etl", async () => {
    const program = Effect.gen(function*() {
      const serviceApi = yield* ApiTaskWorkFlowService
      const movieRepository = yield* MovieRepository

      const serviceVector = yield* VectorTaskWorkflowService
      const service = yield* MovieTaskWorkflowService

      const res = yield* serviceApi.run()
      const id = yield* serviceVector.run(res[0])
      const idMovie = yield* service.run(id)

      const maybeMovie = yield* movieRepository.findById(idMovie)
      return Option.getOrThrow(maybeMovie)
    })

    const result = await Effect.runPromise(program.pipe(
      Effect.provide(ApiTaskWorkFlowService.Default),
      Effect.provide(VectorTaskWorkflowService.Default),
      Effect.provide(ImdbClientHttp.InMemory),
      Effect.provide(VectorLlmClient.InMemory),
      Effect.provide(MovieTaskWorkflowService.Default),
      Effect.provide(Uuid.Default),
      Effect.provide(RowMovieApiRepository.Default),
      Effect.provide(RawMovieEmbeddingRepository.Default),
      Effect.provide(MovieRepository.Default),
      Effect.provide(PgLive)
    ))

    expect(result).toBeDefined()
    expect(result.embedding.length).toBe(1536)
  })
})
