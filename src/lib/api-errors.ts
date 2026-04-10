import axios from 'axios';

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | {
          error?: { message?: string; details?: string[] } | string;
          message?: string | string[];
        }
      | undefined;

    const nestedErrorMessage =
      typeof responseData?.error === 'object' && responseData.error
        ? responseData.error.message ?? responseData.error.details?.[0]
        : typeof responseData?.error === 'string'
          ? responseData.error
          : undefined;

    const responseMessage = Array.isArray(responseData?.message)
      ? responseData?.message[0]
      : responseData?.message;

    return nestedErrorMessage ?? responseMessage ?? error.message ?? fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
