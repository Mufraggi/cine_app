import { describe, expect, it } from "@effect/vitest"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { PgLive } from "@template/database/Sql"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import { Effect, Option } from "effect"
import { ApiTaskWorkFlowService } from "../../../src/etl_movie_embedding/api_task/ApiTaskWorkflowService.js"

describe("ApiTaskWorkflowService", () => {
  it("should run the etl", async () => {
    const program = Effect.gen(function*() {
      const repo = yield* RowMovieApiRepository
      const service = yield* ApiTaskWorkFlowService
      const ids = yield* service.run()
      const maybeMovie = yield* repo.findById(ids[0])
      return Option.getOrThrow(maybeMovie)
    })

    const result = await Effect.runPromise(program.pipe(
      Effect.provide(ApiTaskWorkFlowService.Default),
      Effect.provide(ImdbClientHttp.InMemory),
      Effect.provide(Uuid.Default),
      Effect.provide(RowMovieApiRepository.Default),
      Effect.provide(PgLive)
    ))

    expect(result).toBeDefined()
    expect(result.payload.id).toBe("tt0000001")
    expect(result.payload.type).toBe("movie")
    expect(result.payload.primaryTitle).toBe("Mock Movie")
    expect(result.payload.originalTitle).toBe("Mock Movie Original")
  })
})
