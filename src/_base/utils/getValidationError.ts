import { ValidationError } from 'yup';

interface Errors {
  [key: string]: string;
}

export const getValidationError = (err: ValidationError): Errors => {
  const validationErrors: Errors = {};

  err.inner.forEach(error => {
    validationErrors[(error as any).path] = error.message;
  });

  return validationErrors;
};
