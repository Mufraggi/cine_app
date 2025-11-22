import { Schema } from "effect"

// export const ImdbId = Schema.String.pipe(Schema.brand("ImdbId"))
export type ImdbId = typeof ImdbId.Type
export const ImdbId = Schema.String.pipe(
  Schema.pattern(/^tt\d{6,9}$/, {
    message: () => "Must start with tt followed by digits"
  }),
  Schema.brand("ImdbId")
)

export const ImdbType = Schema.Literal("movie", "tvSeries", "tvMiniSeries", "tvMovie").pipe(Schema.brand("ImdbType"))
export type ImdbType = typeof ImdbType.Type

export const PrimaryTitle = Schema.Trim.pipe(
  Schema.minLength(1),
  Schema.maxLength(250),
  Schema.brand("PrimaryTitle")
)
export type PrimaryTitle = typeof PrimaryTitle.Type

export const OriginalTitle = Schema.Trim.pipe(
  Schema.minLength(1),
  Schema.maxLength(250),
  Schema.brand("OriginalTitle")
)
export type OriginalTitle = typeof OriginalTitle.Type

export const PrimaryImageUrl = Schema.URL.pipe(
  Schema.brand("PrimaryImageUrl")
)
export type PrimaryImageUrl = typeof PrimaryImageUrl.Type

export const PrimaryImageWidth = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.brand("PrimaryImageWidth")
)
export type PrimaryImageWidth = typeof PrimaryImageWidth.Type

export const PrimaryImageHeight = Schema.Number.pipe(
  Schema.int(),
  Schema.positive(),
  Schema.brand("PrimaryImageHeight")
)
export type PrimaryImageHeight = typeof PrimaryImageHeight.Type

export const PrimaryImage = Schema.Struct({
  url: PrimaryImageUrl,
  width: PrimaryImageWidth,
  height: PrimaryImageHeight
})
export type PrimaryImage = typeof PrimaryImage.Type

export const StartYear = Schema.Number.pipe(
  Schema.int(),
  Schema.between(1850, 2100),
  Schema.brand("StartYear")
)
export type StartYear = typeof StartYear.Type

export const RuntimeSeconds = Schema.Number.pipe(
  Schema.int(),
  Schema.nonNegative(),
  Schema.brand("RuntimeSeconds")
)
export type RuntimeSeconds = typeof RuntimeSeconds.Type

export const Genre = Schema.Trim.pipe(
  Schema.minLength(1),
  Schema.brand("Genre")
)
export type Genre = typeof Genre.Type

export const Genres = Schema.Array(Genre).pipe(Schema.brand("Genres"))
export type Genres = typeof Genres.Type

export const AggregateRating = Schema.Number.pipe(
  Schema.between(0, 10),
  Schema.brand("AggregateRating")
)
export type AggregateRating = typeof AggregateRating.Type

export const VoteCount = Schema.Number.pipe(
  Schema.int(),
  Schema.nonNegative(),
  Schema.brand("VoteCount")
)
export type VoteCount = typeof VoteCount.Type

export const Rating = Schema.Struct({
  aggregateRating: AggregateRating,
  voteCount: VoteCount
})
export type Rating = typeof Rating.Type

export const Plot = Schema.Trim.pipe(
  Schema.minLength(1),
  Schema.maxLength(1000),
  Schema.brand("Plot")
)
export type Plot = typeof Plot.Type
