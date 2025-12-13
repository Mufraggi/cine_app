import { Model, SqlSchema } from "@effect/sql"
import { PgClient } from "@effect/sql-pg"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Effect, pipe, Schema } from "effect"
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

      // Schema pour l'insert
      const insertSchema = SqlSchema.void({
        Request: Schema.Struct({
          id: Schema.String,
          rawMovieApiId: RawMovieApiId,
          embedding: Schema.Array(Schema.Number),
          createdAt: Schema.Date,
          updatedAt: Schema.Date
        }),

        execute: (request) => {
          const embeddingStr = `[${request.embedding.join(",")}]`
          return sql`
      INSERT INTO raw_movie_embedding (id, raw_movie_api_id, embedding, created_at, updated_at)
      VALUES (${request.id}, ${request.rawMovieApiId}, ${embeddingStr}::vector, ${request.createdAt}, ${request.updatedAt})
    `
        }
      })

      const insert = (data: RawMovieEmbeddingModel) =>
        pipe(
          insertSchema(data),
          Effect.orDie,
          Effect.withSpan("RawMovieEmbeddingRepository.insert")
        )

      // Schema pour l'update
      const updateSchema = SqlSchema.single({
        Request: Schema.Struct({
          rawMovieApiId: RawMovieApiId,
          embedding: Schema.Array(Schema.Number),
          updatedAt: Schema.Date
        }),
        Result: Schema.Struct({
          id: RawMovieEmbeddingId
        }),
        execute: (request) => {
          const embeddingStr = `[${request.embedding.join(",")}]`
          return sql`
      UPDATE raw_movie_embedding 
      SET 
        embedding = ${embeddingStr}::vector,
        updated_at = ${request.updatedAt}
      WHERE raw_movie_api_id = ${request.rawMovieApiId}
      RETURNING id
    `
        }
      })

      const update = (rawMoviId: RawMovieApiId, embedding: ReadonlyArray<number>, p0: Date) =>
        pipe(
          updateSchema({
            rawMovieApiId: rawMoviId,
            embedding,
            updatedAt: p0
          }),
          Effect.orDie,
          Effect.withSpan("RawMovieEmbeddingRepository.update")
        )

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
        insert,
        findById: repo.findById,
        update,
        findByRawMovieApiId
      }
    }),
    dependencies: [PgLive]
  })
{}
