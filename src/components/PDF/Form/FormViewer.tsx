import { BLANK_PDF, checkTemplate, Template as TemplateType } from "@pdfme/ui";
import { useEffect, useRef, useState } from "react";
import { useForm } from "../hooks";
import { Button, SelectChangeEvent } from "@mui/material";
import './FormViewer.scss'
import { CustomSelect } from "../../Select/Select";
import { notify } from "../helper";
import { Base, sendRequest, Template, Document } from '../../../helper'
import { InfoPopup } from "../../InfoPopup/InfoPopup";

type templateItems = {
  _id: string,
  slug: string,
  base: string,
  schemas?: Record<string,string>[],
  sampledata?: Record<string,string>[],
  columns?: string[]
}

type baseItems = {
  _id: string,
  slug: string,
  basePdf: string
}
const blankTemplateItem = { _id: '1', base: '1', slug: 'blank', schemas: [{}], sampledata: [{}], columns: [] }
const blankBase = {basePdf: BLANK_PDF, _id: '1', slug: 'blank'}

export const FormViewer = () => {
    const formRef = useRef<HTMLDivElement | null>(null);
    const [template, setTemplate] = useState<TemplateType>({ basePdf: BLANK_PDF, schemas: [] });
    const [baseItems, setBaseItems] = useState<baseItems[]>([blankBase])
    const [templateItems, setTemplateItems] = useState<templateItems[]>([blankTemplateItem])
    const [selectedTemplate, setSelectedTemplate] = useState<templateItems>(blankTemplateItem)
    const [signatureLink, setSignatureLink] = useState<string|null>(null)
    const form = useForm({ formRef, template });
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const fetchBases = async () => {
        const {docs: bases} = await Base.getAll()
        setBaseItems(bases)
      }

      const fetchTemplates = async () => {
        const {docs: data} = await Template.getAll()
        setTemplateItems([...data])
      }

      fetchBases()
        .catch(err => console.log(err))

      fetchTemplates()
        .catch(err => console.log(err))
    },[])

    useEffect(() => {
      if(templateItems[0]._id !== "1" && baseItems[0]._id !== "1"){
        setSelectedTemplate(templateItems[0])
      }
    }, [templateItems, baseItems])

    useEffect(() => {
      if (form) {
        const basePdf = baseItems.find(({_id}) => _id === selectedTemplate.base)
        const templateData = {
          schemas: selectedTemplate.schemas,
          sampledata: selectedTemplate.sampledata,
          columns: selectedTemplate.columns,
          basePdf: basePdf?.basePdf
        }
        try{
          checkTemplate(templateData)
          setTemplate(templateData as any)
        }
        catch(err){
          console.log(err)
        }
      }
    },[selectedTemplate])

    const onLoadTemplate = (event: SelectChangeEvent) => {
      const selectedTemplate = templateItems.find(({_id}) => _id === event.target.value)
      if(selectedTemplate) setSelectedTemplate(selectedTemplate)
    };

    const onSaveDocument = async () => {
      const slug = prompt("Ingrese el nombre del Documento")
      if(!slug) return
      const document = {
        slug,
        templateId: selectedTemplate._id,
        inputs: JSON.stringify(form?.getInputs())
      }
      const link = `${process.env.REACT_APP_BACK_URL}/document`
      const doc = await sendRequest.Post(link, document)
      if(!doc) return
      const path = Document.getSignatureLink(doc._id)
      setSignatureLink(path)
      notify('Documento guardado', 'success') 
    }

    const onGetShareLink = async () => {
      await navigator.clipboard.writeText(signatureLink as string)
      notify('Copiado al portapapeles','success')
    }
  
    return (
      <div>
        <InfoPopup
          isOpen={open}
          onClose={() => {setOpen(false)}}
          title="Reglas"
        >
          <strong>1.</strong> Debe seleccionar la plantilla requerida y llenar sus campos<br></br>
          <strong>2.</strong> Todos los campos exceptuando el campo de la firma "Signature"<br></br>
          <strong>3.</strong> Una vez rellenado, presione Guardar Documento<br></br>
          <strong>4.</strong> Una vez guardado, presione en compartir enlace para copiar el enlace
          que se le enviara al cliente para que firme<br></br>
          <strong>5.</strong> puede regresar al inicio y esperar a que el documento sea firmado,
          puede observarlo por el color en la lista de documentos, verde firmado y rojo en espera.<br></br>
          <strong>Nota:</strong> No se permitira crear documentos si no hay plantillas listas
        </InfoPopup>
        <header className="editorHeader">
          <strong>Formulario</strong>
          <CustomSelect
            name={'plantilla'}
            selectedItem={selectedTemplate}
            items={templateItems}
            onChange={onLoadTemplate}
          />
          <Button 
            onClick={onSaveDocument} 
            variant="outlined" 
            color="success"
            disabled={selectedTemplate === blankTemplateItem}
            >
            Guardar Documento
          </Button>
          <Button onClick={onGetShareLink} variant="outlined" color="success" disabled={signatureLink ? false:true}>
            Compartir Enlace
          </Button>
          <Button onClick={()=>{setOpen(true)}} variant="outlined" color="success">
            ?
          </Button>
        </header>
        <section style={{ background: 'rgb(74, 74, 74)' }}>
          <div ref={formRef}></div>
        </section>
      </div>
    );
  };