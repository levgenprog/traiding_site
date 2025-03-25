import { FC, useEffect, useState } from "react";
import styles from './Trends.module.css'
import { ITrend } from "../../../../models/ITrend";
import { Section } from "../NavBar/NavBar";
import RuleService from "../../../../servises/RuleService";
import RulesDetail from "../Rules/RulesDetail";
import RegularButton from "../../../../components/UI/Buttons/RegularButton";
import Pairs from "../Pairs/Pairs";

interface TrendsInterface {
  timeframe: Section
}

type RuleTypes = 'ZeroVN' | 'VN' | 'ZeroNN2' | 'ZeroNN' | 'NN' | 'ZeroVN2' | '';

const Trends: FC<TrendsInterface> = ({ timeframe }) => {
  const [trends, setTrends] = useState<ITrend[]>([]);
  const [signalsIDs, setSignalsIds] = useState<number[]>([]);
  const [selectedRule, setSelectedRule] = useState<RuleTypes>('');
  const [selectedCoins, setSelectedCoins] = useState<'VN' | 'NN' | ''>('');

  const getTrends = async (timeframe: string) => {
    try {
      const response = (await RuleService.getTrends(timeframe)).data;
      setTrends(response);
    } catch (e: any) {
      console.error(e);
    }
  }

  useEffect(() => {
    setSelectedRule('');
    setSignalsIds([]);
    getTrends(timeframe.val);

    if(timeframe.val === '15m'){
      const fetchInterval = setInterval(() => {
        getTrends(timeframe.val);
      }, 600000);

      return () => {
          clearInterval(fetchInterval);
      };
    }
    if (timeframe.val === '1h') {
      const fetchInterval = setInterval(() => {
        getTrends(timeframe.val);
      }, 1500000);

      return () => {
          clearInterval(fetchInterval);
      };
    }
  }, [timeframe.val]);

  const showRulesDetail = (trendId: number, ruleType: RuleTypes) => {
    const selectedTrend = trends.find((elem) => elem.trendid === trendId);
  
    if (selectedTrend) {
      try {
        const data: Record<string, unknown> = JSON.parse(selectedTrend.data);
        const dataForRule: number[] = (data[(Object.keys(data).find((elem: string) => elem === ruleType) as string)] as number[]);
        setSignalsIds([...dataForRule]);
        setSelectedRule(ruleType);
      } catch (error) {
        console.error('Error parsing loos parameter:', error);
      }
    }
  };

  const showCoins = (coin: 'VN' | 'NN', timeframe: string) => {
    console.log(coin, timeframe);
    setSelectedCoins(coin);
  }

  const handleBack = () => {
    setSelectedRule('');
    setSelectedCoins('');
    setSignalsIds([]);
  };

  return (
    <div className={styles.trends}>
      <h1>{timeframe.name}</h1>
      {selectedRule
      ? (
        <>
          <RegularButton action={() => handleBack()}>Назад</RegularButton>
          <RulesDetail ruleName={selectedRule} forTrends={true} signalIds={signalsIDs}/> 
        </>
      ) : selectedCoins ? (
        <>
          <RegularButton action={() => handleBack()}>Назад</RegularButton>
          <Pairs position={selectedCoins} timeframe={timeframe.val}></Pairs>
        </>
      ) 
      : (
        <>
          <div className={styles.trendsContainer}>
            {trends.map((elem: ITrend) => (
              <div key={elem.trendid} className={styles.trendCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.trendsCandleNum}>
                    #{(elem.candle_num - 1)}
                    <span className={styles.coloredSquare} style={{ backgroundColor: elem.candle_color }}></span>
                  </div>
                  <div className={styles.timestamp}>{elem.timestamp.substring(0, 16)}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.coins} onClick={() => showCoins('VN', timeframe.val)}>
                    <b>VN:</b> {elem.shorts.toFixed(0)} ({(elem.shorts * 100 / (elem.longs + elem.shorts)).toFixed(0)}%)
                  </div>
                  <div className={styles.coins} onClick={() => showCoins('NN', timeframe.val)}>
                    <b>NN:</b> {elem.longs.toFixed(0)} ({(elem.longs * 100 / (elem.longs + elem.shorts)).toFixed(0)}%)
                  </div>
                  <div className={`${styles.subtable} ${styles.oo}`}>
                    <b>Short Signals</b>
                    <ul>
                      <li onClick={() => showRulesDetail(elem.trendid, 'ZeroVN')}>
                        <b>ZeroVN:</b> {elem.rshort}
                      </li>
                      <li onClick={() => showRulesDetail(elem.trendid, 'VN')}>
                        <b>VN:</b> {elem.ashort}
                      </li>
                      <li onClick={() => showRulesDetail(elem.trendid, 'ZeroNN2')}>
                        <b>ZeroNN2:</b> {elem.bshort}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <b>Total Shorts:</b> {elem.total_short}
                  </div>
                  <div className={styles.subtable}>
                    <b>Long Signals</b>
                    <ul>
                      <li onClick={() => showRulesDetail(elem.trendid, 'ZeroNN')}>
                        <b>ZeroNN:</b> {elem.rlong}
                      </li>
                      <li onClick={() => showRulesDetail(elem.trendid, 'NN')}>
                        <b>NN:</b> {elem.along}
                      </li>
                      <li onClick={() => showRulesDetail(elem.trendid, 'ZeroVN2')}>
                        <b>ZeroVN2:</b> {elem.blong}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <b>Total Longs:</b> {elem.total_long}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.trendTableWrapper}>
            <table className={styles.trendTable}>
              <thead>
                <tr>
                  <th>Candle</th>
                  <th>VN</th>
                  <th>NN</th>
                  <th><span className={styles.ruleSection}>Rule</span> Short Signals</th>
                  <th>Total Shorts</th>
                  <th><span className={styles.ruleSection}>Rule</span> Long Signals</th>
                  <th>Total Longs</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {trends.map((elem: ITrend) => (
                  <tr key={elem.trendid}>
                    <td>
                      <div className={styles.trendsCandleNum}>
                        #{(elem.candle_num - 1)}
                        <span className={styles.coloredSquare} style={{ backgroundColor: elem.candle_color }}></span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.coins} onClick={() => showCoins('VN', timeframe.val)}>
                        {elem.shorts.toFixed(0)} ({(elem.shorts * 100 / (elem.longs + elem.shorts)).toFixed(0)}%)
                      </span>
                    </td>
                    <td>
                      <span className={styles.coins} onClick={() => showCoins('NN', timeframe.val)}>
                        {elem.longs.toFixed(0)} ({(elem.longs * 100 / (elem.longs + elem.shorts)).toFixed(0)}%)
                      </span>
                    </td>
                    <td>
                      <ul className={styles.subtable}>
                        <li onClick={() => showRulesDetail(elem.trendid, 'ZeroVN')}>
                          <div><b>ZeroVN:</b></div>
                          <div className={styles.value}>{elem.rshort}</div>
                        </li>
                        <li onClick={() => showRulesDetail(elem.trendid, 'VN')}>
                          <div><b>VN:</b></div>
                          <div className={styles.value}>{elem.ashort}</div>
                        </li>
                        <li onClick={() => showRulesDetail(elem.trendid, 'ZeroNN2')}>
                          <div><b>ZeroNN2:</b></div>
                          <div className={styles.value}>{elem.bshort}</div>
                        </li>
                      </ul>
                    </td>
                    <td>{elem.total_short}</td>
                    <td>
                      <ul className={styles.subtable}>
                        <li onClick={() => showRulesDetail(elem.trendid, 'ZeroNN')}>
                          <div><b>ZeroNN:</b></div>
                          <div className={styles.value}>{elem.rlong}</div>
                        </li>
                        <li onClick={() => showRulesDetail(elem.trendid, 'NN')}>
                          <div><b>NN:</b></div>
                          <div className={styles.value}>{elem.along}</div>
                        </li>
                        <li onClick={() => showRulesDetail(elem.trendid, 'ZeroVN2')}>
                          <div><b>ZeroVN2:</b></div>
                          <div className={styles.value}>{elem.blong}</div>
                        </li>
                      </ul>
                    </td>
                    <td>{elem.total_long}</td>
                    <td className={styles.timestamp}>{elem.timestamp.substring(0, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default Trends;
