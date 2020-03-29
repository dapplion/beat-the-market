import React, { useState, useEffect } from "react";
import { fetchPriceData } from "./utils";
import PriceChart from "./PriceChart";
import { Position, DataPoint, ParsedPosition } from "./types";
import { MdRefresh } from "react-icons/md";
import "./app.scss";

const n = 200;
const start = 30;

export default function App() {
  const [active, setActive] = useState<boolean>(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tick, setTick] = useState<number>(start);
  const [data, setData] = useState<DataPoint[]>([]);
  const [pair, setPair] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // Used to re-trigger a fetch on game restart
  const [gameCount, setGameCount] = useState<number>(0);
  const canDo = tick < n;
  const hasFinished = tick >= n;
  const isStart = tick === start;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (canDo && active && data.length > 0) setTick(_tick => _tick + 1);
    }, 150);
    return () => {
      clearInterval(timeout);
    };
  }, [tick, active]);

  useEffect(() => {
    const nToFetch = n + 1;
    setLoading(true);
    fetchPriceData(nToFetch)
      .then(({ data, pair }) => {
        setData(data);
        setPair(pair);
      })
      .catch(e => console.error(`Error fetching price data: ${e.message}`))
      .then(() => {
        setLoading(false);
      });
  }, [gameCount]);

  function doPosition() {
    if (hasFinished || data.length === 0) return;

    const lastPosition = positions[positions.length - 1];
    const positionIsOpen =
      lastPosition && typeof lastPosition.to === "undefined";

    if (positionIsOpen) {
      if (lastPosition.from !== tick)
        setPositions([
          ...positions.slice(0, positions.length - 1),
          {
            ...lastPosition,
            to: tick
          }
        ]);
    } else {
      setPositions([
        ...positions,
        {
          from: tick
        }
      ]);
    }
  }

  function onChartClick() {
    if (!active) setActive(true);
    doPosition();
  }

  function onRestartClick() {
    // Hide the chart
    setLoading(false);
    // Reset player buys/sells
    setPositions([]);
    // Stop price walk
    setActive(false);
    // Restart the tick to zero
    setTick(start);
    // Increment game count to re-fetch
    setGameCount(n => n + 1);
  }

  useEffect(() => {
    document.body.onkeyup = function (e) {
      if (e.keyCode === 32) {
        // const currentPrice = prices[prices.length - 1]
        // setActions((_actions: MarketAction[]) => {
        //     const lastAction = _actions[_actions.length - 1]
        //     return [..._actions, {
        //         action: lastAction ? lastAction.action === "in" ? "out" : "in" : "in",
        //         price: currentPrice.price,
        //         time: currentPrice.time
        //     }]
        // })
        console.log("SPACE!");
        doPosition();
      }
      if (e.keyCode === 13) {
        setActive(_active => !_active);
      }
    };
  });

  // const onMoveThrottle = useMemo(() => throttle(onMove, 500), [])

  function parsePosition({ from, to }: Position): ParsedPosition {
    const iFrom = from;
    const iTo = to ? Math.min(to, tick) : tick;
    const xFrom = hasFinished ? (data[iFrom] || {}).time : iFrom;
    const xTo = hasFinished ? (data[iTo] || {}).time : iTo;
    const yFrom = (data[iFrom] || {}).price;
    const yTo = (data[iTo] || {}).price;
    const isWin = yTo > yFrom;
    return { iFrom, iTo, xFrom, xTo, yFrom, yTo, isWin, isOpen: !to };
  }

  const parsedPositions = positions.map(parsePosition);

  const marketGain = data.length
    ? (data[tick].price - data[0].price) / data[0].price
    : 0;
  const yourFactor = parsedPositions.reduce(
    (factor, { yFrom, yTo }) => factor * (yTo / yFrom),
    1
  );
  const yourGain = yourFactor - 1;

  return (
    <div className="app">
      <div className="header">
        <h1>
          <strong>Beat</strong> the market
        </h1>
        <table>
          <tbody>
            <tr>
              <th>Market</th>
              <th>You</th>
            </tr>
            <tr>
              <td>{Math.round(100 * marketGain)}%</td>
              <td>{Math.round(100 * yourGain)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isStart && (
        <div className="instructions" onClick={onChartClick}>
          <div>
            Click anywhere <br />
            <strong>to start</strong>
          </div>
          <div className="help">Click again to buy / sell</div>
        </div>
      )}

      {hasFinished && (
        <div className="restart" onClick={onRestartClick}>
          <big>Restart</big>
          <small>
            <MdRefresh />
          </small>
        </div>
      )}

      {hasFinished && (
        <div className="market-name">
          <big>{pair} USD</big>
          <small>{pair}</small>
        </div>
      )}

      <div
        className={`price-chart-container ${loading ? "loading" : ""}`}
        onClick={onChartClick}
      >
        <PriceChart
          data={data.slice(0, tick + 1)}
          parsedPositions={parsedPositions}
          yMax={n}
          hasFinished={hasFinished}
        />
      </div>
    </div>
  );
}
