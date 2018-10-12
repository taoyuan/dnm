import psl = require('psl');
import {aggregate} from "..";

describe('utils', () => {
  it.only('aggregate', () => {
    const answer = aggregate([
      'www.example.com',
      'test.example.com',
      'www.test.com',
      'blog.test.com',
      'home.io'
    ], (domain) => psl.get(domain));
    console.log(answer);
  });
});
