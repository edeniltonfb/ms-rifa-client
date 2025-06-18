import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { parse, format } from 'date-fns';

const DataInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    const parsedDate = value ? parse(value, 'dd/MM/yyyy', new Date()) : null;

    return (
        <div className='w-[160px]'>
            <DatePicker
                selected={parsedDate}
                onChange={(date: Date | null) => {
                    if (date) {
                        onChange(format(date, 'dd/MM/yyyy')); // retorna string
                    } else {
                        onChange('');
                    }
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selecione a data"
                className="px-3 py-1 border rounded-md w-full"
            />
        </div>
    );
};

export default DataInput;
