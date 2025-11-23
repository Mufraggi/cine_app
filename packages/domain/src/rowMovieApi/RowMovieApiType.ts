import { Schema } from "effect"

export const RowMovieApiId = Schema.UUID.pipe(Schema.brand("RowMovieApiId"))
export type RowMovieApiId = typeof RowMovieApiId.Type
