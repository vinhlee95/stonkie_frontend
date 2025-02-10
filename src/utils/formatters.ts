export const formatNumber = (num: number, isCurrency = false): string => {
  if (num >= 1e12) {
    return `${isCurrency ? '$' : ''}${(num / 1e12).toFixed(2)}T`;
  } else if (num >= 1e9) {
    return `${isCurrency ? '$' : ''}${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `${isCurrency ? '$' : ''}${(num / 1e6).toFixed(2)}M`;
  }
  return `${isCurrency ? '$' : ''}${num.toFixed(2)}`;
}; 