import { FetchHttpClient, HttpClient } from "@effect/platform"
import { EndPointResponseApi } from "@template/domain/imdb/ImdbResponseApi"
import { Config, Effect, Redacted, Schedule, Schema } from "effect"

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
}) {}
