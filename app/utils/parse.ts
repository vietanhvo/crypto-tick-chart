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
