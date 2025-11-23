import { Schema } from "effect"

export const MovieId = Schema.UUID.pipe(Schema.brand("MovieId"))
export type MovieId = typeof MovieId.Type

export const MovieType = Schema.Trim.pipe(Schema.brand("MovieType"))
export type MovieType = typeof MovieType.Type

export const PrimaryTitleMovie = Schema.Trim.pipe(Schema.brand("PrimaryTitleMovie"))
export type PrimaryTitleMovie = typeof PrimaryTitleMovie.Type

export const OriginalTitleMovie = Schema.Trim.pipe(Schema.brand("OriginalTitleMovie"))
export type OriginalTitleMovie = typeof OriginalTitleMovie.Type
