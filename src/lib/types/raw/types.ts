export type TransformField<TypeT, TypeU, Raw extends boolean = false> = Raw extends true ? TypeU : TypeT

export type MaybeDate<Raw extends boolean = false> = TransformField<Date, string, Raw>
