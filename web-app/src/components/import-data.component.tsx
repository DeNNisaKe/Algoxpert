import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import { useNavigate } from "react-router-dom";

const importImage = require("../images/import.png");

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

const ImportDataComponent = () => {
  interface ChartData {
    x: string[];
    y: number[];
    type: "scatter";
    mode: "lines" | "markers" | "lines+markers";
    line: { width: number; color: string };
  }

  interface Specimen {
    name?: string;
    labelTag: string;
    startTime: string;
    endTime: string;
    specificData: any[];
  }

  interface ReceivedData {
    data: number[][];
  }

  const [chartData, setChartData] = useState<ChartData[] | undefined>(
    undefined
  );
  const [sensorIndex, setSensorIndex] = useState(0);
  const [noSpecimens, setNoSpecimens] = useState(0);
  const [selectedSpecimen, setSelectedSpecimen] = useState<Specimen | null>(
    null
  );
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  let myShapes: Partial<Plotly.Shape>[] = [];
  if (selectedSpecimen) {
    myShapes = [
      {
        type: "rect",
        xref: "x",
        yref: "paper",
        x0: selectedSpecimen.startTime,
        y0: 0,
        x1: selectedSpecimen.endTime,
        y1: 1,
        fillcolor: "#d3d3d3",
        opacity: 0.2,
        line: {
          width: 1,
        },
      },
    ];
  }

  const [yAxisRange, setYAxisRange] = useState<{
    tickvals: number[];
    ticktext: string[];
  }>({ tickvals: [], ticktext: [] });

  const [receivedData, setReceivedData] = useState<ReceivedData | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (receivedData) {
      const chartData = [];
      let resistanceValues: number[] = [];
      let currentSpecimen = null as Specimen | null;
      let tempSpecimens: Specimen[] = [];

      const maxStepIndex = Math.max(
        ...receivedData.data.map((item: any) => item[8])
      );

      for (let i = 1; i <= maxStepIndex; i++) {
        const data = receivedData.data
          .filter((item: any) => item[0] === sensorIndex && item[8] === i)
          .map((item: any) => ({
            realTimeClock: item[3],
            resistanceGasSensor: item[7],
            labelTag: item[10],
          }));

        resistanceValues = resistanceValues.concat(
          data.map((item: any) => item.resistanceGasSensor)
        );

        let specimensMap = new Map<string, Specimen>();

        data.forEach((item: any) => {
          if (
            currentSpecimen === null ||
            item.labelTag !== currentSpecimen.labelTag
          ) {
            if (currentSpecimen !== null) {
              specimensMap.set(JSON.stringify(currentSpecimen), {
                ...currentSpecimen,
              });
            }
            currentSpecimen = {
              labelTag: item.labelTag,
              startTime: convertTimestampToDate(item.realTimeClock),
              endTime: "",
              specificData: [],
            };
          }
          currentSpecimen.endTime = convertTimestampToDate(item.realTimeClock);
        });

        // Check if currentSpecimen is not null after processing all items in data
        if (currentSpecimen !== null) {
          specimensMap.set(JSON.stringify(currentSpecimen), {
            ...currentSpecimen,
          });
        }

        const threshold = 1000; // 1 sec

        const sortedSpecimens = Array.from(specimensMap.values())
          .sort((a, b) => {
            if (a.startTime !== b.startTime) {
              return a.startTime.localeCompare(b.startTime);
            } else {
              return a.endTime.localeCompare(b.endTime);
            }
          })
          .filter((specimen, index, self) => {
            const previousSpecimen = self[index - 1];
            if (previousSpecimen) {
              const startTimeDifference = Math.abs(
                new Date(specimen.startTime).getTime() -
                  new Date(previousSpecimen.startTime).getTime()
              );
              const endTimeDifference = Math.abs(
                new Date(specimen.endTime).getTime() -
                  new Date(previousSpecimen.endTime).getTime()
              );
              return (
                startTimeDifference > threshold && endTimeDifference > threshold
              );
            }
            return true;
          });
        tempSpecimens = sortedSpecimens;

        tempSpecimens.forEach((specimen) => {
          // on each specimen, take the start and end time and find the data that falls within that range. The data from data is realTimeClock and the start and end time is type Date
          const startTime = specimen.startTime;
          const endTime = specimen.endTime;

          const filteredData = data.filter((item: any) => {
            const timestamp = convertTimestampToDate(item.realTimeClock);
            return (
              new Date(timestamp).getTime() >= new Date(startTime).getTime() &&
              new Date(timestamp).getTime() <= new Date(endTime).getTime()
            );
          });

          specimen.specificData = filteredData;
        });

        chartData.push({
          x: data.map((item: any) =>
            convertTimestampToDate(item.realTimeClock)
          ),
          y: data.map((item: any) => item.resistanceGasSensor),
          type: "scatter",
          mode: "lines",
          line: { width: 1 },
        } as ChartData);
      }

      const { tickvals, ticktext } = generateLogScaleTicks(resistanceValues);

      setChartData(chartData);
      setYAxisRange({ tickvals, ticktext });
      setSpecimens(tempSpecimens);
      setNoSpecimens(tempSpecimens.length);
    }
  }, [receivedData, sensorIndex]);

  const handleSave = async () => {
    setIsLoading(true);
    // set specimen name from inputs to specimens
    specimens.forEach((specimen, index) => {
      const input = document.querySelector(
        `input[placeholder="Specimen ${index + 1} name"]`
      ) as HTMLInputElement;
      specimen.name = input.value;
    });

    const dataToSave = {
      sessionName,
      specimens,
      data: receivedData?.data,
    };

    await axios.post("http://localhost:8080/data/save", dataToSave, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    setChartData(undefined);
    setIsLoading(false);
    navigate("/sessions");
  };

  const handleFileChange = (event: any) => {
    setIsFileSelected(event.target.files.length > 0);
  };

  const handleImportData = async () => {
    if (fileInput.current && fileInput.current.files) {
      const file = fileInput.current.files[0];
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:8080/data",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setReceivedData(response.data);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-extrabold mb-8 mt-8 animate-bounce bg-blue-200 text-black p-4 rounded-lg border-4 border-black">
        Import Data
      </h1>
      <img src={importImage} alt="Import" className="w-48 h-48 mb-8" />
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="file"
          >
            Select File
          </label>
          <input
            type="file"
            id="file"
            ref={fileInput}
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            onClick={handleImportData}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={!isFileSelected}
          >
            Import Data
          </button>
        </div>
      </div>
      {chartData && (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Chart</h2>
          <div className="mb-4">
            <Plot
              data={chartData}
              layout={{
                width: 800,
                height: 600,
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
                shapes: myShapes,
              }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-4">Sessions</h2>
          <div className="mb-4 space-y-4">
            <div>
              <h1 className="text-xl font-bold mb-2">Session name</h1>
              <input
                type="text"
                placeholder="Enter the session name"
                className="px-2 py-1 border border-gray-300 rounded w-full"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Specimens</h1>
              {Array.from({ length: noSpecimens }, (_, i) => i).map((index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Specimen ${index + 1} name`}
                  className="px-2 py-1 border border-gray-300 rounded w-full mt-3"
                  onClick={() => setSelectedSpecimen(specimens[index])}
                />
              ))}
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Save Session
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-4">Sensors</h2>
          <div className="mb-4 flex space-x-2">
            {Array.from({ length: 8 }, (_, i) => i).map((index) => (
              <button
                key={index}
                onClick={() => setSensorIndex(index)}
                className={`px-2 py-1 border border-gray-300 rounded w-full ${
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
  );
};

export default ImportDataComponent;
