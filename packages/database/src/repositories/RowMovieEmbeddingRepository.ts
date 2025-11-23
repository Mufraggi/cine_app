import { Model } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { Effect } from "effect"
import { RawMovieEmbeddingModel } from "../model/RawMovieEmbddingModel.js"
import { PgLive } from "../Sql.js"

export class RawMovieEmbeddingRepository
  extends Effect.Service<RawMovieEmbeddingRepository>()("RawMovieEmbeddingRepository", {
    effect: Effect.gen(function*() {
      yield* Effect.log("")
      const sql = yield* PgClient.PgClient

      const repo = yield* Model.makeRepository(RawMovieEmbeddingModel, {
        tableName: "raw_movie_embedding",
        spanPrefix: "rawMovieEmbeddingRepository",
        idColumn: "id"
      })
      
      const customInsert = (data: RawMovieEmbeddingModel) => {
        const embeddingStr = `[${data.embedding.join(",")}]`
        return sql`
          INSERT INTO raw_movie_embedding (id, raw_movie_api_id, embedding, created_at, updated_at)
          VALUES (${data.id}, ${data.rawMovieApiId}, ${embeddingStr}::vector, ${data.createdAt}, ${data.updatedAt})
        `
      }
      
      return {
        insert: (data: RawMovieEmbeddingModel) => customInsert(data),
        findById: repo.findById
      }
    }),
    dependencies: [PgLive]
  })
{}

