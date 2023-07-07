import { Box } from '@mui/material';
import { Navbar } from '../../components/Navbar/Navbar';
import { EditorViewer } from '../../components/PDF/Editor/EditorViewer'

export function DesignerViewer() {
  return (
    <>
      <Navbar/>
      <Box className="designer-viewer" sx={{pt: 8}} >
        <EditorViewer/>
      </Box>
    </>
  );
}
