import { FiLogOut } from 'react-icons/fi';
import { useAppContext } from 'src/contexts/AppContext';
import { useAuth } from 'src/contexts/AuthContext';

export default function LogoutButton() {
    const { logout: authLogout, isAuthenticated } = useAuth();
    const {setSorteio} = useAppContext();
    return (
        isAuthenticated ?
            <button
                onClick={() => {authLogout(); setSorteio(null)}}
                className="flex items-center gap-2 p-2 rounded-md  text-white hover:bg-red-400 transition"
            >
                <FiLogOut size={20} />
                <span>Sair</span>
            </button>
            : null
    );
}
