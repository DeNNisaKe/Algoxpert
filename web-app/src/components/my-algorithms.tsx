import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionTab } from "primereact/accordion";
import { ProgressBar } from "primereact/progressbar";
import { Specimen } from "./my-sessions.component";
import io from "socket.io-client";
import AlgorithmSettingsModal from "./algorithm-settings-modal.component";

export interface Algorithm {
  _id: string;
  name: string;
  classes: Class[];
}

type SessionSpecimen = Specimen & {
  sessionName: string;
};

interface Class {
  name: string;
  specimens: SessionSpecimen[];
  color: string;
}

const MyAlgorithms: React.FC = () => {
  const navigate = useNavigate();
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [splitValue, setSplitValue] = useState<number>(70);
  const [progress, setProgress] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [mse, setMSE] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedAlgorithmName, setSelectedAlgorithmName] =
    useState<string>("ADAM Optimizer");
  const [selectedBatchSize, setSelectedBatchSize] = useState<number>(32);
  const [selectedTrainingRounds, setSelectedTrainingRounds] =
    useState<number>(2048);
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);

  const handleNewAlgorithm = () => {
    navigate("/new-algorithm");
  };

  const runAlgorithm = async (algorithmId: string) => {
    try {
      setProgress(0);
      // Add a delay before starting the algorithm to allow the progress bar to reset

      const response = await axios.post(
        `http://localhost:8080/algorithm/run/${algorithmId}`,
        {
          trainingDataValue: splitValue,
          validationDataValue: 100 - splitValue,
          algorithmName: selectedAlgorithmName,
          batchSize: selectedBatchSize,
          trainingRounds: selectedTrainingRounds,
        }
      );
      setAccuracy(response.data.accuracy * 100);
      setMSE(response.data.meanSquaredError);
    } catch (error) {
      console.error(error);
    }
  };

  const getAlgorithms = async () => {
    try {
      const response = await axios.get("http://localhost:8080/algorithm");
      setAlgorithms(response.data);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToResults = () => {
    navigate("/results");
  };

  const handleTabChange = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    setMSE(null);
  };

  useEffect(() => {
    // Establish a WebSocket connection
    const socket = io("http://localhost:8080");

    // Listen for the 'progress' event
    socket.on("progress", (data) => {
      // Calculate the new progress
      const newProgress = ((data.epoch / (data.totalEpochs - 1)) * 100).toFixed(
        2
      );

      // Interpolate the progress so that it updates smoothly
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress < parseFloat(newProgress)) {
            return oldProgress + 1;
          } else {
            clearInterval(interval);
            return oldProgress;
          }
        });
      }, 100); // Update every 100 milliseconds
    });

    // Disconnect when the component is unmounted
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    getAlgorithms();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : algorithms.length > 0 ? (
        <div className="p-6 mt-4 bg-white rounded shadow-md w-1/2">
          <div className="p-6 mt-4 bg-white rounded w-full relative">
            <h1 className="text-2xl font-bold mb-4">My Algorithms</h1>
            <button
              onClick={handleNewAlgorithm}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded absolute right-0 top-0 mr-4 mt-6"
            >
              + New Algorithm
            </button>
          </div>
          <Accordion
            activeIndex={activeIndex}
            onTabChange={(e) => handleTabChange(e.index as number)}
          >
            {algorithms.map((algorithm, index) => (
              <AccordionTab
                key={index}
                header={algorithm.name}
                className="mb-4 hover:bg-gray-100 transition-colors duration-300"
              >
                <h2 className="text-2xl font-bold mb-4">Classes</h2>
                {algorithm.classes.map((c, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-300 m-2 p-4 rounded-md bg-white shadow-sm"
                  >
                    <h2
                      className="text-xl font-bold mb-2 rounded-md text-white p-2"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name}
                    </h2>
                    <div className="flex flex-row">
                      {c.specimens.map((s, index) => (
                        <div className="flex flex-col items-center justify-center m-2">
                          <p className="text-sm text-gray-600 mb-1">
                            <strong>Specimen Name:</strong> {s.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-4">
                  <div className="flex justify-between mt-1">
                    <span>Training Data</span>
                    <span>Validation Data</span>
                  </div>
                  <input
                    type="range"
                    id="split-slider"
                    min={0}
                    max={100}
                    value={splitValue}
                    onChange={(e) => setSplitValue(Number(e.target.value))}
                    className="w-full mt-2"
                  />
                  <div className="flex justify-between mt-1">
                    <span>{splitValue}%</span>
                    <span>{100 - splitValue}%</span>
                  </div>
                </div>
                <div className="mt-4 italic text-gray-500 ml-2">
                  The default used algorithm is ADAM Optimizer, batch size 32
                  with 2048 training rounds. You can select a different one from
                  the dropdown below.
                </div>
                <button
                  onClick={() => runAlgorithm(algorithm._id)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                >
                  Run Algorithm
                </button>
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4"
                >
                  Select Different Settings
                </button>
                <AlgorithmSettingsModal
                  isSettingsModalOpen={isSettingsModalOpen}
                  setIsSettingsModalOpen={setIsSettingsModalOpen}
                  selectedAlgorithmName={selectedAlgorithmName}
                  setSelectedAlgorithmName={setSelectedAlgorithmName}
                  selectedBatchSize={selectedBatchSize}
                  setSelectedBatchSize={setSelectedBatchSize}
                  selectedTrainingRounds={selectedTrainingRounds}
                  setSelectedTrainingRounds={setSelectedTrainingRounds}
                  onSave={(algorithmName, batchSize, trainingRounds) => {
                    setSelectedAlgorithmName(algorithmName);
                    setSelectedBatchSize(batchSize);
                    setSelectedTrainingRounds(trainingRounds);
                  }}
                />
                {progress !== 0 && (
                  <ProgressBar value={progress} className="mt-4"></ProgressBar>
                )}
                {progress === 100 && (
                  <div
                    className="mt-4"
                    style={{ textAlign: "center", color: "#333" }}
                  >
                    <h2 style={{ fontSize: "1.5em", fontWeight: "normal" }}>
                      Results
                    </h2>
                    <p style={{ fontSize: "1.2em", fontWeight: "lighter" }}>
                      Accuracy:{" "}
                      <span style={{ fontWeight: "bold" }}>
                        {accuracy?.toFixed(2)}%
                      </span>
                    </p>
                  </div>
                )}
                {mse && (
                  <div className="mt-4">
                    <p className="text-gray-500">
                      Mean Squared Error:{" "}
                      <span className="font-bold text-gray-700">
                        {mse.toFixed(8)}
                      </span>
                    </p>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                        <div
                          style={{
                            width: `${Math.max(
                              0,
                              Math.min(100, (1 - mse) * 100)
                            )}%`,
                          }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            mse <= 0.1 ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {(progress === 100 || mse) && (
                  <div className="flex flex-col items-center space-y-4">
                    <button
                      onClick={navigateToResults}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                    >
                      See all results in order to compare them
                    </button>
                  </div>
                )}
              </AccordionTab>
            ))}
          </Accordion>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">
            You don't have any algorithms yet, try creating one!
          </h1>
          <button
            onClick={handleNewAlgorithm}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            + New Algorithm
          </button>
        </div>
      )}
    </div>
  );
};

export default MyAlgorithms;
