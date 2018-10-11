import { createUser } from '../service/auth';

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  await createUser(
    {
      username,
      password
    },
    false
  );
  console.log('successful')
  process.exit(0);
}

main();
