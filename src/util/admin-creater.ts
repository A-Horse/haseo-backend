import { checkHasAdmin, createAdmin } from '../service/auth';

export async function checkAdminCreate(): Promise<void> {
  const hasAdmin = await checkHasAdmin();
  if (!hasAdmin) {
    await createAdmin();
  }
}
