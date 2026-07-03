export type SuccessResult<T> = {
	success: true
	data: T
}
export type ErrorResult<E = string> = {
	success: false
	error: E
}
export type StatusResult = {
	status: number
}
export type ResponseResult<T, E = string> = StatusResult & (SuccessResult<T> | ErrorResult<E>)
export type FullSuccessResult<T> = StatusResult & SuccessResult<T>
export type FullErrorResult<E = string> = StatusResult & ErrorResult<E>
