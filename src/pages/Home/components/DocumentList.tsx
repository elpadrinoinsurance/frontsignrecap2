import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import { generate } from '@pdfme/generator';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import { FC, useEffect, useState } from 'react'
import { CustomList, MINIMUM_ROW_NUMBER } from '../../../components/List/CustomList'
import { notify } from '../../../components/PDF/helper'
import { Document, Template, Base, openPDF } from '../../../helper';
import { getURLParams } from '../helper';

type DocumentProps = {
  documents: any[],
  refetch: Function,
  totalCount: number,
  socketRef: any,
  setDocument: Function,
  updateTotal: Function,
  isLoading?: boolean,
  setIsLoading?: Function
}

type document = {
  _id: string,
  slug: string,
  inputs: Record<string,string>[],
  signature: boolean|null,
}

export const DocumentList: FC<DocumentProps> = ({
  documents,
  refetch,
  totalCount,
  socketRef,
  setDocument,
  updateTotal,
  isLoading= false,
  setIsLoading=() => {}
}) => {
    const [open, setOpen] = useState<boolean>(false)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(MINIMUM_ROW_NUMBER)

    useEffect(() => {
      socketRef.current.on('addDoc', (doc) => {
        updateTotal(val => val + 1)
        if(documents.length >= rowsPerPage) return
        const updatedDocs = documents.filter(document => document._id !== doc._id)
        setDocument([...updatedDocs, doc])
      })

      socketRef.current.on('addDocsBatch', (docs: Array<any>) => {
        updateTotal(val => val + docs.length)
        if(documents.length >= rowsPerPage) return
        let updatedDocs = [...documents]
        for(const doc of docs){
          updatedDocs = updatedDocs.filter(document => document._id !== doc._id)
          if(updatedDocs.length < rowsPerPage){
            updatedDocs = [...updatedDocs, doc]
          }
        }
        setDocument([...updatedDocs])
      })
  
      return () => {
        socketRef.current.off('addDoc')
        socketRef.current.off('addDocsBatch')
      }
    },[documents])

    useEffect(() => {
      refetchItems()
    }, [rowsPerPage, page])

    const refetchItems = async () => {
      const URLParams = getURLParams(page, rowsPerPage)
      await refetch(URLParams)
    }

    const onDeleteDocument = async (id: string) => {
      const resp = await Document.delete(id)
      if(!resp) return
      notify('Documento removido','success')
      await refetchItems()
    }

    const onDeleteAllDocuments = async () => {
      const resp = await Document.deleteAll()
      if(!resp) return
      notify('Todos tus documentos fueron eliminados', 'success')
      await refetchItems()
      handleClose()
    }

    const onDownload = async () => {
      setIsLoading(true)
      const {documents, templates, bases} = await Document.download()
      if(documents.length === 0){
        setIsLoading(false)
        alert("no existen documentos por descargar")
        return
      }
      const zip = new JSZip()
      const folder = zip.folder("content") as JSZip
      let count = 1
      for(const doc of documents){
        const template = templates.find(temp => temp._id === doc.template)
        const base = bases.find(base => base._id === template.base)
  
        const templateData = {
          ...template,
          basePdf: base.basePdf
        }
        const pdf = await generate({ template: templateData, inputs: doc.inputs });
        const blob = new Blob([pdf.buffer], { type: "application/pdf" })
        folder.file(`${count++}-${doc.slug.replaceAll(/\//g,"-")}.pdf`, blob)
      }
      zip.generateAsync({type:"blob"}).then(function(content) {
        saveAs(content, "documentos.zip")
        setIsLoading(false)
      })
    }

    const onGetLink = async (doc: document) => {
      const path = Document.getSignatureLink(doc._id)
      await navigator.clipboard.writeText(path)
      notify('Copiado al portapapeles','success')
    }

    const generatePDF = async (doc: document) => {
      const document = await Document.get(doc._id)
      const template = await Template.get(document.template)
      const base = await Base.get(template.base)
  
      const templateData = {
        ...template,
        basePdf: base.basePdf
      }
      const pdf = await generate({ template: templateData, inputs: document.inputs });
      openPDF(pdf.buffer)
    }

    const handlePage = (_, newPage) => {
      setPage(newPage)
    }
  
    const handleRowsPerPage = (e) => {
      setRowsPerPage(Number(e.target.value))
      setPage(0)
    }

    const handleClose = () => setOpen(false)
    const handleOpen = () => setOpen(true)  

    return (
        <div className='list-container'>
          {
            isLoading ?
            <div className='loading'>
              <CircularProgress size={60}/>
            </div>
            :""
          }
          <Popup
            open={open}
            handleClose={handleClose}
            handleAccept={onDeleteAllDocuments}
          />
          <CustomList
            className='custom-list-container'
            items={documents}
            title={'Documentos'}
            isDocument={true}
            onDelete={onDeleteDocument}
            onGetPreview={generatePDF}
            onGetLink={onGetLink}
            onClear={handleOpen}
            onDownload={onDownload}
            page={page}
            rowsPerPage={rowsPerPage}
            handlePage={handlePage}
            handleRowsPerPage={handleRowsPerPage}
            totalCount={totalCount}
            onUpdate={refetchItems}
          />
        </div>
    )
}

type BasicPrompt = {
  open: boolean,
  handleClose: any,
  handleAccept: any
}

const Popup: FC<BasicPrompt> = ({
  open,
  handleClose,
  handleAccept
}) => {
  return (
    <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estas seguro de eliminar todos tus documentos?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined" autoFocus>cancelar</Button>
          <Button onClick={handleAccept} variant="contained" color='error'>
            aceptar
          </Button>
        </DialogActions>
      </Dialog>
  )
}