import { BLANK_PDF, checkTemplate, Designer, Template as TemplateType } from "@pdfme/ui";
import { useEffect, useRef, useState } from "react";
import Button from '@mui/material/Button';
import './EditorViewer.scss'
import { SelectChangeEvent } from "@mui/material";
import { cloneDeep, readFile, notify } from "../helper";
import { CustomSelect } from "../../Select/Select";
import { Base, getRandomString, sendRequest, Template } from "../../../helper";
import { InfoPopup } from "../../InfoPopup/InfoPopup";

type baseItems = {
  _id: string,
  slug: string,
  basePdf: string
}

type templateItems = {
  _id: string,
  slug: string,
  base: string,
  schemas?: Record<string,string>[],
  sampledata?: Record<string,string>[],
  columns?: string[]
}

const blankBase = {basePdf: BLANK_PDF, _id: '1', slug: 'blank'}
const blankTemplate = { basePdf: BLANK_PDF, schemas: [] }
const blankTemplateItem = { _id: '1', slug:"blank", base: '1', schemas: [{}], sampledata: [{}], columns: [] }

export const EditorViewer = () => {
    const designerRef = useRef<HTMLDivElement | null>(null);
    const designer = useRef<Designer | null>(null);
    const [fileKey, setFileKey] = useState<string>(getRandomString())
    const [baseItems, setBaseItems] = useState<baseItems[]>([blankBase])
    const [selectedBase, setSelectedBase] = useState<baseItems>(blankBase)
    const [templateItems, setTemplateItems] = useState<templateItems[]>([blankTemplateItem])
    const [selectedTemplate, setSelectedTemplate] = useState<templateItems>(blankTemplateItem)
    const [open, setOpen] = useState(false);

    useEffect(() => {
      fetchBases()
        .catch(err => console.log(err))

      fetchTemplates()
        .catch(err => console.log(err))
    },[])

    useEffect(() => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template: blankTemplate,
        });
        designer.current.onSaveTemplate(onSaveTemplate);
      }
      return () => {
        if (designer.current) {
          designer.current.destroy();
        }
      };
    }, [designerRef]);

    useEffect(() => {
      if (designer.current) {
        designer.current.updateTemplate(
          Object.assign(cloneDeep(designer.current.getTemplate()), {
            basePdf: selectedBase.basePdf
          })
        );
      }
    },[selectedBase])

    useEffect(() => {
      if (designer.current) {
        const basePdf = baseItems.find(({_id}) => _id === selectedTemplate.base)
        const templateData = {
          schemas: selectedTemplate.schemas,
          sampledata: selectedTemplate.sampledata,
          columns: selectedTemplate.columns,
          basePdf: basePdf?.basePdf
        }
        try{
          checkTemplate(templateData)
          designer.current.updateTemplate(templateData as any)
        }
        catch(err){
          console.log(err)
        }
      }
    },[selectedTemplate])

    const fetchBases = async () => {
      const {docs: data} = await Base.getAll()
      const bases = [ ...data]
      setBaseItems(bases)
      if(bases.length > 0){
        setSelectedBase(bases[0])
      }
    }

    const fetchTemplates = async () => {
      const {docs: data} = await Template.getAll()
      setTemplateItems([ ...data])
    }

    const onChangeBasePDF = async (event: SelectChangeEvent) => {
      const selectedBase = baseItems.find(({_id}) => _id === event.target.value)
      if(selectedBase) setSelectedBase(selectedBase)
    };
  
    const onLoadTemplate = (event: SelectChangeEvent) => {
      const selectedTemplate = templateItems.find(({_id}) => _id === event.target.value)
      if(selectedTemplate){
        const selectedBase = baseItems.find(({_id}) => _id === selectedTemplate.base)
        if(selectedBase) setSelectedBase(selectedBase)
        setSelectedTemplate(selectedTemplate)
      }
    };
  
    const onSaveTemplate = async (template?: TemplateType) => {
      if (designer.current) {
        const template = designer.current.getTemplate()
        const slug = prompt("Ingrese el nombre de la plantilla")
        if(!slug) return
        const sampledata = template.sampledata as Record<string,string>[]
        const data = {
          slug,
          schemas: JSON.stringify(template.schemas),
          sampledata: JSON.stringify(sampledata),
          baseId: selectedBase._id,
          columns: JSON.stringify(Object.keys(sampledata[0]))
        }
        try{
          const link = `${process.env.REACT_APP_BACK_URL}/template`
          const resp = await sendRequest.Post(link, data)
          if(!resp) return
          await fetchTemplates()
          notify('plantilla guardada', 'success')
        }
        catch(err){
          console.log(err)
        }
      }
    };

    const onUploadBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
      if(!e.target || !e.target.files) return
      readFile(e.target.files[0], 'dataURL')
        .then(async (basePdf) => {
          const slug = prompt("Ingrese el nombre de la base PDF")
          if(!slug) return
          const link = `${process.env.REACT_APP_BACK_URL}/base`
          const resp = await sendRequest.Post(link, {basePdf, slug})
          setFileKey(getRandomString())
          if(!resp) return
          await fetchBases()
          notify('base pdf guardada', 'success')
        })
    }
  
    return (
      <div>
        <InfoPopup
          isOpen={open}
          onClose={() => {setOpen(false)}}
          title="Reglas"
        >
          <strong>1.</strong> Para crear una plantilla se requiere que exista un campo tipo imagen llamado signature<br></br>
          <strong>2.</strong> Para agregar campos, ve a la consola en List of Fields y presione 'Add new field' <br></br>
          <strong>3.</strong> la lista debajo de Type muestra los tipos de campos y Name es el nombre del campo <br></br>
          <strong>4.</strong> Puede agregar una nueva base pdf en subir PDF y este puede ser usado en la lista llamado base<br></br>
          <strong>5.</strong> Igualmente, puede cargar plantillas hechas anteriormente y guardarlas como uno nuevo <br></br>
          <strong>Nota:</strong> preferiblemente dimensione el tamaño del campo signature de forma algo horizontal,
          para que la firma no se alargue o estire de mas<br></br>
          <strong>Nota 2:</strong> Si no existen bases, entonces debe subir pdfs primero antes de que te deje guardar plantilla
        </InfoPopup>
        <header className="editorHeader">
          <strong>Designer</strong>
          <CustomSelect
            name={"base"}
            items={baseItems}
            selectedItem={selectedBase}
            onChange={onChangeBasePDF}
          />
          <CustomSelect
            name={"plantilla"}
            items={templateItems}
            selectedItem={selectedTemplate}
            onChange={onLoadTemplate}
          />
          <input
            key={fileKey}
            onChange={onUploadBasePDF}
            accept="application/pdf"
            style={{ display: 'none' }}
            id="upload-base-pdf"
            type="file"
          />
          <label htmlFor="upload-base-pdf">
            <Button variant="outlined" component="div" color='success'>
              Subir PDF
            </Button>
          </label> 
          <Button 
            onClick={() => onSaveTemplate()} 
            variant="outlined" 
            color="success"
            disabled={selectedBase === blankBase}
          >
            Guardar Plantilla
          </Button>

          <Button onClick={() => {setOpen(true)}} variant="outlined" color="success">
            ?
          </Button>
        </header>
        <div ref={designerRef} />
      </div>
    );
  }