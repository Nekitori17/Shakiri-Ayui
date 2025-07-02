type ErrorType = "error" | "warning" | "info";

/**
 * Custom Error class for standardized error handling within the application.
 * Allows for defining error name, message, type (error, warning, info),
 * and an optional response object.
 */
export class CustomError {
  // The name of the error.
  public name: string;
  // The message describing the error.
  public message: string;
  // The type of the error, influencing how it might be displayed or handled.
  public type: ErrorType;
  // Optional additional response data related to the error.
  public response?: any;

  /**
   * Creates an instance of CustomError.
   * @param options - An object containing properties for the error.
   * @param options.name - The name of the error.
   * @param options.message - The message describing the error.
   * @param [options.type="error"] - The type of the error (error, warning, info). Defaults to "error".
   * @param [options.response] - Optional additional response data.
   */
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
    this.name = name;
    this.message = message;
    this.type = type;
    this.response = response;
  }
}
