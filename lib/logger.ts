/**
 * Simple logger utility for production use
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const createChildLogger = (namespace: string) => {
  return {
    debug: (data: any, msg?: string) => {
      if (isDevelopment) {
        console.log(`[${namespace}] ${msg || ''}`, data);
      }
    },
    info: (data: any, msg?: string) => {
      console.log(`[${namespace}] ${msg || ''}`, data);
    },
    warn: (data: any, msg?: string) => {
      console.warn(`[${namespace}] ${msg || ''}`, data);
    },
    error: (data: any, msg?: string) => {
      console.error(`[${namespace}] ${msg || ''}`, data);
    },
  };
};
