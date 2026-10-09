/**
 * Grant or remove the author role (D7 — roles live in the database, not Cognito).
 *
 *   npm run set-role -- --list                    who exists (name, role; no health data)
 *   npm run set-role -- <cognitoSub> author       make someone an author
 *   npm run set-role -- <cognitoSub> user         take it away again
 *
 * The cognitoSub is the "User ID (sub)" shown for the user in the Cognito console.
 */
import { prisma } from '../src/lib/prisma';

const ROLES = ['user', 'author'] as const;
type Role = (typeof ROLES)[number];

async function main() {
  const [first, role] = process.argv.slice(2);

  if (first === '--list') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { cognitoSub: true, displayName: true, role: true },
    });
    for (const u of users)
      console.log(`${u.cognitoSub}  ${u.role.padEnd(6)}  ${u.displayName ?? '—'}`);
    return;
  }

  if (!first || !ROLES.includes(role as Role)) {
    console.error('usage: npm run set-role -- --list | <cognitoSub> <user|author>');
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.update({
    where: { cognitoSub: first },
    data: { role: role as Role },
    select: { displayName: true, role: true },
  });
  console.log(`${user.displayName ?? 'user'} is now: ${user.role}`);
}

main()
  .catch((error: unknown) => {
    console.error('set-role failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
