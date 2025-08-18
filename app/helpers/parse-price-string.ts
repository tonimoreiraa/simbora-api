export function parsePriceBR(value: string) {
  if (!value.length) {
    return undefined;
  }
  return parseFloat(
    value
      .replace(/\s/g, '')        // remove espaços
      .replace('R$', '')         // remove R$
      .replace(/[^\d.,-]/g, '')  // remove outros símbolos
      .replace(/\./g, '')        // remove separador de milhar
      .replace(',', '.')         // troca vírgula por ponto decimal
  );
}