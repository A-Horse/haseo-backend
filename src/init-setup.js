import { checkHasAdmin, createAdmin } from './service/auth';

(async () => {
  const hasAdmin = await checkHasAdmin();
  if (!hasAdmin) {
    await createAdmin();
  }
})();
