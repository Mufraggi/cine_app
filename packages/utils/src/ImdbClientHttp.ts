import { FetchHttpClient, HttpClient } from "@effect/platform"
import type { IMdbData } from "@template/domain/imdb/ImdbResponseApi"
import { EndPointResponseApi } from "@template/domain/imdb/ImdbResponseApi"
import { Config, Effect, Layer, Redacted, Schedule, Schema } from "effect"
import {
  AggregateRating,
  Genre,
  Genres,
  ImdbId,
  ImdbType,
  OriginalTitle,
  Plot,
  PrimaryImageHeight,
  PrimaryImageUrl,
  PrimaryImageWidth,
  PrimaryTitle,
  RuntimeSeconds,
  StartYear,
  VoteCount
} from "../../domain/src/imdb/ImdbResponseApiType.js"

export class ImdbClientHttp extends Effect.Service<ImdbClientHttp>()("ImdbClientHttp", {
  dependencies: [FetchHttpClient.layer],
  effect: Effect.gen(function*(_) {
    const httpClient = yield* HttpClient.HttpClient
    const baseUrl = yield* Config.redacted("IMDB_API_BASE_URL")

    const callImdbApi = () =>
      httpClient.get(`${Redacted.value(baseUrl)}/titles`).pipe(
        Effect.andThen((response) => response.json),
        Effect.flatMap((data) => Schema.decodeUnknown(EndPointResponseApi)(data)),
        Effect.timeout("5 seconds"),
        Effect.retry({ schedule: Schedule.exponential(1000), times: 3 }),
        Effect.withSpan("ImdbClientHttp.callImdbApi", { attributes: { url: `${baseUrl}/titles?types=MOVIE` } })
      )

    return {
      callImdbApi
    }
  })
}) {
  static InMemory = Layer.succeed(ImdbClientHttp, {
    callImdbApi: () => {
      const mockMovie: IMdbData = {
        id: ImdbId.make("tt0000001"),
        type: ImdbType.make("movie"),
        primaryTitle: PrimaryTitle.make("Mock Movie"),
        originalTitle: OriginalTitle.make("Mock Movie Original"),
        primaryImage: {
          url: PrimaryImageUrl.make(new URL("https://example.com/mock.jpg")),
          width: PrimaryImageWidth.make(800),
          height: PrimaryImageHeight.make(600)
        },
        startYear: StartYear.make(2024),
        runtimeSeconds: RuntimeSeconds.make(5400),
        genres: Genres.make([Genre.make("Drama"), Genre.make("Action")]),
        rating: { aggregateRating: AggregateRating.make(7.8), voteCount: VoteCount.make(2000) },
        plot: Plot.make("This is a mock plot for testing.")
      }

      const mockResponse: EndPointResponseApi = {
        titles: [mockMovie],
        totalCount: 1,
        nextPageToken: "next-mock"
      }
      return Effect.succeed(mockResponse)
    },
    _tag: "ImdbClientHttp"
  })
}
