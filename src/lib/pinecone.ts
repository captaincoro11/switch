import { Pinecone } from '@pinecone-database/pinecone'

export const getPineconeClient = async () => {
  const client = new Pinecone({
    apiKey: '08e2b8dc-2479-473d-b7e4-f1f49d206d64'

  })
 return client
}