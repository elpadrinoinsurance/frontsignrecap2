import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeIcon from '@mui/icons-material/Mode';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { InfoPopup } from '../../components/InfoPopup/InfoPopup';
import { Navbar } from '../../components/Navbar/Navbar';
import { notify } from '../../components/PDF/helper';
import { Account } from '../../helper';
import './style.scss';

const AccountComp = ({ account, onDeleteAccount, onEditAccount }) => {
  const [popupDelete, setPopupDelete] = useState(false)

  const handleClickDelete = () => {
    setPopupDelete(true)
  };

  return (<div className='account'>
    <span className='fullname'>{account.fullName}</span>
    <div className='icons'>
      <IconButton onClick={() => onEditAccount(account)}>
        <ModeIcon />
      </IconButton>
      <IconButton onClick={handleClickDelete}>
        <DeleteIcon />
      </IconButton>
    </div>
    <Dialog
      open={popupDelete}
      onClose={() => setPopupDelete(false)}
    >
      <DialogTitle id="alert-dialog-title">
        ¿Desea eliminar este usuario?
      </DialogTitle>
      <DialogActions>
        <Button onClick={() => setPopupDelete(false)}>Cancelar</Button>
        <Button onClick={() => onDeleteAccount(account)} autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  </div>)
}

const ModalAccount = ({ account, onCancel, onSave }) => {
  const [fullName, setFullName] = useState(account?.fullName || '')
  const [username, setUsername] = useState(account?.username || '')
  const [password, setPassword] = useState('')

  return (<div className='modal-account'>
    <TextField
      className='input'
      label="Nombre Completo"
      variant="outlined"
      value={fullName}
      onChange={(e) => setFullName(e.target.value)} />
    <TextField
      className='input'
      label="Usuario"
      variant="outlined"
      value={username}
      onChange={(e) => setUsername(e.target.value)} />
    <TextField
      className='input'
      label="Nueva contraseña"
      variant="outlined"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)} />
    <div className='footer'>
      <Button
        variant="text"
        onClick={onCancel}>Cancelar</Button>
      <Button
        variant="contained"
        onClick={() => onSave({
          fullName, username, password, ...(account?._id ? { userId: account._id } : {})
        })}>Guardar</Button>
    </div>
  </div>)
}

type UserModalObject = {
  isAdd?: boolean | undefined;
  isOpen: boolean;
  account?: any;
}

export function SettingsPage() {
  const [accountModal, setAccountModal] = useState<UserModalObject>({ isAdd: true, isOpen: false })
  const [accounts, setAccounts] = useState([])

  const updateAccountsList = async () => {
    const {docs: accounts} = await Account.getAll()
    setAccounts(accounts)
  }

  useEffect(() => {
    updateAccountsList()
  }, [])

  const handleClickAdd = () => setAccountModal({ isAdd: true, isOpen: true })

  const handleClickEdit = (account) => setAccountModal({ isAdd: false, isOpen: true, account })

  const handleClickDelete = (account) => {
    Account.remove(account._id).then((resp) => {
      if(!resp) return
      notify('¡Registro eliminado exitosamente!', 'success')
      updateAccountsList()
    })
  }

  const handleCloseAccountModal = () => setAccountModal({ isOpen: false })

  const editUserAccount = (account) => Account.edit(account).then((resp) => {
    if(!resp) return
    notify('¡Registro actualizado exitosamente!', 'success')
    handleCloseAccountModal()
    updateAccountsList()
  })

  const saveUserAccount = (account) => Account.add(account).then((resp) => {
    if(!resp) return
    notify('¡Registro guardado exitosamente!', 'success')
    handleCloseAccountModal()
    updateAccountsList()
  })

  const handleClickSave = (account) => {
    if (account?.userId) {
      editUserAccount(account)
    } else {
      saveUserAccount(account)
    }
  }

  return (
    <>
      <Navbar />
      <div className="settings-main">
        <div className='lists-operators'>
          {accounts.map((acc: any) => (<AccountComp
            key={acc._id}
            account={acc}
            onDeleteAccount={handleClickDelete}
            onEditAccount={handleClickEdit} />))}
        </div>
        <IconButton
          className='add-button'
          onClick={handleClickAdd}>
          <AddCircleIcon
            fontSize={'large'} />
        </IconButton>
      </div>
      <InfoPopup
        isOpen={accountModal.isOpen}
        title={accountModal.isAdd ? 'Agregar nuevo usuario' : 'Editar detalles de usuario'}
        onClose={handleCloseAccountModal}>
        <ModalAccount
          account={accountModal?.account}
          onCancel={handleCloseAccountModal}
          onSave={handleClickSave} />
      </InfoPopup>
    </>
  );
}
