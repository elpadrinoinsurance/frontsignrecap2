import { FC, useEffect, useState } from 'react'
import { CustomList, MINIMUM_ROW_NUMBER } from '../../../components/List/CustomList'
import { notify } from '../../../components/PDF/helper'
import { Base, openPDF } from '../../../helper';
import { getURLParams } from '../helper';
import { CircularProgress } from '@mui/material';

type BaseProps = {
  bases: any[],
  refetch: Function,
  totalCount: number,
  socketRef: any,
  setBases: Function,
  updateTotal: Function,
  isLoading?: boolean
}

export const BaseList: FC<BaseProps> = ({
  bases,
  refetch,
  totalCount,
  socketRef,
  setBases,
  updateTotal,
  isLoading= false
}) => {
    const [page, setPage] = useState<number>(0)
    const [rowsPerPage, setRowsPerPage] = useState<number>(MINIMUM_ROW_NUMBER)

    useEffect(() => {
      socketRef.current.on('addBase', (base) => {
        updateTotal(val => val + 1)
        if(bases.length >= rowsPerPage) return
        const updatedBases = bases.filter(thisBase => thisBase._id !== base._id)
        setBases([...updatedBases, base])
      })

      return () => {
        socketRef.current.off('addBase')
      }
    },[bases])

    useEffect(() => {
      refetchItems()
    }, [rowsPerPage, page])

    const refetchItems = async () => {
      const URLParams = getURLParams(page, rowsPerPage)
      await refetch(URLParams)
    }

    const onDeleteBase = async (id: string) => {
      const resp = await Base.delete(id)
      if(!resp) return
      notify('Base removida','success')
      await refetchItems()
    }

    const generateBasePDF = async (base) => {
      const pdf = await fetch(base.basePdf)
      const pdfBuffer = await pdf.blob()
      openPDF(pdfBuffer)
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
            items={bases}
            title={'Bases PDF'}
            onDelete={onDeleteBase}
            onGetPreview={generateBasePDF}
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