import '../styles/globals.css'

import type { AppProps } from 'next/app'
import { Layout } from '../components/Layout/index'
import { UIProvider } from '../contexts/UIProvider'
import { FormProvider, useForm } from 'react-hook-form'
import { Toaster } from 'react-hot-toast';
import { AppProvider } from 'src/contexts/AppContext'
import { AuthProvider } from 'src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function MyApp({ Component, pageProps }: AppProps) {
  const methods = useForm()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    < div className='bg-gradient-to-r from-[#424456] to-[#323446]'>
      <Toaster position='bottom-center' />
      <ToastContainer position='bottom-center'/>
      <UIProvider>
        <FormProvider {...methods}>
          <AuthProvider>
            <AppProvider>
              <Layout>
                {mounted && <Component {...pageProps} />}
              </Layout>
            </AppProvider>
          </AuthProvider>
        </FormProvider>
      </UIProvider>
    </div>
  )
}

export default MyApp
