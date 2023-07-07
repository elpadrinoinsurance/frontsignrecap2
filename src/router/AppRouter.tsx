import { Switch, Route, Redirect } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { PageNotFound } from '../pages/PageNotFound'
import { Login } from '../pages/Login'
import { HomePage } from '../pages/Home'
import { SettingsPage } from '../pages/Settings'
import { routes } from '../helper';
import { CircularProgress } from '@mui/material';

const importComponent = (route, Component) => {
  return () => import(`../pages/${route}`).then(module => ({ default: module[Component] }))
}

const Loader = () => {
  return (
    <div className='loading'>
      <CircularProgress size={60}/>
    </div>
  )
}

const withSuspense = (Component) => () => {
  return (
    <Suspense fallback={<Loader/>}>
      <Component />
    </Suspense>
  )
}

const FormPage = lazy(importComponent("Form", "FormPage"))
const DesignerViewer = lazy(importComponent("Designer", "DesignerViewer"))
const SignatureViewer = lazy(importComponent("Viewer", "SignatureViewer"))

export const AppRouter = () => (
  <>
    <Switch>
      <Route exact path={routes.login} component={Login} />
      <Route exact path={routes.dashboard} component={HomePage} />
      <Route exact path={'/'} component={() => (<Redirect to={routes.dashboard} />)} />
      <Route exact path={routes.settings} component={SettingsPage} />
      <Route exact path="/admin/form" component={withSuspense(FormPage)} />
      <Route exact path="/admin/designer" component={withSuspense(DesignerViewer)} />
      <Route exact path="/signature/:documentId" component={withSuspense(SignatureViewer)} />
      <Route path="/*" component={PageNotFound} />
    </Switch>
  </>
);