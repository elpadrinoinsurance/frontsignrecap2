import { AppRouter } from '../router/AppRouter'
import { ToastContainer } from 'react-toastify';
import './index.scss'

const App = () => (
  <>
    <ToastContainer/>
    <div className='app-main'>
      <AppRouter/>
    </div>
  </>
);

export default App;