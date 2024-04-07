import { trpc } from '@/app/_trpc/client'
import { INFINITE_QUERY } from '@/config/infiinite-query'
import { keepPreviousData } from '@tanstack/react-query'
import { Loader2, MessageSquare } from 'lucide-react'
import React, { useEffect } from 'react'
import Skeleton from 'react-loading-skeleton'
import Message from './Message'
import {useIntersection} from '@mantine/hooks'
import { useRef } from 'react'

interface MessageProps {
  fileId:string
}





const Messages = ({fileId}:MessageProps) => {

  const {data,isLoading,fetchNextPage} = trpc.getFileMessages.useInfiniteQuery({
    fileId,
    limit:INFINITE_QUERY,
  },{
    getNextPageParam:(lastPage)=>lastPage?.nextCursor,

    
  });

  const lastMessageRef = useRef<HTMLDivElement>(null);


  const loadingMessage = {
    createdAt:new Date().toISOString(),
    id:'loading-message',
    isUserMessage:false,
    text:(
      <span className='flex h-full items-center justify-center'>
        <Loader2 className='h-4 w-4 animate-spin'/>


      </span>
    )
  }

  const messages = data?.pages.flatMap((page)=>page.messages)

  const combinedMessages = [
    ...(true? [loadingMessage]:[]),
    ...(messages ??[])
  ];
  const {ref,entry} = useIntersection({
    root:lastMessageRef.current,
    threshold:1
  });

  useEffect(()=>{
    if(entry?.isIntersecting){
      fetchNextPage()
    }
  },[entry,fetchNextPage])
  return (
    <div className='flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded-scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch'>
      {combinedMessages && combinedMessages.length>0?(
        combinedMessages.map((message,i)=>{
          const isNextmessagesameperson = combinedMessages[i-1]?.isUserMessage === combinedMessages[i]?.isUserMessage
          if(i === combinedMessages.length-1)
          return <Message ref={ref} key={message.id} isNextmessagesameperson={isNextmessagesameperson} message={message}/>
          else 
          return <Message key={message.id} isNextmessagesameperson={isNextmessagesameperson} message={message}/>
        })
      ):isLoading?(<div className='w-full flex flex-col gap-2'>
        <Skeleton className='h-16'/>
        <Skeleton className='h-16'/>
        <Skeleton className='h-16'/>
        <Skeleton className='h-16'/>


      </div>):
      (
        <div className='flex-1 flex flex-col items-center justify-center gap-2'>
          <MessageSquare className='h-8 w-8 text-blue-500'/>
          <h3 className='font-semibold text-xl'>You&apos;re all set</h3>
        </div>
      )
      }

      
    </div>
  )
}

export default Messages
