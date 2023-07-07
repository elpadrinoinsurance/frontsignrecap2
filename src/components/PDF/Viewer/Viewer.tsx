import { BLANK_PDF, checkTemplate, Template as TemplateType } from "@pdfme/ui";
import { useEffect, useRef, useState } from "react";
import { useViewer } from "../hooks";
import { Box, Button, Typography } from "@mui/material";
import './Viewer.scss'
import { useParams } from "react-router-dom";
import SignatureCanvas from 'react-signature-canvas'
import { notify } from "../helper";
import { sendRequest, Document, Template, Base } from "../../../helper";
import { InfoPopup } from "../../InfoPopup/InfoPopup";

export const Viewer = () => {
    const [sigPad, setSigPad] = useState<SignatureCanvas|null>(null)
    const [signature, setSignature] = useState<string|null>(null)
    const {documentId} = useParams<{documentId: string}>()
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const [template, setTemplate] = useState<TemplateType>({ basePdf: BLANK_PDF, schemas: [] });
    const [inputs, setInputs] = useState<Record<string,string>[]>([{}]);
    const viewer = useViewer({ viewerRef, template, inputs });

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    useEffect(() => {
      const fetchDocument = async () => {
        const document = await Document.get(documentId)
        const template = await Template.get(document.template)
        const base = await Base.get(template.base)

        const templateData = {
          schemas: template.schemas,
          sampledata: template.sampledata,
          columns: template.columns,
          basePdf: base.basePdf
        }
        try{
          checkTemplate(templateData)
          setTemplate(templateData as any)
          setInputs(document.inputs)
        }
        catch(err){
          console.log(err)
        }
      }

      fetchDocument()
        .catch(err => console.log(err))
    },[])

    const onSaveDocument = () => {
      const signature = sigPad!.getTrimmedCanvas().toDataURL('image/png')
      let newInputs = [...inputs]
      newInputs[0].signature = signature
      setInputs(newInputs)
      setSignature(signature)  
      handleClose()
    }

    const onSendSignature = async () => {
      const data = {signature}
      const link = `${process.env.REACT_APP_BACK_URL}/document/${documentId}`
      const resp = await sendRequest.Post(link, data)
      if(!resp) return
      notify("firma enviada", 'success')
    }

    const onClearSignature = () => {
      sigPad?.clear()
    }
  
    return (
      <div>
        <header className="editorHeader">
          <Typography variant="h6">
            Viewer
          </Typography>
          <Button onClick={handleOpen} variant="outlined" color="success">
            Firme Aqui
          </Button>
          <Button onClick={onSendSignature} variant="contained" color="success" disabled={signature ? false : true}>
            Enviar
          </Button>
        </header>
        <InfoPopup
          isOpen={open}
          onClose={() => {setOpen(false)}}
          title="Firme aqui:"
        >
          <Box sx={{border: 1}}>
            <SignatureCanvas
              penColor='black'
              canvasProps={{className: 'sigCanvas'}}
              ref={(ref) => {setSigPad(ref)}}
            />
          </Box>
          <Box sx={{pt: 2, display: 'flex', justifyContent: 'space-around'}}>
            <Button onClick={onClearSignature} variant="outlined" color="primary">
              Limpiar
            </Button>
            <Button onClick={onSaveDocument} variant="contained" color="success">
              Firmar
            </Button>
          </Box>
        </InfoPopup>
        <section style={{ background: 'rgb(74, 74, 74)' }}>
          <div ref={viewerRef}></div>
        </section>
      </div>
    );
  };