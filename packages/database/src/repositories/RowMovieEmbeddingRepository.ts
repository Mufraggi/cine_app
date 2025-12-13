import { Model, SqlSchema } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { Effect, pipe } from "effect"
import { RawMovieApiId } from "../../../domain/src/rawMovieApi/RawMovieApiType.js"
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

      const customUpdate = (
        rawMovieApiId: RawMovieApiId,
        embedding: Array<number>,
        updatedAt: Date
      ) => {
        const embeddingStr = `[${embedding.join(",")}]`

        return sql`
    UPDATE raw_movie_embedding 
    SET 
      embedding = ${embeddingStr}::vector,
      updated_at = ${updatedAt}
    WHERE raw_movie_api_id = ${rawMovieApiId}
  `
      }

      const findByRawMovieApiIdSchema = SqlSchema.findOne({
        Request: RawMovieApiId,
        Result: RawMovieEmbeddingModel,
        execute(id) {
          return sql`
            SELECT
               *
              
            FROM raw_movie_embedding ucwa 
            WHERE raw_movie_api_id = ${id}
          `
        }
      })

      const findByRawMovieApiId = (id: RawMovieApiId) =>
        pipe(
          findByRawMovieApiIdSchema(id),
          Effect.orDie,
          Effect.withSpan("RawMovieEmbeddingRepository.findByRawMovieApiId")
        )

      return {
        insert: (data: RawMovieEmbeddingModel) => customInsert(data),
        findById: repo.findById,
        update: customUpdate,
        findByRawMovieApiId
      }
    }),
    dependencies: [PgLive]
  })
{}
