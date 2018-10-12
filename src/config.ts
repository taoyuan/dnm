import path = require('path');
import fs = require('fs');
import json5 = require('json5');
import yaml = require('js-yaml');

export function load(location: string) {
  if (!fs.existsSync(location)) {
    throw new Error('file is not exists: ' + location);
  }

  const data = fs.readFileSync(location).toString('utf-8');
  const ext = path.extname(location).toLowerCase();

  if (ext === '.json' || ext === '.json5') {
    return json5.parse(data);
  } else if (ext === 'yaml' || ext === 'yml') {
    return yaml.safeLoad(data);
  } else {
    try {
      return json5.parse(data);
    } catch (e) {
      return yaml.safeLoad(data);
    }
  }
}
