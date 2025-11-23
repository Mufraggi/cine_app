import { Model } from "@effect/sql"
import { Effect } from "effect"
import { RawMovieEmbeddingModel } from "../model/RawMovieEmbddingModel.js"
import { PgLive } from "../Sql.js"

export class RawMovieEmbeddingRepository
  extends Effect.Service<RawMovieEmbeddingRepository>()("RawMovieEmbeddingRepository", {
    effect: Effect.gen(function*() {
      yield* Effect.log("")

      const repo = yield* Model.makeRepository(RawMovieEmbeddingModel, {
        tableName: "raw_movie_embedding",
        spanPrefix: "rawMovieEmbeddingRepository",
        idColumn: "id"
      })
      return {
        insert: repo.insertVoid,
        findById: repo.findById
      }
    }),
    dependencies: [PgLive]
  })
{}
