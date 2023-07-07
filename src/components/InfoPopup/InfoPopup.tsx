import { Box, Modal, Typography } from "@mui/material"

type Props = {
    onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
    isOpen: boolean;
    title: string;
    children?: React.ReactNode;
}

export const InfoPopup = ({
    onClose,
    isOpen,
    title,
    children
}: Props) => {
    return (
        <Modal
        open={isOpen}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute' as 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <Box id="modal-modal-description" sx={{ mt: 2 }}>
            {children}
          </Box>
        </Box>
      </Modal>
    )
}