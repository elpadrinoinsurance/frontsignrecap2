import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Viewer } from '../../components/PDF/Viewer/Viewer';
import axios from 'axios'

export function SignatureViewer() {
  const {documentId} = useParams<{documentId: string}>()
  const [isViewable, setIsViewable] = useState(false)
  const history = useHistory()

  useEffect(() => {
    const checkIdValidity = async () => {
      const linkDocument = `${process.env.REACT_APP_BACK_URL}/document/${documentId}`
      axios.get(linkDocument)
        .then(() => {
          setIsViewable(true)
        })
        .catch(() => {
          history.push("/")
        })
    }

    checkIdValidity()
  },[])

  return (
    <>
      {
        isViewable? 
        <div className="App">
          <main>
            <Viewer/>
          </main>
        </div>
        :
        ""
      }
    </>
  );
}
