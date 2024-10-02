import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import Plot from "react-plotly.js";

interface Session {
  sessionName: string;
  specimens: Specimen[];
  data?: any;
  yAxisRange?: any;
}

export interface Specimen {
  name: string;
  labelTag: string;
  startTime: string;
  endTime: string;
}

interface ChartData {
  x: string[];
  y: number[];
  type: "scatter";
  mode: "lines" | "markers" | "lines+markers";
  line: { width: number; color: string };
}

function convertTimestampToDate(timestamp: any) {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function generateLogScaleTicks(data: number[]) {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const minExp = Math.floor(Math.log10(minVal));
  const maxExp = Math.ceil(Math.log10(maxVal));

  const tickvals = [];
  const ticktext = [];

  for (let i = minExp; i <= maxExp; i++) {
    const baseVal = Math.pow(10, i);
    tickvals.push(baseVal, 2 * baseVal, 5 * baseVal);
    ticktext.push(
      `${baseVal.toExponential()}`,
      `${(2 * baseVal).toExponential()}`,
      `${(5 * baseVal).toExponential()}`
    );
  }

  return { tickvals, ticktext };
}

const MySessionsComponent = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartData, setChartData] = useState<ChartData[] | undefined>(
    undefined
  );
  const [yAxisRange, setYAxisRange] = useState<{
    tickvals: number[];
    ticktext: string[];
  }>({ tickvals: [], ticktext: [] });
  const [sensorIndex, setSensorIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isChartDisplayed, setIsChartDisplayed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openTab, setOpenTab] = useState<number | null>(null);

  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  useLayoutEffect(() => {
    function updateSize() {
      setDimensions({ height: window.innerHeight, width: window.innerWidth });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get("http://localhost:8080/data")
      .then((response) => {
        setSessions(response.data);

        setIsLoading(false);
      })
      .catch((error) => {
        console.error("There was an error!", error);
        setIsLoading(false);
      });
  }, []);

  const onSetSensorIndex = (index: number, session: Session) => {
    setSensorIndex(index);
    setSelectedSession(session);
    handleShowChart(sessions[0]);
  };

  const toggleChartDisplay = (session: Session) => {
    setIsChartDisplayed(!isChartDisplayed);
    if (!isChartDisplayed) {
      onSetSensorIndex(sensorIndex, session);
    }
  };

  const handleShowChart = (session: Session) => {
    const chartData = [];
    let resistanceValues: number[] = [];

    const maxStepIndex = Math.max(...session.data.map((item: any) => item[8]));

    for (let i = 1; i <= maxStepIndex; i++) {
      const data = session.data
        .filter((item: any) => item[0] === sensorIndex && item[8] === i)
        .map((item: any) => ({
          realTimeClock: item[3],
          resistanceGasSensor: item[7],
          labelTag: item[10],
        }));

      resistanceValues = resistanceValues.concat(
        data.map((item: any) => item.resistanceGasSensor)
      );

      chartData.push({
        x: data.map((item: any) => convertTimestampToDate(item.realTimeClock)),
        y: data.map((item: any) => item.resistanceGasSensor),
        type: "scatter",
        mode: "lines",
        line: { width: 1 },
      });
    }

    const { tickvals, ticktext } = generateLogScaleTicks(resistanceValues);

    setChartData(chartData as ChartData[]);
    setYAxisRange({ tickvals, ticktext });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
      {!isLoading && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-1/2">
          <h1 className="text-2xl font-bold mb-4">My Sessions</h1>
          <Accordion
            activeIndex={openTab}
            onTabChange={(e) => {
              setOpenTab(e.index as number);
              if (e.index !== null) {
                setIsChartDisplayed(false);
              }
              setSelectedSession(sessions[e.index as number]);
            }}
          >
            {sessions.map((session, index) => (
              <AccordionTab
                key={index}
                header={session.sessionName}
                className="mb-4 hover:bg-gray-100 transition-colors duration-300"
              >
                {session.specimens.map((specimen, i) => (
                  <div
                    key={i}
                    className="border-2 border-gray-300 m-2 p-4 rounded-md bg-white shadow-sm"
                  >
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Specimen Name:</strong> {specimen.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Label Tag:</strong> {specimen.labelTag}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Start Time:</strong> {specimen.startTime}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>End Time:</strong> {specimen.endTime}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() => toggleChartDisplay(session)}
                  className={
                    isChartDisplayed
                      ? "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
                      : "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 ml-2 rounded focus:outline-none focus:shadow-outline"
                  }
                >
                  {isChartDisplayed ? "Close Chart" : "Show Chart"}
                </button>
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      )}
      {!isLoading && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col w-1/2">
          {!isChartDisplayed && (
            <div className="flex flex-col items-center justify-center text-center bg-gray-200 p-4 rounded-md">
              <h1 className="text-2xl font-bold mb-2">No Chart Selected</h1>
              <p className="text-gray-700">
                Please select a session and click "Show Chart" to display the
                chart.
              </p>
            </div>
          )}
          {isChartDisplayed && chartData && chartData.length > 0 && (
            <div className="flex flex-col justify-center">
              <Plot
                data={chartData}
                layout={{
                  width: dimensions.width * 0.4,
                  height: dimensions.height * 0.4,
                  title: "Resistance Gas Sensor",
                  yaxis: {
                    type: "log",
                    tickvals: yAxisRange.tickvals,
                    ticktext: yAxisRange.ticktext,
                    tickfont: {
                      size: 10,
                    },
                    exponentformat: "e",
                  },
                }}
              />
              <div className="w-full flex justify-center mt-4 space-x-2">
                {Array.from({ length: 8 }, (_, i) => i).map((index) => (
                  <button
                    key={index}
                    onClick={() =>
                      onSetSensorIndex(index, selectedSession as Session)
                    }
                    className={`px-2 py-1 border border-gray-300 rounded ${
                      sensorIndex === index ? "bg-blue-500 text-white" : ""
                    }`}
                  >
                    Sensor {index}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MySessionsComponent;
