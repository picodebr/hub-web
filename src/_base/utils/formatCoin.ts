type FuncType = (value?: string | number | null) => string;

export const formatCoin: FuncType = (value) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
