import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Generated images are served as-is; locale handling would redirect or 404 them.
  matcher: ['/((?!api|_next|_vercel|apple-icon|.*opengraph-image|.*\\..*).*)'],
};
