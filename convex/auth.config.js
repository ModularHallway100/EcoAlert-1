const domain = process.env.CLERK_FRONTEND_API_URL;
if (!domain) {
  throw new Error('Missing CLERK_FRONTEND_API_URL for Convex auth provider (expected Clerk domain).');
}

export default {
  providers: [
    {
      domain,
      applicationID: 'convex',
    },
  ],
}