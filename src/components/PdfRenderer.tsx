"use client"
import { ChevronDown, ChevronUp, Loader2, RotateCw, Search } from 'lucide-react'
import {Document, Page, pdfjs} from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'
import {useResizeDetector} from 'react-resize-detector'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState } from 'react'
import {useForm} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { DropdownMenuContent } from './ui/dropdown-menu'
import SimpleBar from 'simplebar-react'
import PdfFullScreen from './PdfFullScreen'


interface PdfRendererProps{
    url:string,
}
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

const PdfRenderer =({url}:PdfRendererProps)=>{
    const[numPages,setnumPages] = useState<number>();
    
    const [currPage,setCurrPage] = useState<number>(1);
    const [scale,setScale] = useState<number>(1)
    const [rotation,setRotation] = useState<number>(0);
    const [renderedScale , setRenderedScale] = useState<number|null>(null);

    const scaling = (x:number)=>{
        setScale(x)
    }

    const isLoading = renderedScale!==scale

    const customPageValidator = z.object({
        page: z.string().refine((num)=> Number(num)>0 && Number(num)<=numPages!)

    });

   

    type TcustomPageValidator = z.infer<typeof customPageValidator>

    const {
        register,
        handleSubmit,
        formState:{errors},
        setValue
    } = useForm<TcustomPageValidator>({

        defaultValues:{
            page:'1'
        },
        resolver:zodResolver(customPageValidator)
    });

    const handlePageSubmit =({
        page
    }:TcustomPageValidator)=>{
        setCurrPage(Number(page));
        setValue('page',String(page));
    }



    const {toast} = useToast();
    const {width,ref} = useResizeDetector();
    return(
        <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
            <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Button   disabled={currPage<=1} onClick={()=>{
                        setCurrPage((prev)=>(prev-1?prev-1:1));
                        setValue('page',String(currPage-1))
                    }} variant='ghost' aria-label='previous page' >
                        <ChevronDown className='h-4 w-4'/>
                    </Button>
                    <div className='flex items-center gap-1.5 '>
                    <Input onKeyDown={(e)=>{
                        if(e.key==='Enter'){
                            handleSubmit(handlePageSubmit)();
                        }
                        }} {...register('page')} className={cn('w-12 h-8',errors.page && 'focus-visible:ring-red-500')}/>
                    <p className=' text-zinc-500 text-sm space-x-1'>
                    <span>/</span>
                    <span>{numPages ?? 'x'}</span>
                    </p>
                </div>

                <Button disabled={
                    numPages===undefined || 
                    currPage === numPages
                } onClick={()=>{
                    setCurrPage((prev)=>
                        prev+1>numPages! ? numPages! : prev+1
                    );
                    setValue('page',String(currPage+1))
                }} variant='ghost' aria-label='previous page'>
                        <ChevronUp className='h-4 w-4'/>
                    </Button>
                
                </div>
             <div className='space-x-2'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className='gap-1.5' aria-label='zoom' variant='ghost'>
                            <Search className='h-4 w-4'/>
                            {scale*100}%<ChevronDown className='h-3 w-3 opacity-50'/>
                        </Button>

                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={()=> setScale(1)}>
                            100%
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={()=> setScale(1.5)}>
                            150%
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={()=> setScale(2)}>
                            200%
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={()=> setScale(2.5)}>
                            250%
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={()=>setRotation((prev)=>prev+90)} aria-label='rotate 90 degrees'>
                    <RotateCw className='h-4 w-4' />

                </Button>
                <PdfFullScreen fileUrl={url}/>

             </div>

            </div>

            <div className="flex-1 w-full max-h-screen">
                <SimpleBar autoHide={false} className='max-h-[calc(100vh-10rem)]'>
                <div ref={ref}>
                    <Document onLoadSuccess={({numPages})=>{
                        setnumPages(numPages)
                    }}
                     onLoadError={()=>{
                        toast({
                            title:"Error Loading PDF",
                            description:"Please try again later",
                            variant:'destructive'
                        })

                    }} loading={
                        <div className='flex justify-center '>
                            <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                        </div>
                    }  file={url} className='max-h-full '>
                        {
                            isLoading && renderedScale?(
                        <Page key={"@"+renderedScale} rotate={rotation} scale={scale} width={width?width:1} pageNumber={currPage} />

                            ):null
                        }
                        <Page
                        key={"@"+scale}
                        loading={
                            <div className='flex justify-center'>
                                <Loader2 className='my-24 h-6 w-6 animate-spin'/>

                            </div>
                        }
                        onRenderSuccess={()=>setRenderedScale(scale)}
                        className={cn(isLoading?"hidden":"")} rotate={rotation} scale={scale} width={width?width:1} pageNumber={currPage} />


                    </Document>
                </div>
                </SimpleBar>

            </div>
            
        </div>
    )
}

export default PdfRenderer


