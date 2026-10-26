export type FieldErrors = Record<string, string>

// Throw this from a route to send an error response, like Laravel's abort(404, '...').
export class HttpError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: FieldErrors

  constructor(status: number, code: string, message: string, fields?: FieldErrors) {
    super(message)
    this.status = status
    this.code = code
    this.fields = fields
  }
}

// Every error response uses this shape: { error: { code, message, fields? } }
export function errorBody(code: string, message: string, fields?: FieldErrors) {
  return { error: fields ? { code, message, fields } : { code, message } }
}

// Like Laravel's ValidationException: 422 with one message per invalid field.
export function validationError(fields: FieldErrors): HttpError {
  return new HttpError(422, 'VALIDATION_ERROR', 'Please fix the highlighted fields.', fields)
}
