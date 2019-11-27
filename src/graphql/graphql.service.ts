import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { AppSettings } from '../app/app.settings';

const uri = `${AppSettings.APP_MANAGER_URL}/api/store/graphql`;
export function createApollo(
  httpLink: HttpLink,
  token: String,
  apollo: Apollo
) {
  const authLink = setContext((
    _,
    { headers }
  ) => ({
    headers: {
      ...headers,
      authorization: `Bearer ${token}`
    }
  }));

  return apollo.create({
    link: authLink.concat(
      httpLink.create({
        uri
      })
    ),
    cache: new InMemoryCache({
      addTypename: false
    }),
    defaultOptions: {
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      },
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all'
      }
    }
  });
};

export function handleErrors(res) {
  if (
    Array.isArray(res.errors) &&
    res.errors.length > 0
  ) {
    return res.errors.forEach(err => (
      console.error(err.message)
    ));
  }
  
  if (typeof res.error === 'object') {
    return console.error(res.error.message);
  }

  if (typeof res.error === 'string') {
    return console.error(res.error);
  }

  if (
    !res.data ||
    typeof res.data !== 'object'
  ) {
    return console.error('Attribute "data" is missing from GraphQL response');
  }

  return null;
};
