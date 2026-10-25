import axios, { AxiosError } from "axios";

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: any;
}

export class ApiErrorHandler {
  static handle(error: any): ApiError {
    // Axios error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;

      // Server responded with error status
      if (axiosError.response) {
        const { data, status } = axiosError.response;

        return {
          message: data?.error || data?.message || "An error occurred",
          code: data?.code || this.getCodeFromStatus(status),
          statusCode: status,
          details: data,
        };
      }

      // Request made but no response
      if (axiosError.request) {
        return {
          message: "No response from server. Check your connection.",
          code: "NETWORK_ERROR",
          statusCode: 0,
          details: axiosError.request,
        };
      }

      // Error setting up request
      return {
        message: axiosError.message || "Failed to make request",
        code: "REQUEST_ERROR",
        statusCode: 0,
        details: axiosError,
      };
    }

    // Non-axios error
    return {
      message: error?.message || "An unexpected error occurred",
      code: "UNKNOWN_ERROR",
      statusCode: 0,
      details: error,
    };
  }

  private static getCodeFromStatus(status: number): string {
    switch (status) {
      case 400:
        return "VALIDATION_ERROR";
      case 401:
        return "AUTHENTICATION_ERROR";
      case 403:
        return "AUTHORIZATION_ERROR";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "UNPROCESSABLE_ENTITY";
      case 429:
        return "RATE_LIMIT_EXCEEDED";
      case 500:
      case 502:
      case 503:
      case 504:
        return "INTERNAL_SERVER_ERROR";
      default:
        return "HTTP_ERROR";
    }
  }

  static getDisplayMessage(error: ApiError): string {
    switch (error.code) {
      case "VALIDATION_ERROR":
        return "Please check your input and try again.";
      case "AUTHENTICATION_ERROR":
        return "Invalid email or password.";
      case "AUTHORIZATION_ERROR":
        return "You don't have permission to perform this action.";
      case "NOT_FOUND":
        return "The requested resource was not found.";
      case "NETWORK_ERROR":
        return "Connection failed. Please check your internet connection.";
      case "RATE_LIMIT_EXCEEDED":
        return "Too many requests. Please try again later.";
      case "INTERNAL_SERVER_ERROR":
        return "Server error. Please try again later.";
      case "DUPLICATE_EMAIL":
        return "This email is already registered.";
      case "INVALID_CREDENTIALS":
        return "Invalid email or password.";
      default:
        return error.message;
    }
  }

  static isRetryable(error: ApiError): boolean {
    const retryableCodes = [
      "NETWORK_ERROR",
      "RATE_LIMIT_EXCEEDED",
      "INTERNAL_SERVER_ERROR",
    ];
    return retryableCodes.includes(error.code);
  }

  static isAuthError(error: ApiError): boolean {
    return error.code === "AUTHENTICATION_ERROR";
  }

  static isValidationError(error: ApiError): boolean {
    return error.code === "VALIDATION_ERROR";
  }
}

// Global error logging (optional)
export const logError = (error: ApiError, context?: string) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    },
  };

  console.error("[API Error]", JSON.stringify(logEntry, null, 2));

  // In production, send to error tracking service
  // Example: Sentry.captureException(error);
};

/**
 * Extract a human-readable error message from any thrown value.
 * Works with axios errors, API interceptor rejections, and plain Error objects.
 */
export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong",
): string {
  if (!err) return fallback;

  if (typeof err === "object" && err !== null) {
    const e = err as any;
    // Our API interceptor rejects with { message, status, data }
    if (typeof e.message === "string" && e.message) return e.message;
    if (e.response?.data?.error) return e.response.data.error;
    if (e.response?.data?.message) return e.response.data.message;
    if (e.data?.error) return e.data.error;
  }

  if (err instanceof Error) return err.message || fallback;

  return fallback;
}
