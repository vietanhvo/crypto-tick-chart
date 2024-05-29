export const countDigitsAfterDecimal = (num: number) => {
  const numStr = num.toString();

  if (numStr.includes("e")) {
    const parts = numStr.split("e-");
    if (parts.length > 1) {
      return parseInt(parts[1], 10);
    }
    return 0;
  }

  const decimalPart = numStr.split(".")[1];
  return decimalPart ? decimalPart.length : 0;
};

export const countSignificantDecimals = (input: string) => {
  const dotIndex = input.indexOf(".");

  if (dotIndex === -1) return 0;

  const decimalPart = input.substring(dotIndex + 1);
  return decimalPart.replace(/0+$/, "").length;
};
