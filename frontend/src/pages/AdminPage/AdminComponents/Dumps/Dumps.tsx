import { FC, useEffect, useState } from "react";
import styles from './Dumps.module.css';

import { ITradingPair, SignalData } from "../../../../models/ITradingPair";
import RuleService from "../../../../servises/RuleService";
import { DataInterace, IDate } from "../../../../models/IDates";
import { comparePairsByData, comparePairsByPercent, formatDate, formatTimestamp } from "./functions";
import { IRuleSignal } from "../../../../models/IRuleSignal";
import 'dayjs/locale/ru';
import CustomDatePicker from "./CustomDatePicker";
import dayjs, { Dayjs } from "dayjs";

interface timeframeInterface {
    value: string | number,
    label: string
}

const today = new Date();

const processDataPart = (part?: string) => {
    if (part) {
        const parts = part.split(' ');
        if (parts.length < 4) return 'No Data';

        const timeframe = parts[0];
        const timeStamp = formatTimestamp(parts[1]);
        const ruleName = parts[2];
        const data = parts[3];

        const ruleNameWithColor = <span className={data === 'long' ? styles.longRuleStyle : styles.shortRuleStyle}>{ruleName}</span>

        if (timeframe === '5m' || timeframe === '3m')
            return <span>{ruleNameWithColor} {timeframe}<br />{timeStamp}</span>;
        
        return <span>{ruleNameWithColor}<br />{timeStamp}</span>;
        
    }
};

const Dumps: FC = () => {
    const [pairs, setPairs] = useState<ITradingPair[]>([]);
    const [selectedDate, setSelectedDate] = useState(0);
    const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
    const [selectedDateId, setSelectedDateId] = useState(0);
    const [dates, setDates] = useState<IDate[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('all');
    const [timeframeOptions, setTimeframeOptions] = useState<timeframeInterface[]>();
    const [timeframe, setTimeframe] = useState(1);
    const [timeframes, setTimeframes] = useState(['4h', '1h']);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Function to find the signal data for a trading pair

    const findSignalData = async (tradingPairName: string) => {
        try {
            setLoading(true);
            const response: IRuleSignal[] = (await RuleService.getTopSignal(timeframe, tradingPairName)).data;
            const initData =  { '4h': 'No Data', '1h': 'No Data', '15m': 'No Data', '3m': 'No Data' };
    
            if (response.length === 0) {
                return initData;
            }
        
            const dataObject: SignalData = { '4h': '', '1h': '', '15m': '', '3m': 'No Data' };
        
            response.forEach(part => {
                if (part.timeframe === '1h') dataObject['1h'] = `${part.timeframe} ${part.timestamp} ${part.rule} ${part.data}`;
                else if (part.timeframe === '15m') dataObject['15m'] = `${part.timeframe} ${part.timestamp} ${part.rule} ${part.data}`;
                else if (part.timeframe === '4h') dataObject['4h'] = `${part.timeframe} ${part.timestamp} ${part.rule} ${part.data}`;
                else if (part.timeframe === '3m') dataObject['3m'] = `${part.timeframe} ${part.timestamp} ${part.rule} ${part.data}`;
                else if (part.timeframe === '5m') dataObject['3m'] = `${part.timeframe} ${part.timestamp} ${part.rule} ${part.data}`;
            });
        
            return dataObject;
        } finally {
            setLoading(false);
        }
    }

    const sortByDate = () => {
        pairs.sort(comparePairsByData);
        setPairs([...pairs]);      
    }

    const sortByPercent = () => {
        pairs.sort(comparePairsByPercent);
        setPairs([...pairs]);      
    }
    
    const getTop = async () => {
        try {
            setLoading(true); 
            const response = (await RuleService.getTopTradingPairs()).data;     
            
            const pairsWithSignals = await Promise.all(response.map(async (pair) => {
                try {
                    const signalData = (await findSignalData(pair.tradingpairname));
                    return { ...pair, signalData };
                } catch (error) {
                    console.error(`Error fetching signal data for ${pair.tradingpairname}:`, error);
                    return { ...pair, signalData: null }; // or a default value
                }
            }));

            // Sort the pairs by signalData
            pairsWithSignals.sort(comparePairsByData);

            setPairs([...pairsWithSignals]);            
        } catch (e: any) {
            console.error(e);
            setPairs([]);
        } finally {
            setLoading(false);
        }
    };

    const getDates = async () => {
        try {
            setLoading(true);
            const response = (await RuleService.dumpsGetPreviousDates()).data;            
            setDates([...response]);        
        } catch (e: any) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const getTimeframes = async (date: string) => {
        try {

            const response = (await RuleService.getFourHoursForDate(date)).data;
        
            const formattedTimeframes = response.map((item) => {
                const timestamp = new Date(item.timestamp);
                const hours = timestamp.getHours().toString().padStart(2, '0');
                return {
                    value: item.id,
                    label: hours + ':00' 
                };
            });
            if(selectedDate === 0 || selectedDate === 1){
                setTimeframeOptions([{ value: 'all', label: 'Текущие' }, ...formattedTimeframes]);
            }
            else {
                setTimeframeOptions(formattedTimeframes);
            }
        } finally {
            setLoading(false);
        }
    };

    const changeTimeframe = (timeframe: number) => {
        setTimeframe(timeframe)
        if (timeframe === 15){
            setTimeframes(['4h', '15m'])
        } else if (timeframe === 1) {
            setTimeframes(['4h', '1h'])
        }
    }

    const changeDate = async (id: number, index: number) => {
        setLoading(true);
        try {
            setSelectedDate(index);
            setSelectedDateId(id);
        
            if (index !== 0 && index !== 1) {
                const response = await RuleService.getDumpDataForDate(id);
                const newData = response.data[0].data;
        
                const promises: Promise<ITradingPair>[] = Object.keys(newData).map(async (key: string) => {
                    const tradingPair: DataInterace = newData[key];
                    const { change, changepercent, pair, price } = tradingPair;
                    const signalData = await findSignalData(pair);
                    return {
                        tradingpairname: pair,
                        price,
                        change,
                        changepercent,
                        signalData
                    };
                });
        
                const newPairs = await Promise.all(promises);
                newPairs.sort(comparePairsByData);
        
                setPairs(newPairs);
            } else if (index === 1) {
                const response = await RuleService.getDumpDataForDate(id);
                const newData = response.data[0].data;
        
                const promises: Promise<ITradingPair>[] = Object.keys(newData).map(async (key: string) => {
                    const tradingPair: DataInterace = newData[key];
                    const { change, changepercent, pair, price, lastupdate } = tradingPair;
                    const signalData = await findSignalData(pair);
                    return {
                        tradingpairname: pair,
                        price,
                        change,
                        changepercent,
                        signalData,
                        lastupdate
                    };
                });
        
                const newPairs = await Promise.all(promises);
                newPairs.sort(comparePairsByData);
        
                setPairs([...newPairs]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    

    const handleTimeframeChange = async (value: string) => {
        try {
            setLoading(true);
            setSelectedTimeframe(value);
            if(value !== 'all'){
                const response = (await RuleService.getDumpForHours(parseInt(value)));
                const newData = response.data[0].data;
        
                const promises: Promise<ITradingPair>[] = Object.keys(newData).map(async (key: string) => {
                    const tradingPair: DataInterace = newData[key];
                    const { change, changepercent, pair, price, lastupdate } = tradingPair;
                    const signalData = await findSignalData(pair);
                    return {
                        tradingpairname: pair,
                        price,
                        change,
                        changepercent,
                        signalData,
                        lastupdate
                    };
                });
        
                const newPairs = await Promise.all(promises);
                newPairs.sort(comparePairsByData);
        
                setPairs([...newPairs]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }; 

    useEffect(() => {
        if(selectedDate === 0 || selectedDate === 1) {
            let date = today.getDate().toString();
            if(selectedDate === 1){
                date = new Date(dates[selectedDate - 1].timestamp).getDate().toString().padStart(2, '0');
            }
            getTimeframes(date);
        }
        if(selectedDate === 0 && selectedTimeframe === 'all') {
            getDates();
            getTop();
            const fetchInterval = setInterval(() => {
                getTop();
            }, 30000);
            return () => {
                clearInterval(fetchInterval);
            };
        } else if (selectedDate === 1  && selectedTimeframe === 'all') {
            getDates();
            changeDate(selectedDateId, selectedDate);
            const fetchInterval = setInterval(() => {
                changeDate(selectedDateId, selectedDate);
            }, 30000);
            return () => {
                clearInterval(fetchInterval);
            };
        }

    }, [selectedDate, selectedDateId, selectedTimeframe, timeframe]);

    const handleDateChange = (newDate: Dayjs) => {
        const todayFormatted = formatDate(today.toISOString());
    
        if (newDate.format('DD/MM/YYYY') === todayFormatted) {
            changeDate(0, 0);
        } else {
            const selectedTimestamp = newDate.toISOString();
            const foundDate = dates.find((elem, index) => {
                if (formatDate(elem.timestamp) === formatDate(selectedTimestamp)) {
                    changeDate(elem.id, index + 1);
                    return true;
                }
                return false;
            });
    
            if (!foundDate) {
                console.error('Date not found in the dates array');
            } else {
                setCurrentDate(newDate);
            }
        }
    };
    

    return (
        <div className={styles.tradingpairs}>
            {loading && (<div className="loader" />)}
            <h1>Top Coins</h1>
            <div className={styles.calendar}>
                <div className={styles.buttonsContainer}>
                    <button className={timeframe === 1 ? styles.timeframeActive : styles.timeframeButton}
                        onClick={() => changeTimeframe(1)}>
                        4h/1h
                    </button>

                    <button className={timeframe === 15 ? styles.timeframeActive : styles.timeframeButton}
                        onClick={() => changeTimeframe(15)}>
                        4h/15m
                    </button>
                </div>
                <br></br>

                <div>
                    <CustomDatePicker value={currentDate} onChange={handleDateChange}/>
                </div>


                {selectedDate === 0 || selectedDate === 1 
                ? (
                    <div className={styles.selectContainer}>
                        <span>Выберите время:</span>
                        <select value={selectedTimeframe} onChange={(e) => handleTimeframeChange(e.target.value)}>
                        {timeframeOptions?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                        </select>
                    </div>
                ) : null}
            </div>

            {isDesktop 
                ?
                (
                <table className={styles.pairsTable}>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Монета</th>
                        <th>Цена</th>
                        <th>Change</th>
                        <th onClick={() => sortByPercent()} title={"Click to Sort by %"} className={styles.changeByPercent}>Change %</th>
                        <th>4h</th>
                        {timeframe === 1 && <th>1h</th>}
                        {timeframe === 15 && <th>15m</th>}
                        <th onClick={() => sortByDate()} title={"Click to Sort by Date"} className={styles.changeByDate}>Last Update</th>
                    </tr>
                </thead>
                <tbody>
                    {pairs.slice(0, 10).map((elem: ITradingPair, index) => (
                        <tr key={index}>
                            <td>{index+1}</td>
                            <td>
                                <a href={`https://www.tradingview.com/chart/?symbol=BINANCE:${elem.tradingpairname}.P`} target="_blank">
                                            {elem.tradingpairname}.P
                                </a>
                            </td>
                            <td>{elem.price}</td>
                            <td>{elem.change}</td>
                            <td>{elem.changepercent}%</td>
                            {(timeframes as (keyof SignalData)[]).map((timeFrame) => (
                                <td key={timeFrame}>{processDataPart(elem.signalData?.[timeFrame] || 'No Data')}</td>
                            ))}
                            <td>{formatTimestamp(elem.lastupdate)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            ) : (
                <div className={styles.cardContainer}>
                    {pairs.slice(0, 10).map((pair: ITradingPair, index) => (
                        <div className={styles.card} key={index}>
                            <div className={styles.cardHeader}>
                                <span>{pair.tradingpairname}</span>
                                <span className={styles.timestamp}>{formatTimestamp(pair.lastupdate)}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div>
                                    <strong>Цена:</strong>
                                    <span>{pair.price}</span>
                                </div>
                                <div>
                                    <strong>Change:</strong>
                                    <span>{pair.change}</span>
                                </div>
                                <div>
                                    <strong>Change %:</strong>
                                    <span>{pair.changepercent}%</span>
                                </div>
                                <div>
                                    <strong>Сигнал (4ч)</strong>
                                    <div>{processDataPart(pair.signalData?.['4h'] || 'No Data')}</div> 
                                </div>
                                <div>
                                    {timeframe === 1 && (
                                        <>
                                            <strong>Сигнал (1ч)</strong>
                                            <div>{processDataPart(pair.signalData?.['1h'] || 'No Data')}</div>
                                        </>
                                    )}
                                    {timeframe === 15 && (
                                        <>
                                            <strong>Сигнал (15м)</strong>
                                            <div>{processDataPart(pair.signalData?.['15m'] || 'No Data')}</div>
                                        </>
                                    )}
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

Dumps.displayName = 'Dumps';
export default Dumps;
