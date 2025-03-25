import { FC, useEffect, useState } from "react";
import styles from './Combinations.module.css'

import { ICombination } from "../../../../models/ICombination";
import RuleService from "../../../../servises/RuleService";
import { getAlmatyTime } from "../../../../hooks/callbacks";
import { IAdditionalOptions } from "../../../../models/ILevarage";
import { Stack } from "@mui/material";


const formatData = (data: string) => {
    const items = data.split('\n').filter(Boolean); // Remove empty strings

    return items.map((item, index) => {
        const [firstWord, date, time, rule] = item.split(' ');

        return (
            <div className={styles.list} key={index}>
                <div><b>{firstWord}</b></div>
                <div>{date}</div>
                <div>{time}</div>
                <div>{rule}</div>
            </div>
        );
    });
};

const formatDataMob = (data: string) => {
    const items = data.split('\n').filter(Boolean); // Remove empty strings

    return items.map((item, index) => {
        const [firstWord, date, time, rule] = item.split(' ');

        return (
            <div className={styles.grid} key={index}>
                <div className={styles.gridItem}>
                    <div><b>{firstWord}</b></div>
                    <div>{date}</div>
                </div>
                <div className={styles.gridItem}>
                    <div>{time}</div>
                    <div>{rule}</div>
                </div>
            </div>
        );
    });
};

const Combinations: FC = () => {
    const [combinations, setCombinations] = useState<ICombination[]>([]);
    const [formData, setFormData] = useState<IAdditionalOptions>({
        first: '7d',
        second: '3d',
        third: '4h'
    });
    const [secondOptions, setSecondOptions] = useState(['3d', '1d']);
    const [thirdOptions, setThirdOptions] = useState(['4h']);
    const [type, setType] = useState<'long' | 'short'>('long');


    const getConnections = async () => {
        try {
            const response = (await RuleService.getConnections(
                `${formData.first}${formData.second}${formData.third}`,
                type)).data;
            setCombinations([...response]);
        } catch (e: any) {
            console.log(e);
            setCombinations([]);
        }
    }

    const handleFirstOptionChange = (value: string) => {    
        switch(value) {
          case '7d':
            setSecondOptions(['3d', '1d']);
            setThirdOptions(['4h']);
            setFormData((prev) => ({
              ...prev,
              first: value,
              second: '3d',
              third: '4h'
            }));
            break;
          case '3d':
            setSecondOptions(['1d', '4h']);
            setThirdOptions(['4h', '1h']);
            setFormData((prev) => ({
              ...prev,
              first: value,
              second: '1d',
              third: '4h'
            }));
            break;
          case '1d':
            setSecondOptions(['4h']);
            setThirdOptions(['1h', '15m']);
            setFormData((prev) => ({
              ...prev,
              first: value,
              second: '4h',
              third: '1h'
            }));
        }
    };

    const handleSecondOptionChange = (value: string) => {
        if (formData.first === '3d') {
          if (value === '4h') {
            setThirdOptions(['1h']);
          } else {
            setThirdOptions(['4h', '1h'])
          }
          setFormData((prev) => ({
            ...prev,
            second: value,
            third: '1h'
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            second: value
          }))
        }
    };

    useEffect(() => {
        getConnections();
        const fetchInterval = setInterval(() => {
            getConnections();
        }, 600000);

        return () => {
            clearInterval(fetchInterval);
        };
    }, [formData, type]);

    return (
        <div className={styles.combinations}>

            <h1>Совмещения</h1>
            {/* <ul className={styles.menu}>
                {menu.map((elem: CombinationsMenu, index: number) => (
                    <li key={elem.name}
                        className={active === elem ? styles.menu_active : ''}
                        onClick={() => changeActive(index)}>{elem.name}
                    </li>
                ))}
            </ul> */}

            <div className={styles.addSection}>
                <div className={styles.selectContainer}>
                <select
                    value={formData.first}
                    onChange={(e) => handleFirstOptionChange(e.target.value)}
                    >
                    <option value={'7d'}>7d</option>
                    <option value={'3d'}>3d</option>
                    <option value={'1d'}>1d</option>
                </select>
                </div>
                <svg className={styles.svgIcon} viewBox="-0.16 -0.16 16.32 16.32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 6L8 2L10 2L16 8L10 14L8 14L8 10L-1.74845e-07 10L-3.01991e-07 6L8 6Z" fill="#ffffff"></path> </g></svg>
                <div className={styles.selectContainer}>
                <select
                    value={formData.second}
                    onChange={(e) => handleSecondOptionChange(e.target.value)}>
                    {secondOptions.map((val) => (
                    <option value={val} key={val}>{val}</option>
                    )) }
                </select>
                </div>
                <svg className={styles.svgIcon} viewBox="-0.16 -0.16 16.32 16.32" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M8 6L8 2L10 2L16 8L10 14L8 14L8 10L-1.74845e-07 10L-3.01991e-07 6L8 6Z" fill="#ffffff"></path> </g></svg>
                <div className={styles.selectContainer}>
                <select
                value={formData.third}
                onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    third: e.target.value
                }))}>
                    {thirdOptions.map((val) => (
                    <option value={val} key={val}>{val}</option>
                    ))}
                </select>
                </div>
            </div>

            <Stack direction="row" gap="1.5rem" justifyContent="center">
                <div 
                    className={type === 'long' ? styles.menu_active : styles.menu} 
                    onClick={() => setType('long')}>
                    Long
                </div>
                <div 
                    className={type === 'short' ? styles.menu_active : styles.menu} 
                    onClick={() => setType('short')}>
                    Short
                </div>
            </Stack>


            <table className={styles.combTable}>
                <thead>
                    <tr>
                        <th>Trading Pair</th>
                        <th>Data</th>
                        <th>Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {combinations.map((elem: ICombination) => (
                        <tr key={elem.connectid}>
                            <td>
                                <a href={`https://www.tradingview.com/chart/?symbol=BINANCE:${elem.tradingpair}.P`} target="_blank">
                                    {elem.tradingpair}.P
                                </a>
                            </td>
                            <td>
                                {formatData(elem.data)}
                            </td>
                            <td>{getAlmatyTime(elem.timestamp)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className={styles.cards}>
                {combinations.map((elem: ICombination) => (
                        <div key={elem.connectid} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <a href={`https://www.tradingview.com/chart/?symbol=BINANCE:${elem.tradingpair}.P`} target="_blank">
                                    {elem.tradingpair}.P
                                </a>
                            </div>
                            <div className={styles.cardContent}>
                                <span>Data:</span>
                            </div>
                            <div>{formatDataMob(elem.data)}</div>
                            <div className={`${styles.cardAction} ${styles.cardContent}`}>
                                <span>Timestamp:</span> <span>{getAlmatyTime(elem.timestamp)}</span>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default Combinations;
