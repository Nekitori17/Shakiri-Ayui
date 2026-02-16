type ErrorType = "error" | "warning" | "info";

/**
 * Custom Error class for standardized error handling within the application.
 * Allows for defining error name, message, type (error, warning, info),
 * and an optional response object.
 */
export class CustomError extends Error {
  public type: ErrorType;
  public response?: any;

  constructor({
    name,
    message,
    type = "error",
    response,
  }: {
    name: string;
    message: string;
    type?: ErrorType;
    response?: any;
  }) {
    super(message);
    this.name = name;
    this.type = type;
    this.response = response;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}
