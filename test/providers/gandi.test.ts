import {assert} from 'chai';
import {env} from "../support";
import {createProvider} from "../..";

describe.skip('gandi', function () {
  this.timeout(10000);

  const provider = createProvider('gandi', {token: env['DNM_GANDI_TOKEN'], domain: <string>(env['GANDI_DOMAIN'])});

  it('authenticate', async () => {
    const answer = await provider.authenticate();
    console.log(answer);
  });

  it('create', async () => {
    const answer = await provider.create({name: 't1', type: 'A', content: '1.1.1.2'});
    console.log(answer);
  });

  it('list', async () => {
    const answer = await provider.list({name: 'www'});
    console.log(answer);
  });

  it('update', async () => {
    const answer = await provider.update('test', {type: 'A', content: '2.2.2.2'});
    console.log(answer);
  });

  it('delete', async () => {
    const answer = await provider.delete('t1');
    console.log(answer);
  });

  it.only('updyn', async () => {
    const answer = await provider.updyn('test', {content: '3.3.3.3'});
    console.log(answer);
  });
});

