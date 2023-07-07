import axios from 'axios'
import { notify } from './components/PDF/helper'

export const transport = axios.create()

transport.interceptors.response.use((response) => response, async function (error) {
  const originalRequest = error.config;
  //console.log('originalRequest=', originalRequest)
  if (error.response.status === 401 && originalRequest.url.indexOf("/session") === -1) {
    return window.location.replace('/login')
  }
  return Promise.reject(error)
})

export const getSessionId = () => localStorage.getItem('sessionId')

export const setSessionId = (sessionId) => {
  localStorage.setItem('sessionId', sessionId)
}

export const setRol = (rol) => {
  localStorage.setItem('rol', rol)
}

export const setUserId = (userId) => {
  localStorage.setItem('userId', userId)
}

export const getUserId = () => localStorage.getItem('userId')

export const getRol = () => localStorage.getItem('rol')

export const deleteRol = () => {
  localStorage.removeItem('rol')
}

export const deleteSessionId = () => {
  localStorage.removeItem('sessionId')
}

export const deleteUserId = () => {
  localStorage.removeItem('userId')
}

export const clearCachedUserInfo = () => {
  deleteSessionId()
  deleteUserId()
  deleteRol()
}

export const verifySession = async (shouldBeActive, history, path) => {
  const link = `${process.env.REACT_APP_BACK_URL}/session/verify`
  const data = await sendRequest.Get(link)
  const condition = shouldBeActive ? data.session : !data.session
  if (condition) {
    history.push(path)
  }
}

const Put = async (link: string, body: object) => {
  try {
    const headers = { auth: getSessionId() }
    const resp = await transport.put(link, body, { headers })
    if (resp.status === 200) {
      return resp.data
    }
  }
  catch (err) {
    // @ts-ignore
    notify(err.response?.data?.message, 'error')
  }
}

const Post = async (link: string, body: object) => {
  try {
    const headers = { auth: getSessionId() }
    const resp = await transport.post(link, body, { headers })
    if (resp.status === 200) {
      return resp.data
    }
  }
  catch (err) {
    // @ts-ignore
    notify(err.response?.data?.message, 'error')
  }
}

const Get = async (link: string) => {
  try {
    const headers = { auth: getSessionId() }
    const resp = await transport.get(link, { headers })
    if (resp.status === 200) {
      return resp.data
    }
  }
  catch (err) {
    // @ts-ignore
    notify(err.response?.data?.message, 'error')
  }
}

const Delete = async (link: string) => {
  try {
    const headers = { auth: getSessionId() }
    const resp = await transport.delete(link, { headers })
    if (resp.status === 200) {
      return resp.data
    }
  }
  catch (err) {
    // @ts-ignore
    notify(err.response?.data?.message, 'error')
  }
}

export const sendRequest = {
  Post,
  Get,
  Delete,
  Put
}

export class Base {
  static async get(baseId: string) {
    const linkBase = `${process.env.REACT_APP_BACK_URL}/base/${baseId}`
    const base = await sendRequest.Get(linkBase)
    return base
  }

  static async getAll(urlParam: string|null = null) {
    const params = urlParam ? `?${urlParam}` : ""
    const link = `${process.env.REACT_APP_BACK_URL}/base${params}`
    const bases = await sendRequest.Get(link)
    return bases
  }

  static async delete(id: string) {
    const link = `${process.env.REACT_APP_BACK_URL}/base/${id}`
    const resp = await sendRequest.Delete(link)
    return resp
  }
}

export class Session {
  static async delete() {
    const link = `${process.env.REACT_APP_BACK_URL}/session`
    const resp = await sendRequest.Delete(link)
    return resp
  }
}

export class Template {
  static async get(templateId: string) {
    const linkTemplate = `${process.env.REACT_APP_BACK_URL}/template/${templateId}`
    const template = await sendRequest.Get(linkTemplate)
    const templateData = {
      ...template,
      schemas: JSON.parse(template.schemas),
      sampledata: JSON.parse(template.sampledata),
      columns: JSON.parse(template.columns)
    }
    return templateData
  }

  static async getAll(urlParam: string|null = null) {
    const params = urlParam ? `?${urlParam}` : ""
    const link = `${process.env.REACT_APP_BACK_URL}/template${params}`
    const {docs, ...pagination} = await sendRequest.Get(link)
    const parsedTemplates = docs.map(template => {
      return {
        ...template,
        sampledata: JSON.parse(template.sampledata),
        schemas: JSON.parse(template.schemas),
        columns: JSON.parse(template.columns)
      }
    })
    return {
      docs: parsedTemplates,
      ...pagination
    }
  }

  static async delete(id: string) {
    const link = `${process.env.REACT_APP_BACK_URL}/template/${id}`
    const resp = await sendRequest.Delete(link)
    return resp
  }
}

export class Account {
  static async add(account) {
    const link = `${process.env.REACT_APP_BACK_URL}/account`
    const accounts = await sendRequest.Post(link, account)
    return accounts
  }

  static async edit(account) {
    const link = `${process.env.REACT_APP_BACK_URL}/account/${account.userId}`
    delete account.userId
    const accounts = await sendRequest.Put(link, account)
    return accounts
  }

  static async remove(userId) {
    const link = `${process.env.REACT_APP_BACK_URL}/account/${userId}`
    const accounts = await sendRequest.Delete(link)
    return accounts
  }

  static async getAll(urlParam: string|null = null) {
    const params = urlParam ? `?${urlParam}` : ""
    const link = `${process.env.REACT_APP_BACK_URL}/account${params}`
    const accounts = await sendRequest.Get(link)
    return accounts
  }
}

export class Document {
  static getSignatureLink(docId: string) {
    return window.location.protocol + '//' + window.location.host + `/signature/${docId}`
  }

  static async get(docId: string) {
    const linkDocument = `${process.env.REACT_APP_BACK_URL}/document/${docId}`
    const document = await sendRequest.Get(linkDocument)
    const documentParsed = { ...document, inputs: JSON.parse(document.inputs) }
    return documentParsed
  }

  static async getAll(urlParam: string|null = null) {
    const params = urlParam ? `?${urlParam}` : ""
    const link = `${process.env.REACT_APP_BACK_URL}/document${params}`
    const {docs, ...pagination} = await sendRequest.Get(link)
    const documents = docs.map(doc => {
      return {
        ...doc,
        inputs: JSON.parse(doc.inputs),
      }
    })
    return {
      docs: documents,
      ...pagination
    }
  }

  static async delete(docId: string) {
    const link = `${process.env.REACT_APP_BACK_URL}/document/${docId}`
    const resp = await sendRequest.Delete(link)
    return resp
  }

  static async deleteAll() {
    const link = `${process.env.REACT_APP_BACK_URL}/document/all`
    const resp = await sendRequest.Delete(link)
    return resp
  }

  static async download() {
    const link = `${process.env.REACT_APP_BACK_URL}/document/download`
    const {documents, templates, bases} = await sendRequest.Get(link)
    const documentsParsed = documents.map(doc => {
      return { ...doc, inputs: JSON.parse(doc.inputs) }
    })
    const templatesParsed = templates.map(temp => {
      return {
        ...temp,
        schemas: JSON.parse(temp.schemas),
        sampledata: JSON.parse(temp.sampledata),
        columns: JSON.parse(temp.columns),
      }
    })
    return {
      documents: documentsParsed,
      templates: templatesParsed,
      bases
    }
  }

  static async insertBatch(body: { dataset: any, templateId: string }) {
    const link = `${process.env.REACT_APP_BACK_URL}/document/batch`
    const resp = await sendRequest.Post(link, body)
    return resp
  }
}

export const openPDF = (buffer: BlobPart) => {
  const blob = new Blob([buffer], { type: "application/pdf" })
  window.open(URL.createObjectURL(blob));
}

export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  settings: '/settings'
}

export const roles = {
  OPERATIVO: 'OPERATIVO',
  ADMIN: 'ADMIN'
}

export const getRandomString = () => {
  return Math.random().toString(36)
}