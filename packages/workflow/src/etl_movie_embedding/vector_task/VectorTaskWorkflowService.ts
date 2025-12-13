import { SqlClient } from "@effect/sql"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { RawMovieEmbeddingRepository } from "@template/database/repositories/RowMovieEmbeddingRepository"
import type { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"
import { RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Uuid } from "@template/domain/Uuid"
import { VectorLlmClient } from "@template/utils/VectorLlmClient"
import { Effect, Option, pipe } from "effect"

export class VectorTaskWorkflowService extends Effect.Service<VectorTaskWorkflowService>()(
  "@template/workflow/etl_movie_embedding/vector_task/VectorTaskWorkflowService",
  {
    effect: Effect.gen(function*() {
      const clientOpenAi = yield* VectorLlmClient
      const rawMovieApiRepository = yield* RowMovieApiRepository
      const rawMovieEmbeddingRepository = yield* RawMovieEmbeddingRepository
      const uuid = yield* Uuid
      const sql = yield* SqlClient.SqlClient

      const insertMovieEmbeding = (rawMoviId: RawMovieApiId, embedding: ReadonlyArray<number>) =>
        uuid.generate.pipe(
          Effect.flatMap((id) =>
            rawMovieEmbeddingRepository
              .insert({
                id: RawMovieEmbeddingId.make(id),
                createdAt: new Date(),
                updatedAt: new Date(),
                rawMovieApiId: rawMoviId,
                embedding
              })
              .pipe(Effect.zipRight(Effect.succeed(RawMovieEmbeddingId.make(id))), Effect.orDie, sql.withTransaction)
          )
        )

      const updateMovieEmbeding = (rawMoviId: RawMovieApiId, embedding: ReadonlyArray<number>) =>
        rawMovieEmbeddingRepository
          .update(rawMoviId, embedding, new Date())
          .pipe(Effect.map((x) => x.id), Effect.orDie, sql.withTransaction)

      const run = (id: RawMovieApiId) =>
        pipe(
          rawMovieApiRepository.findById(id),
          Effect.flatMap(Option.match({
            onNone: () => Effect.fail(new Error("Movie not found")),
            onSome: (movie) => Effect.succeed(movie)
          })),
          Effect.flatMap(({ id, payload }) =>
            Effect.all([Effect.succeed(id), clientOpenAi.vectorizeFilmdescription(payload.plot)])
          ),
          Effect.flatMap(([movieRawId, embedding]) =>
            rawMovieEmbeddingRepository.findByRawMovieApiId(movieRawId).pipe(
              Effect.flatMap(Option.match({
                onNone: () => insertMovieEmbeding(movieRawId, embedding),
                onSome: () => updateMovieEmbeding(movieRawId, embedding)
              }))
            )
          ),
          sql.withTransaction,
          Effect.catchTag("SqlError", (err) => Effect.die(err))
        )

      return { run }
    })
  }
) {}
