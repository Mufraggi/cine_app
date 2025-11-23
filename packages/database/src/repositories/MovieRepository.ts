import { Model } from "@effect/sql"
import { Effect } from "effect"
import { MovieModel } from "../model/MovieModel.js"
import { PgLive } from "../Sql.js"

export class MovieRepository extends Effect.Service<MovieRepository>()("MovieRepository", {
  effect: Effect.gen(function*() {
    yield* Effect.log("")

    const repo = yield* Model.makeRepository(MovieModel, {
      tableName: "movie",
      spanPrefix: "movieRepository",
      idColumn: "id"
    })
    return {
      insert: repo.insertVoid,
      findById: repo.findById
    }
  }),
  dependencies: [PgLive]
}) {}
