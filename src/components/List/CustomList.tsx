import { Delete, Visibility, Link as LinkIcon, Circle, ImportExport, RestartAlt } from "@mui/icons-material"
import { Typography, Button, List, ListItem, IconButton, ListItemIcon, ListItemText, TablePagination } from "@mui/material"
import { ChangeEventHandler, FC, useState } from "react"
import { getRandomString } from "../../helper"
import './style.scss'

type item = {
    _id: string,
    slug: string,
    [key: string]: string|Record<string,string>[]|null|boolean
}

type Props = {
    items: item[],
    title: string,
    onGetLink?: Function,
    onGetPreview: Function,
    onDelete: Function,
    isDocument?: boolean,
    onImport?: Function | null,
    className?: string,
    onClear?: Function | null,
    onDownload?: Function | null,
    totalCount: number,
    rowsPerPage: number,
    handlePage: (event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null, page: number) => void,
    handleRowsPerPage: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    page: number,
    onUpdate?: Function | null
}

export const MINIMUM_ROW_NUMBER = 6
export const ROWS_PER_PAGE = [MINIMUM_ROW_NUMBER, 12, 20, 40]

export const CustomList: FC<Props> = ({
  items,
  title,
  isDocument=false,
  onGetLink=()=>{},
  onImport= null,
  onDelete,
  onGetPreview,
  className,
  onClear= null,
  onDownload= null,
  totalCount,
  rowsPerPage,
  handlePage,
  handleRowsPerPage,
  page,
  onUpdate= null
}) => {
    const [fileKey, setFileKey] = useState<string>(getRandomString());
    const onImportFile = async (e: React.ChangeEvent<HTMLInputElement>, itemId: string) => {
      if(onImport !== null) {
        if(e.target.files?.length === 0) return
        const file = e.target.files![0]
        await onImport(file, itemId)
        setFileKey(getRandomString())
      }
    }

    return (
        <div className={`container ${className}`}>
          <div className="title-section">
            <Typography variant="h6" className='container-title'>
              {title}
            </Typography>
            <div className="buttons">
            {
              onClear ?
              <Button 
                onClick={() => onClear()} 
                color="error" 
                variant="contained" 
              >
                Limpiar
              </Button>
              :
              ""
            }
            {
              onDownload ?
              <Button 
                onClick={() => onDownload()} 
                color="success" 
                variant="contained" 
              >
                Descargar
              </Button>
              :""
            }
            {
              onUpdate ?
              <IconButton onClick={() => {onUpdate()}}>
                <RestartAlt/>
              </IconButton>
              :""
            }
            </div>
          </div>
          <List className='list' sx={{ width: '100%', maxWidth: 500, height: 300, overflow: 'auto', bgcolor: 'background.paper' }}>
            {items.map((item) => (
              <ListItem
                className='list-item'
                key={item._id}
                disableGutters
                secondaryAction={
                  <>
                    {
                      isDocument ?
                      <IconButton onClick={() => {onGetLink(item)}} aria-label="getLink">
                        <LinkIcon />
                      </IconButton>
                      :
                      ''
                    }
                    {
                      onImport ?
                      <>
                        <label htmlFor={`upload-csv-${item._id}`}>
                          <IconButton component="div">
                            <ImportExport />
                          </IconButton>
                        </label>
                        <input
                          onChange={(e) => onImportFile(e, item._id)}
                          key={fileKey}
                          accept=".csv"
                          style={{ display: 'none' }}
                          id={`upload-csv-${item._id}`}
                          type="file"
                        />
                      </>
                      :
                      ''
                    }
                    <IconButton onClick={() => {onGetPreview(item)}} aria-label="preview">
                      <Visibility />
                    </IconButton>
                    <IconButton onClick={() => {onDelete(item._id)}} aria-label="delete">
                      <Delete />
                    </IconButton>
                  </>
                }
              >
                <ListItemIcon>
                  {
                    isDocument ? <Circle color={`${item.signature ? 'success' : 'error'}`} /> : ''
                  }
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{fontSize: '.9em'}} primary={`${item.slug}`} />
              </ListItem>
            ))}
          </List>
          <TablePagination
            component="div"
            rowsPerPageOptions={[...ROWS_PER_PAGE]}
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePage}
            onRowsPerPageChange={handleRowsPerPage}
        />
        </div>
    )
}