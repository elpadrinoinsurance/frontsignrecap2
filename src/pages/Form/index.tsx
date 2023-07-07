import { Box } from '@mui/material';
import { Navbar } from '../../components/Navbar/Navbar';
import { FormViewer } from '../../components/PDF/Form/FormViewer';

export function FormPage() {

  return (
    <>
      <Navbar/>
      <Box className="form-viewer" sx={{pt: 8}}>
        <FormViewer/>
      </Box>
    </>
  );
}
