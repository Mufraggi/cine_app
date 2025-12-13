import { Model, SqlSchema } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { ImdbId } from "@template/domain/imdb/ImdbResponseApiType"
import { Effect, pipe } from "effect"
import { MovieModel } from "../model/MovieModel.js"
import { PgLive } from "../Sql.js"

export class MovieRepository extends Effect.Service<MovieRepository>()("MovieRepository", {
  effect: Effect.gen(function*() {
    yield* Effect.log("")
    const sql = yield* PgClient.PgClient

    const repo = yield* Model.makeRepository(MovieModel, {
      tableName: "movie",
      spanPrefix: "movieRepository",
      idColumn: "id"
    })
    const findByImdbIdSchema = SqlSchema.findOne({
      Request: ImdbId,
      Result: MovieModel,
      execute: (id) => {
        return sql` SELECT * from movie where imdb_id = ${id}
    `
      }
    })

    const findByImdbId = (id: ImdbId) =>
      pipe(
        findByImdbIdSchema(id),
        Effect.orDie,
        Effect.withSpan("MovieRepository.findByImdbId")
      )

    return {
      insert: repo.insertVoid,
      findById: repo.findById,
      update: repo.updateVoid,
      findByImdbId
    }
  }),
  dependencies: [PgLive]
}) {}
