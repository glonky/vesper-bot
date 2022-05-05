import { Container } from 'typedi';
import { Server } from './server';

(async () => {
  await Container.get(Server).start();
})();
