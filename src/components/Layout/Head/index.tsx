import Head from 'next/head'

export function CustomHead() {

  return (
  
    <Head>
        
        <title>{process.env.NEXT_PUBLIC_EMPRESA_NOME}</title>
        <link rel="shortcut icon" href="/favicon.ico" />
        
      </Head>
  )
}
