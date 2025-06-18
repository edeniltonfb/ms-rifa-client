import LogoutButton from '@components/LogoutButton';
import Link from 'next/link'
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';

export function Navbar() {

  const { sorteio } = useAppContext();
  const { user } = useAuth();

  return (
    <div className='flex flex-col fixed w-full top-0 z-[9999]'>
      <div
        className="flex flex-row justify-center  w-full text-white h-[50px]"
        style={{
          background: "linear-gradient(to right, rgba(15, 1, 31, 0.9), rgba(81, 14, 67, 0.9))",
        }}
      >
        <div className="flex flex-1 items-center mx-5 max-w-[600px]">
          <Link href="/">
            <div className='absolute top-2 left-4'>
              <p className='text-xl font-bold '>União +</p>
            </div>
          </Link>
          <div className="absolute top-2 right-4">
            <LogoutButton />
          </div>

        </div>
      </div>
      {(sorteio || user) &&
        <div className='w-full h-auto  text-white' style={{
          background: "linear-gradient(to right, rgba(15, 1, 31, 0.9), rgba(81, 14, 67, 0.9))",
        }}>
          <div className='grid grid-cols-2 p-0 rounded-md'>
            <div className='p-2 border-r border-t border-gray-200'>
              <p className='text-sm font-medium truncate'>{sorteio?.dataSorteio}</p>
              <p className='text-xs mt-1 truncate'>{sorteio?.titulo}</p>
            </div>
            <div className='flex flex-col p-2 items-end border-t border-gray-200'>
              <p className='text-sm font-medium truncate'>{user?.name}</p>
              <p className='text-xs mt-1 truncate'>{user?.profile}</p>
            </div>
          </div>
        </div>
      }

    </div>
  )
}