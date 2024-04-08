import { db } from '@/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import {
  createUploadthing,
  type FileRouter,
} from 'uploadthing/next'

import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PineconeStore } from '@langchain/pinecone'
import { getPineconeClient } from '@/lib/pinecone'


const f = createUploadthing()

const middleware = async () => {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) throw new Error('Unauthorized')


  return {  userId: user.id }
}

const onUploadComplete = async ({
  metadata,
  file,
}: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key: string
    name: string
    url: string
  }
}) => {
 


  
   const createdFile =    await db.file.create({
      data: {
        key: file.key,
        name: file.name,
        userId: metadata.userId,
        url: file.url,
        uploadStatus: 'SUCCESS',
      },
    });
    try {

    const response = await fetch(
       file.url
    )

    const blob = await response.blob()

    const loader = new PDFLoader(blob)

    const pageLevelDocs = await loader.load()

    const pagesAmt = pageLevelDocs.length

    const pinecone = await getPineconeClient()
    const pineconeIndex = pinecone.Index('quill')

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    await PineconeStore.fromDocuments(
      pageLevelDocs,
      embeddings,
      {
        pineconeIndex,
        namespace: createdFile.id,
      }
    )

    await db.file.update({
      data: {
        uploadStatus: 'SUCCESS',
      },
      where: {
        id: createdFile.id,
      },
    })
  
  


}

catch(err){
  console.log(err)
}

}

  


    
  
    


export const ourFileRouter = {
  freePlanUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: '16MB' } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter


export type OurFileRouter = typeof ourFileRouter
