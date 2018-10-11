import { checkHasAdmin, createAdmin } from '../service/auth';

export async function checkAdminCreate(password): Promise<void> {
  const hasAdmin = await checkHasAdmin();
  if (!hasAdmin) {
    await createAdmin(password);
  }
}
