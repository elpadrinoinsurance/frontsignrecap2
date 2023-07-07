import { useEffect, useRef, useState } from 'react';
import './style.scss'
import { notify } from '../../components/PDF/helper';
import { Base, Template, Document, verifySession, routes, getUserId, getRol, roles } from '../../helper';
import { Navbar } from '../../components/Navbar/Navbar';
import { useHistory } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {socket} from '../../service/socket'
import { DocumentList } from './components/DocumentList';
import { TemplateList } from './components/TemplateList';
import { BaseList } from './components/BaseList';
import { MINIMUM_ROW_NUMBER } from '../../components/List/CustomList';

type document = {
  _id: string,
  slug: string,
  inputs: Record<string,string>[],
  signature: boolean|null
}

const DEFAULT_PARAMS = `limit=${MINIMUM_ROW_NUMBER}&page=0`

export function HomePage() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false)
  const [documents, setDocuments] = useState<document[]>([])
  const [totalDocCount, setTotalDocCount] = useState<number>(0)
  const [isDocLoading, setIsDocLoading] = useState<boolean>(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [totalTemplateCount, setTotalTemplateCount] = useState<number>(0)
  const [isTemplateLoading, setIsTemplateLoading] = useState<boolean>(false)
  const [bases, setBases] = useState<any[]>([])
  const [totalBaseCount, setTotalBaseCount] = useState<number>(0)
  const [isBaseLoading, setIsBaseLoading] = useState<boolean>(false)
  const history = useHistory()
  const socketRef = useRef<any>()
  
  useEffect(() => {
    verifySession(false, history, routes.dashboard)
      .then(async () => {
        try{
          await getDocuments()
          await getTemplates()
          await getBases()
          setIsLoaded(true)
        }
        catch(err){
          console.log(err)
        }
      })
      .catch(err => {
        console.log("jeje=", err)
      })

    socketRef.current = socket

    socketRef.current.on('connect', () => {
      console.log('connected')
      const rol = localStorage.getItem("rol")
      socketRef.current.emit('register', rol)
    })

    socketRef.current.on('disconnect', () => {
      console.log('disconnected')
    })

    return () => {
      socketRef.current.off('connect')
      socketRef.current.off('disconnect')
    }
  },[])

  useEffect(() => {
    socketRef.current.on('updateDoc', (docId: string) => {
      const updatedDocs = documents.map(doc => {
        if(doc._id === docId) return {...doc, signature: true}
        return doc
      })
      setDocuments(updatedDocs)
    })

    socketRef.current.on('deleteAllDoc', (docIds: Array<{_id: string}>) => {
      const updatedDocs = documents.filter(doc => !docIds.some(docId => docId._id === doc._id))
      setDocuments(updatedDocs)
    })

    socketRef.current.on('deleteDoc', ({id, madeBy}) => {
      const updatedDocs = documents.filter(doc => doc._id !== id)
      setDocuments(updatedDocs)
      const userId = getUserId()
      const rol = getRol()
      if(userId === madeBy || rol === roles.ADMIN){
        setTotalDocCount(val => val - 1)
      }
    })

    socketRef.current.on('deleteBase', ({id, madeBy}) => {
      const updatedBases = bases.filter(base => base._id !== id)
      setBases(updatedBases)
      const userId = getUserId()
      const rol = getRol()
      if(userId === madeBy || rol === roles.ADMIN){
        setTotalBaseCount(val => val - 1)
      }
    })

    socketRef.current.on('deleteTemplate', ({id, madeBy}) => {
      const updatedTemplates = templates.filter(temp => temp._id !== id)
      setTemplates(updatedTemplates)
      const userId = getUserId()
      const rol = getRol()
      if(userId === madeBy || rol === roles.ADMIN){
        setTotalTemplateCount(val => val - 1)
      }
    })

    return () => {
      socketRef.current.off('updateDoc')
      socketRef.current.off('deleteDoc')
      socketRef.current.off('deleteBase')
      socketRef.current.off('deleteTemplate')
      socketRef.current.off('deleteAllDoc')
    }
  },[documents, templates, bases])

  const getDocuments = async (params: string = DEFAULT_PARAMS) => {
    setIsDocLoading(true)
    const {docs: documents, totalDocs} = await Document.getAll(params)
    setDocuments(documents)
    setTotalDocCount(totalDocs)
    setIsDocLoading(false)
  }

  const getTemplates = async (params: string = DEFAULT_PARAMS) => {
    setIsTemplateLoading(true)
    const {docs: templates, totalDocs} = await Template.getAll(params)
    setTemplates(templates)
    setTotalTemplateCount(totalDocs)
    setIsTemplateLoading(false)
  }

  const getBases = async (params: string = DEFAULT_PARAMS) => {
    setIsBaseLoading(true)
    const {docs: bases, totalDocs} = await Base.getAll(params)
    setBases(bases)
    setTotalBaseCount(totalDocs)
    setIsBaseLoading(false)
  }

  const onImport = async (body: {dataset: any, templateId: string}) => {
    const resp = await Document.insertBatch(body)
    if(!resp) return
    notify('Importacion completada','success')
    await getDocuments()
  }

  return (
    <>
      {
        isLoaded ?
          <>
            <Navbar/>
            <div className="home-main">
              <div className='lists-area'>
                <DocumentList
                  isLoading={isDocLoading}
                  documents={documents}
                  refetch={getDocuments}
                  totalCount={totalDocCount}
                  socketRef={socketRef}
                  setDocument={setDocuments}
                  updateTotal={setTotalDocCount}
                  setIsLoading={setIsDocLoading}
                />
                <TemplateList
                  isLoading={isTemplateLoading}
                  onImport={onImport}
                  refetch={getTemplates}
                  templates={templates}
                  totalCount={totalTemplateCount}
                  socketRef={socketRef}
                  setTemplates={setTemplates}
                  updateTotal={setTotalTemplateCount}
                />
                <BaseList
                  isLoading={isBaseLoading}
                  bases={bases}
                  refetch={getBases}
                  totalCount={totalBaseCount}
                  socketRef={socketRef}
                  setBases={setBases}
                  updateTotal={setTotalBaseCount}
                />
              </div>
            </div>
          </>
        :
          <div className='loading'>
            <CircularProgress size={60}/>
          </div>
      }
    </>
  );
}
