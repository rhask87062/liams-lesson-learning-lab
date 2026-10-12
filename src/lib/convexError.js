import { ConvexError } from 'convex/values';

export function errorMessage(error) {
  if (error instanceof ConvexError && typeof error.data === 'string') return error.data;
  console.error(error);
  return 'Something went wrong. Please check your connection and try again.';
}
