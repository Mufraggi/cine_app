import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

import { Uuid } from "@template/domain/Uuid"

import { RawMovieApiModel } from "../../src/model/RawMovieApiModel.js"
import { RowMovieApiRepository } from "../../src/repositories/RowMovieApiRepository.js"
import { PgLive } from "../../src/Sql.js"

import type { IMdbData } from "@template/domain/imdb/ImdbResponseApi"
import type { PrimaryImageUrl } from "@template/domain/imdb/ImdbResponseApiType"
import {
  AggregateRating,
  Genre,
  Genres,
  ImdbId,
  ImdbType,
  OriginalTitle,
  Plot,
  PrimaryImage,
  PrimaryImageHeight,
  PrimaryImageWidth,
  PrimaryTitle,
  Rating,
  RuntimeSeconds,
  StartYear,
  VoteCount
} from "@template/domain/imdb/ImdbResponseApiType"
import { RawMovieApiId } from "@template/domain/rawMovieApi/RawMovieApiType"

describe("RowMovieApiRepository", () => {
  it("should insert and retrieve a RawMovieApi entry", { timeout: 5000 }, async () => {
    const program = Effect.gen(function*() {
      const uuid = yield* Uuid
      const repo = yield* RowMovieApiRepository

      const id = RawMovieApiId.make(yield* uuid.generate)

      // Build IMdbData payload (must match your branded schemas)
      const payload: IMdbData = {
        id: ImdbId.make("tt9876543"),
        type: ImdbType.make("movie"),
        primaryTitle: PrimaryTitle.make("Avatar"),
        originalTitle: OriginalTitle.make("Avatar Original"),
        primaryImage: PrimaryImage.make({
          url: new URL("https://example.com/avatar.jpg") as PrimaryImageUrl,
          width: PrimaryImageWidth.make(500),
          height: PrimaryImageHeight.make(700)
        }),
        startYear: StartYear.make(2009),
        runtimeSeconds: RuntimeSeconds.make(9800),
        genres: Genres.make([Genre.make("Action"), Genre.make("Fantasy"), Genre.make("Sci-Fi")]),
        rating: Rating.make({
          aggregateRating: AggregateRating.make(7.8),
          voteCount: VoteCount.make(2000000)
        }),
        plot: Plot.make("A marine is sent to Pandora and participates in its defense.")
      }

      const model = new RawMovieApiModel({
        id,
        payload,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      yield* repo.insert(model)

      return yield* yield* repo.findById(id)
    })

    const result = await Effect.runPromise(
      program.pipe(
        Effect.provide(Uuid.Default),
        Effect.provide(RowMovieApiRepository.Default),
        Effect.provide(PgLive)
      )
    )

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()

    // Check important fields
    expect(result.payload.primaryTitle).toBe("Avatar")
    expect(result.payload.genres).toEqual(["Action", "Fantasy", "Sci-Fi"])
    expect(result.payload.plot).toContain("Pandora")

    // Check nested branded values
    expect(result.payload.rating!.aggregateRating).toBeCloseTo(7.8)
    expect(result.payload.primaryImage.width).toBe(500)
  })
})
