import React, { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/saga-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Chip } from "primereact/chip";
import { Algorithm } from "./my-algorithms";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface AlgorithmResult {
  _id: { $oid: string };
  algorithmId: string;
  algorithm: Algorithm;
  trainingAlgorithm: string;
  accuracy: number;
  loss: number;
  totalPredictions: number;
  correctPredictions: number;
  batches: number;
  trainingRounds: number;
  mse: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

const AllResults = () => {
  const [results, setResults] = useState<AlgorithmResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AlgorithmResult>();
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/event-log")
      .then((res) => res.json())
      .then((data) => setResults(data));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="rounded-lg shadow-lg overflow-hidden w-3/4">
        <div style={{ maxHeight: "80vh", overflow: "auto" }}>
          <DataTable
            value={results}
            className="p-datatable-striped p-datatable-gridlines"
            selectionMode="single"
            onRowClick={(e) => {
              setSelectedResult(e.data as AlgorithmResult);
              setIsDialogVisible(true);
            }}
          >
            <Column
              field="trainingAlgorithm"
              header="Algorithm Name"
              body={(rowData) => (
                <Chip
                  label={
                    rowData.trainingAlgorithm.charAt(0).toUpperCase() +
                    rowData.trainingAlgorithm.slice(1)
                  }
                  className="bg-orange-500 text-white text-lg h-8 flex items-center justify-center"
                />
              )}
            />
            <Column
              field="accuracy"
              header="Accuracy"
              body={(rowData) => (
                <Chip
                  label={rowData?.accuracy?.toFixed(3)}
                  className="bg-purple-500 text-white text-lg"
                />
              )}
            />
            <Column
              field="loss"
              header="Loss"
              body={(rowData) => (
                <Chip
                  label={rowData?.loss?.toFixed(3)}
                  className="bg-red-500 text-white text-lg"
                />
              )}
            />
            <Column
              field="totalPredictions"
              header="Total Predictions"
              body={(rowData) => (
                <Chip
                  label={rowData?.totalPredictions?.toString()}
                  className="bg-blue-500 text-white text-lg"
                />
              )}
            />
            <Column
              field="correctPredictions"
              header="Correct Predictions"
              body={(rowData) => (
                <Chip
                  label={rowData?.correctPredictions?.toString()}
                  className="bg-green-500 text-white text-lg"
                />
              )}
            />
            <Column
              field="createdAt.$date"
              header="Created At"
              className="text-lg"
              body={(rowData) =>
                new Date(rowData.createdAt).toLocaleDateString()
              }
            ></Column>
            <Column
              field="mse"
              header="MSE"
              body={(rowData) =>
                rowData.mse ? (
                  <Chip
                    label={rowData.mse.toFixed(3)}
                    className="bg-yellow-500 text-white text-lg"
                  />
                ) : (
                  <Chip
                    label="N/A"
                    className="bg-gray-500 text-white text-lg"
                  />
                )
              }
            />
          </DataTable>
          <Dialog
            header="Algorithm Details"
            visible={isDialogVisible}
            onHide={() => setIsDialogVisible(false)}
            className="w-full max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-4"
            draggable={false}
          >
            {selectedResult && (
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-700">
                  {selectedResult.algorithm.name}
                </h3>
                {selectedResult.mse ? (
                  <p className="text-gray-500">
                    Mean Squared Error:{" "}
                    <span className="font-bold text-gray-700">
                      {selectedResult.mse.toFixed(3)}
                    </span>
                  </p>
                ) : (
                  <div className="flex items-center space-x-4">
                    <p className="text-gray-500">Accuracy:</p>
                    <div className="relative w-64 pt-1">
                      <div className="overflow-hidden h-6 text-xs flex rounded bg-red-200">
                        <div
                          style={{ width: `${selectedResult.accuracy * 100}%` }}
                          className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            selectedResult.accuracy >= 0.7
                              ? "bg-green-500"
                              : selectedResult.accuracy >= 0.5
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        >
                          <span className="font-bold text-gray-700">
                            {(selectedResult.accuracy * 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-gray-500">
                  Loss: {selectedResult?.loss?.toFixed(3)}
                </p>
                <p className="text-gray-500">
                  Total Predictions: {selectedResult?.totalPredictions}
                </p>
                <p className="text-gray-500">
                  Correct Predictions: {selectedResult?.correctPredictions}
                </p>
                <p className="text-gray-500">
                  Batches: {selectedResult.batches}
                </p>
                <p className="text-gray-500">
                  Training Rounds: {selectedResult?.trainingRounds}
                </p>
                <p className="text-gray-500">
                  Training Algorithm: {selectedResult?.trainingAlgorithm}
                </p>
                <p className="text-gray-500">
                  Created At:{" "}
                  {new Date(selectedResult.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-4 space-y-2">
                  {selectedResult.algorithm.classes.map((classItem, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: classItem.color }}
                      ></div>
                      <p className="text-gray-700">{classItem.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AllResults;
