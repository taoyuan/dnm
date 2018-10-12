import {Record} from "./provider";

export function rstrip(str: string, chars: string) {
  // Convert to string
  str = str.toString();

  // Empty string?
  if (!str) {
    return '';
  }

  // Remove whitespace if chars arg is empty
  if (!chars) {
    return str.replace(/\s+$/, '');
  }

  // Convert to string
  chars = chars.toString();

  // Set vars
  var letters = str.split(''),
    i = letters.length - 1;

  // Loop letters
  for (i; i >= 0; i--) {
    if (chars.indexOf(letters[i]) === -1) {
      return str.substring(0, i + 1);
    }
  }

  return str;
}

export function clearTxtRecord(record: Record) {
  if (record.type === 'TXT') {
    record.content = record.content.substr(1);
  }
  return record;
}

export function authFromEnv(provider: string) {
  const answer = {};
  const prefix = `DNM_${provider.toUpperCase()}_`;
  for (const key of Object.keys(process.env)) {
    if (key.startsWith(prefix)) {
      answer[key.substr(prefix.length).toLowerCase()] = process.env[key];
    }
  }
  return answer;
}

export function aggregate(list: any[], key: string | ((item: any) => any)) {
  let keyFn;
  if (typeof key === 'string') {
    keyFn = (item: any) => item[key];
  } else {
    keyFn = key;
  }

  if (!Array.isArray(list)) {
    list = [list];
  }

  return list.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}
