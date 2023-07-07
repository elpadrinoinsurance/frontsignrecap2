import { generate } from '@pdfme/generator';
import { FC, useEffect, useState } from 'react'
import { CustomList, MINIMUM_ROW_NUMBER } from '../../../components/List/CustomList'
import { notify } from '../../../components/PDF/helper'
import { openPDF, Template, Base } from '../../../helper';
import { csvFileToArray, getURLParams } from '../helper';
import { CircularProgress } from '@mui/material';

type TemplateProps = {
  templates: any[],
  refetch: Function,
  totalCount: number,
  onImport: Function,
  socketRef: any,
  setTemplates: Function,
  updateTotal: Function,
  isLoading?: boolean
}

export const TemplateList: FC<TemplateProps> = ({
  templates,
  refetch,
  totalCount,
  onImport,
  socketRef,
  setTemplates,
  updateTotal,
  isLoading=false
}) => {
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(MINIMUM_ROW_NUMBER)

    useEffect(() => {
      socketRef.current.on('addTemplate', (template) => {
        updateTotal(val => val + 1)
        if(templates.length >= rowsPerPage) return
        const updatedTemplates = templates.filter(temp => temp._id !== template._id)
        setTemplates([...updatedTemplates, template])
      })

      return () => {
        socketRef.current.off('addTemplate')
      }
    },[templates])

    useEffect(() => {
      refetchItems()
    }, [rowsPerPage, page])

    const refetchItems = async () => {
      const URLParams = getURLParams(page, rowsPerPage)
      await refetch(URLParams)
    }

    const onDeleteTemplate = async (id: string) => {
      const resp = await Template.delete(id)
      if(!resp) return
      notify('Plantilla removida','success')
      await refetchItems()
    }

    const generateTemplatePDF = async (template) => {
      const base = await Base.get(template.base)
      const templateData = {
        ...template,
        basePdf: base.basePdf
      }
      const pdf = await generate({ template: templateData, inputs: templateData.sampledata })
      openPDF(pdf.buffer)
    }

    const handleImport = async (file: File, templateId: string) => {
      if(!fileValidation(file)){
        alert("El archivo seleccionado no es valido")
        return
      }
      const fileReader = new FileReader()
      fileReader.onload = async function(event: ProgressEvent<FileReader>) {
        if(!event.target?.result){
          alert("el csv esta vacio")
          return
        }
        const text = event.target!.result as string
        let dataset = csvFileToArray(text)
        if(dataset[0].inputs["signature"]){
          alert("signature es un nombre reservado, no se puede usar")
          return
        }
        dataset = dataset.map(data => {
          let parsedData = {...data}
          parsedData.inputs = JSON.stringify([parsedData.inputs])
          return parsedData
        })
        const body = { dataset, templateId }
        await onImport(body)
      }
      fileReader.readAsText(file)
    }
  
    const fileValidation = (file: File) => {
      if(file === undefined) return false
      if(file.type !== "text/csv") return false
      return true
    }

    const handlePage = (_, newPage) => {
      setPage(newPage)
    }
  
    const handleRowsPerPage = (e) => {
      setRowsPerPage(Number(e.target.value))
      setPage(0)
    }

    return (
        <div className='list-container'>
          {
            isLoading ?
            <div className='loading'>
              <CircularProgress size={60}/>
            </div>
            :""
          }
          <CustomList
            className='custom-list-container'
            items={templates}
            title={'Plantillas'}
            onDelete={onDeleteTemplate}
            onGetPreview={generateTemplatePDF}
            onImport={handleImport}
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