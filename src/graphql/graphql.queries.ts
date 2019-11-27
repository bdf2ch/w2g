import graphQlTag from 'graphql-tag';

const categoryFields = `{
  id
  name
  parent {
    id
  }
  icons {
    web_icon
  }
}`;

export const categoryQuery = (
  graphQlTag(`
    query category(
      $id: ID!
      $context: String
    ) {
        category(
            id: $id
            context: $context
        ) ${categoryFields}
      }
  `)
);


export const categoryLm2Query = (
  graphQlTag(`
    query categoryLm2(
      $lm2_id: UUID!
      $context: String
    ) {
        categoryLm2(
            lm2_id: $lm2_id
            context: $context
        ) ${categoryFields}
      }
  `)
);

export const categoriesQuery = (
  graphQlTag(`
    query categories(
      $context: String
      $project_id: Int
      $parent_id: ID
      $limit: Int
      $skip: Int
      $sort: String
      $order: String
      $exclude_from_directory: Boolean
    ) {
        categories(
          context: $context
          project_id: $project_id
          parent_id: $parent_id
          limit: $limit
          skip: $skip
          sort: $sort
          order: $order
          exclude_from_directory: $exclude_from_directory
        ) {
            id
            name
            parent {
              id
            }
            icons {
              web_icon
            }
            exclude_from_directory
            children {
              id
              name
              parent {
                id
              }
              icons {
                web_icon
              }
              exclude_from_directory
            }
          }
      }
  `)
);

const locationFields = `{
  id
  name
  content_type
  point
  categories {
    id
    name
  }
  floor {
    id
    name
    lm2_id
  }
  floors {
    id
    name
    level
    lm2_id
  }
  parent {
    id
    name
    content_type
    images {
      caption
      url
    }
    links {
      caption
      url
    }
    metadata {
      header
      content
    }
    address
    capacity
    entry_fee
    opening_times
    other_contact
    phone
    contact_email
    url
    lm2_id
  }
  metadata {
    header
    content
  }
  images {
    caption
    url
  }
  links {
    caption
    url
  }
  address
  capacity
  entry_fee
  opening_times
  other_contact
  phone
  contact_email
  url
  lm2_id
}`;

export const locationQuery = (
  graphQlTag(`
    query location(
      $id: ID!
      $context: String
    ) {
        location(
          id: $id
          context: $context
        ) ${locationFields}
    }
  `)
);

export const locationLm2Query = (
  graphQlTag(`
    query locationLm2(
      $lm2_id: UUID!
      $context: String
    ) {
        locationLm2(
          lm2_id: $lm2_id
          context: $context
        ) ${locationFields}
    }
  `)
);

export const locationsQuery = (
  graphQlTag(`
    query locations(
      $context: String
      $project_id: Int
      $category_id: ID
      $building: Boolean
      $limit: Int
      $skip: Int
      $sort: String
      $order: String
    ) {
        locations(
          context: $context
          project_id: $project_id
          category_id: $category_id
          building: $building
          limit: $limit
          skip: $skip
          sort: $sort
          order: $order
        ) {
            id
            project_id
            name
            content_type
            categories {
              id
              name
              icons {
                web_icon
              }
            }
            floor {
              id
              name
              lm2_id
            }
            floors {
              id
              name
              level
              lm2_id
            }
            parent {
              id
              name
              content_type
              lm2_id
            }
            point
            lm2_id
          }
      }
  `)
);

export const searchQuery = (
  graphQlTag(`
    query search(
      $context: String
      $term: String!
      $project_id: Int
      $substring: Boolean
      $limit: Int
      $skip: Int
    ) {
      search(
        context: $context
        term: $term
        project_id: $project_id
        substring: $substring
        limit: $limit
        skip: $skip
      ) {
          id
          name
          display_name
          categories {
              id
              name
          }
          parent {
              id
              name
              content_type
          }
          point
          lm2_id
        }
    }
  `)
);
