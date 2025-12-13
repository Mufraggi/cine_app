import { Effect, pipe } from "effect"

import { SqlClient } from "@effect/sql"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import type { IMdbData } from "@template/domain/imdb/ImdbResponseApi"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { Uuid } from "@template/domain/Uuid"
import { ImdbClientHttp } from "@template/utils/ImdbClientHttp"
import { ApiTaskWorkflowError } from "./ApiTaskWorkflow.js"

export class ApiTaskWorkFlowService extends Effect.Service<ApiTaskWorkFlowService>()("ApiTaskWorkflowService", {
  effect: Effect.gen(function*() {
    yield* Effect.log("ApiTaskWorkFlowService")
    const rawMovieRepository = yield* RowMovieApiRepository
    const clientHttp = yield* ImdbClientHttp
    const uuid = yield* Uuid
    const sql = yield* SqlClient.SqlClient

    const insertMovie = (movie: IMdbData) =>
      uuid.generate.pipe(
        Effect.flatMap((id) =>
          rawMovieRepository
            .insert({
              id: RawMovieApiId.make(id),
              payload: movie,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .pipe(Effect.zipRight(Effect.succeed(RawMovieApiId.make(id))), Effect.orDie, sql.withTransaction)
        )
      )

    const run = () =>
      pipe(
        clientHttp.callImdbApi(),
        Effect.flatMap(({ titles: movies }) => {
          const inserts = movies.map((movie) => insertMovie(movie))
          return Effect.all(inserts)
        }),
        Effect.catchAll((err) => new ApiTaskWorkflowError({ message: `Failed to run ApiTaskWorkFlowService: ${err}` }))
      )

    return {
      run
    }
  })
}) {}
