// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
export function template(strings, ...keys) {
  return (...values): string => {
    const dict = values[values.length - 1] || {};
    const result = [strings[0]];
    keys.forEach((key, i) => {
      const value = Number.isInteger(key) ? values[key] : dict[key];
      result.push(value, strings[i + 1]);
    });
    return result.join('');
  };
}
