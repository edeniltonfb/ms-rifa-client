//import { Clock } from '@components/Icons/Icons';
import React, { useEffect, useState } from 'react';

interface TimeDifferenceProps {
    timestamp: string;
}

const TimeDifference: React.FC<TimeDifferenceProps> = ({ timestamp }) => {
    const [timeDiff, setTimeDiff] = useState<string>('');

    // Converte o timestamp uma vez fora do setInterval
    const targetDate = new Date(
        timestamp?.split(" ")[0].split("/").reverse().join("-") + "T" + timestamp?.split(" ")[1]
    );

    useEffect(() => {
        const updateDifference = () => {
            const now = new Date();
            const diffInSeconds = Math.floor((targetDate.getTime() - now.getTime()) / 1000);

            if (diffInSeconds <= 0) {
                setTimeDiff('0s');
                return;
            }

            const days = Math.floor(diffInSeconds / (24 * 60 * 60));
            const hours = Math.floor((diffInSeconds % (24 * 60 * 60)) / (60 * 60));
            const minutes = Math.floor((diffInSeconds % (60 * 60)) / 60);
            const seconds = diffInSeconds % 60;

            if(days > 0){
                setTimeDiff(`${days}d ${hours}h ${minutes}m ${seconds}s`);
            }else{
                setTimeDiff(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        updateDifference(); // Chama a função uma vez imediatamente
        const intervalId = setInterval(updateDifference, 1000);

        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    }, [targetDate]);

    return <div className="flex flex-col justify-between items-center w-full ">
        {/** <Clock />*/}
        <span className="text-[#F59E0B]">{timeDiff}</span>
    </div>


};

export default TimeDifference;
