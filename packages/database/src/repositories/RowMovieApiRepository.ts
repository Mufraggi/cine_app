import { Model } from "@effect/sql"
import { Effect } from "effect"
import { RawMovieApiModel } from "../model/RawMovieApiModel.js"

export class RowMovieApiRepository extends Effect.Service<RowMovieApiRepository>()("RowMovieApiRepository", {
  effect: Effect.gen(function*() {
    yield* Effect.log("")

    const repo = yield* Model.makeRepository(RawMovieApiModel, {
      tableName: "raw_movie_api",
      spanPrefix: "rawMovieApiRepository",
      idColumn: "id"
    })
    return {
      insert: repo.insert,
      findById: repo.findById
    }
  })
}) {}
