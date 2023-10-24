import { gql } from 'urql'

export const collectionQuery = gql`
  query ($orgId: String!, $collectionId: String!) {
    organisation(id: $orgId) {
      organisationName
      collections(where: { id: $collectionId }) {
        collectionName
        fieldNames
        documents {
          id
          contract
          retired
          fieldNames
          fieldValues
          fieldDataTypes
        }
      }
    }
  }
`
