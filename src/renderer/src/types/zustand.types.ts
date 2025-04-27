export type LocalStorageState<T> = {
   state: RemoveMethods<T>,
   version: number
}

type RemoveMethods<T> = {
   [K in keyof T as T[K] extends Function ? never : K]: T[K]
 };