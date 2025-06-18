import { ComponentProps } from "react"

interface Props extends ComponentProps<"input"> {
  label?: string
  children?: React.ReactElement
  validation?: any
}

export function Input({ label, children, validation, ...props }: Props) {
  return (
    <label>
      <p className="font-bold my-1 text-[.9em] text-purple-700">{label}</p>
      <input {...validation}  {...props} className='w-full px-4 py-[5px] border-[1px] border-gray-300 rounded-md outline-none placeholder-purple-500' />
      {children}
    </label>
  )
}