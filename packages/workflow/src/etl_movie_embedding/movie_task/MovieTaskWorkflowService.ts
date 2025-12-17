import { SqlClient } from "@effect/sql"
import type { RawMovieApiModel } from "@template/database/model/RawMovieApiModel"
import { MovieRepository } from "@template/database/repositories/MovieRepository"
import { RowMovieApiRepository } from "@template/database/repositories/RowMovieApiRepository"
import { RawMovieEmbeddingRepository } from "@template/database/repositories/RowMovieEmbeddingRepository"
import { AggregateRating, RuntimeSeconds, VoteCount } from "@template/domain/imdb/ImdbResponseApiType"
import { MovieId, MovieType } from "@template/domain/movie/MovieType"
import type { RawMovieEmbeddingId } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { EmbeddingMovie } from "@template/domain/rawMovieEmbedding/RawMovieEmbeddingType"
import { Uuid } from "@template/domain/Uuid"
import { Effect, Option, pipe } from "effect"
import { MovieTaskWorkflowError } from "./MovieTaskWorkflow.js"

export class MovieTaskWorkflowService extends Effect.Service<MovieTaskWorkflowService>()(
  "@template/workflow/etl_movie_embedding/movie_task/MovieTaskWorkflowService",
  {
    effect: Effect.gen(function*() {
      const rawMovieRepository = yield* RowMovieApiRepository
      const rawMovieEmbeddingRepository = yield* RawMovieEmbeddingRepository
      const movieRepository = yield* MovieRepository
      const uuid = yield* Uuid
      const sql = yield* SqlClient.SqlClient

      const insertMovie = (rawMovie: RawMovieApiModel, embedding: ReadonlyArray<number>) =>
        uuid.generate.pipe(
          Effect.flatMap((id) =>
            movieRepository
              .insert({
                id: MovieId.make(id),
                type: MovieType.make(rawMovie.payload.type),
                primaryTitle: rawMovie.payload.primaryTitle,
                originalTitle: rawMovie.payload.originalTitle,
                primaryImage: rawMovie.payload.primaryImage,
                startYear: rawMovie.payload.startYear,
                runtimeSeconds: rawMovie.payload.runtimeSeconds ?? RuntimeSeconds.make(0),
                genres: rawMovie.payload.genres,
                rating: rawMovie.payload.rating ??
                  { aggregateRating: AggregateRating.make(0), voteCount: VoteCount.make(0) },
                plot: rawMovie.payload.plot,
                createdAt: new Date(),
                updatedAt: new Date(),
                embedding: EmbeddingMovie.make(embedding),
                imdbId: rawMovie.payload.id
              })
              .pipe(Effect.zipRight(Effect.succeed(MovieId.make(id))), Effect.orDie, sql.withTransaction)
          )
        )

      const updateMovie = (id: MovieId, rawMovie: RawMovieApiModel, embedding: ReadonlyArray<number>) =>
        movieRepository
          .update({
            id,
            type: MovieType.make(rawMovie.payload.type),
            primaryTitle: rawMovie.payload.primaryTitle,
            originalTitle: rawMovie.payload.originalTitle,
            primaryImage: rawMovie.payload.primaryImage,
            startYear: rawMovie.payload.startYear,
            runtimeSeconds: rawMovie.payload.runtimeSeconds ?? RuntimeSeconds.make(0),
            genres: rawMovie.payload.genres,
            rating: rawMovie.payload.rating ??
              { aggregateRating: AggregateRating.make(0), voteCount: VoteCount.make(0) },
            plot: rawMovie.payload.plot,
            createdAt: new Date(),
            updatedAt: new Date(),
            embedding: EmbeddingMovie.make(embedding),
            imdbId: rawMovie.payload.id
          })
          .pipe(
            Effect.andThen(() => id),
            Effect.orDie,
            sql.withTransaction
          )

      const run = (id: RawMovieEmbeddingId) =>
        pipe(
          rawMovieEmbeddingRepository.findById(id),
          Effect.flatMap(Option.match({
            onNone: () => Effect.fail(new Error("Movie Embedding not found")),
            onSome: (movieEmbedding) => Effect.succeed(movieEmbedding)
          })),
          Effect.flatMap(({ embedding, rawMovieApiId }) =>
            rawMovieRepository.findById(rawMovieApiId).pipe(
              Effect.flatMap(Option.match({
                onNone: () => Effect.fail(new Error("Raw Movie not found")),
                onSome: (rawMovie) => Effect.succeed({ rawMovie, embedding })
              }))
            )
          ),
          Effect.flatMap(({ embedding, rawMovie }) =>
            movieRepository.findByImdbId(rawMovie.payload.id).pipe(
              Effect.flatMap(Option.match({
                onNone: () => insertMovie(rawMovie, embedding),
                onSome: (movie) => updateMovie(movie.id, rawMovie, embedding)
              }))
            )
          ),
          sql.withTransaction,
          Effect.catchAll(
            (err) => new MovieTaskWorkflowError({ message: err.message })
          )
        )

      return {
        run
      }
    })
  }
) {}
