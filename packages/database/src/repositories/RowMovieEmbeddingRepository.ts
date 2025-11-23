import { Model } from "@effect/sql"
import { Effect } from "effect"
import { RawMovieEmbeddingModel } from "../model/RawMovieEmbddingModel.js"

export class RowMovieEmbeddingRepository
  extends Effect.Service<RowMovieEmbeddingRepository>()("RowMovieEmbeddingRepository", {
    effect: Effect.gen(function*() {
      yield* Effect.log("")

      const repo = yield* Model.makeRepository(RawMovieEmbeddingModel, {
        tableName: "raw_movie_embedding",
        spanPrefix: "rawMovieEmbeddingRepository",
        idColumn: "id"
      })
      return {
        insert: repo.insert,
        findById: repo.findById
      }
    })
  })
{}
