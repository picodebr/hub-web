type SchemaErrorType = 'REQUIRED_FIELD' | 'EMAIL' | 'IDENTIFIER_LENGTH' | 'PASS_LENGTH';

export const zodSchemaErrors: Record<SchemaErrorType, string> = {
  REQUIRED_FIELD: 'Campo obrigatório',
  EMAIL: 'E-mail inválido',
  IDENTIFIER_LENGTH: 'Mínimo de 6 caracteres',
  PASS_LENGTH: 'Mínimo de 6 caracteres',
};
