import { PropsWithChildren } from 'react'
import { Navbar } from './Navbar'
import GlobalLoader from '@components/Loading'

export const Layout = ({ children }: PropsWithChildren) => {

  return (
    <div className="App">
      <Navbar />
      <GlobalLoader />
      <div className="flex justify-between items-center text-[white] z-[-1] relative top-[70px] bg-[#FFF] h-[18px]"></div>
      {children}
      <div className='h-2'></div>
    </div>
  )
}
