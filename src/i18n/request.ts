import {getRequestConfig} from 'next-intl/server';
import {headers} from 'next/headers';

export default getRequestConfig(async () => {
  // This can either be defined statically if only a single locale
  // is supported, or based on the user's preference
  const headersList = await headers();
  const locale = headersList.get('x-locale') || 'en';

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});