import axios from "axios";

axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';

export const instance = axios.create({
  headers: {
    get: {        // can be common or any other method
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'empresaId': process.env.NEXT_PUBLIC_EMPRESA_ID,
      'empresaNome': process.env.NEXT_PUBLIC_EMPRESA_NOME,
    },

    post: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'empresaId': process.env.NEXT_PUBLIC_EMPRESA_ID,
      'empresaNome': process.env.NEXT_PUBLIC_EMPRESA_NOME,
    },

    put: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
      'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
      'empresaId': process.env.NEXT_PUBLIC_EMPRESA_ID,
      'empresaNome': process.env.NEXT_PUBLIC_EMPRESA_NOME,
    }
  },
  baseURL: 'https://multisorteios.dev/msrifaadmin/api'
  //baseURL: 'http://localhost:8079/msrifaadmin/api'
})
