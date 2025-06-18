
import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  PropsWithChildren,
  useState} from "react"

export interface StateModifiers {
  openSidebar: () => void
  closeSidebar: () => void
  openModal: () => void
  closeModal: () => void
}

export interface StateValues {
  isSidebarOpen: boolean
  isModalOpen: boolean
}

const stateModifiers = {
  openSidebar: () => {},
  closeSidebar: () => {},
  openModal: () => {},
  closeModal: () => {},
}

const initialState = { isSidebarOpen: false, isModalOpen: false }

type State = StateValues & StateModifiers

const UIContext = createContext<State>({
  ...stateModifiers,
  ...initialState,
})

type Action = { type: "OPEN_SIDEBAR" | "CLOSE_SIDEBAR" | "OPEN_MODAL" | "CLOSE_MODAL" }

function uiReducer(state: StateValues, action: Action) {
  switch(action.type) {
    case "OPEN_SIDEBAR": {
      return {
        ...state,
        isSidebarOpen: true
      }
    }
    case "CLOSE_SIDEBAR": {
      return {
        ...state,
        isSidebarOpen: false
      }
    }
    case "OPEN_MODAL": {
      return {
        ...state,
        isModalOpen: true
      }
    }
    case "CLOSE_MODAL": {
      return {
        ...state,
        isModalOpen: false
      }
    }
  }
}

export function UIProvider({children}: PropsWithChildren) {
  const [state, dispatch] = useReducer(uiReducer, initialState)

  const openSidebar = () => dispatch({type: "OPEN_SIDEBAR"})
  const closeSidebar = () => dispatch({type: "CLOSE_SIDEBAR"})
  const openModal = () => dispatch({type: "OPEN_MODAL"})
  const closeModal = () => dispatch({type: "CLOSE_MODAL"})

  const [vendorSettings, setVendorSettings] = useState({})

  const [qrCode, setQrCode] = useState('')

  const value = useMemo(() => {
    return {
      ...state,
      openSidebar,
      closeSidebar,
      openModal,
      closeModal,
      qrCode,
      setQrCode,
    }
  }, [state])

  return (
    <UIContext.Provider value={{...value}}>
      {children}
    </UIContext.Provider>
  )
}

export const useUI = () => {
  const context = useContext(UIContext)
  return context
}
