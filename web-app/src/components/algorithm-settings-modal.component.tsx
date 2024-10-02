// AlgorithmSettingsModal.tsx

import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";

interface AlgorithmSettingsModalProps {
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (isOpen: boolean) => void;
  selectedAlgorithmName: string;
  setSelectedAlgorithmName: (name: string) => void;
  selectedBatchSize: number;
  setSelectedBatchSize: (size: number) => void;
  selectedTrainingRounds: number;
  setSelectedTrainingRounds: (rounds: number) => void;
  onSave: (
    algorithmName: string,
    batchSize: number,
    trainingRounds: number
  ) => void;
}

const props = {
  onSave: (
    algorithmName: string,
    batchSize: number,
    trainingRounds: number
  ) => {},
};

const AlgorithmSettingsModal: React.FC<AlgorithmSettingsModalProps> = ({
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  selectedAlgorithmName,
  setSelectedAlgorithmName,
  selectedBatchSize,
  setSelectedBatchSize,
  selectedTrainingRounds,
  setSelectedTrainingRounds,
}) => {
  const algorithmOptions = [
    { label: "ADAM Optimizer", value: "ADAM Optimizer" },
    { label: "SGD Optimizer", value: "SGD Optimizer" },
    { label: "Random Forest", value: "Random Forest Classifier" },
  ];

  const batchSizeOptions = [
    { label: "8", value: 8 },
    { label: "16", value: 16 },
    { label: "32", value: 32 },
    { label: "64", value: 64 },
    { label: "128", value: 128 },
    { label: "256", value: 256 },
  ];

  const trainingRoundsOptions = [
    { label: "128", value: 128 },
    { label: "256", value: 256 },
    { label: "512", value: 512 },
    { label: "1024", value: 1024 },
    { label: "2048", value: 2048 },
    { label: "4096", value: 4096 },
  ];

  return (
    <Dialog
      visible={isSettingsModalOpen}
      onHide={() => setIsSettingsModalOpen(false)}
      className="w-1/2 h-1/2 rounded-lg"
      contentClassName="flex flex-col justify-center items-center text-center space-y-3"
    >
      <h2 className="text-2xl font-bold mb-4">Algorithm Settings</h2>
      <div className="w-2/3">
        <label className="font-semibold">Select an Algorithm</label>
        <Dropdown
          value={selectedAlgorithmName}
          options={algorithmOptions}
          onChange={(e) => setSelectedAlgorithmName(e.value)}
          className="w-full mt-2"
        />
      </div>
      {["ADAM Optimizer", "SGD Optimizer"].includes(selectedAlgorithmName) && (
        <>
          <div className="w-2/3">
            <label className="font-semibold">Batch Size</label>
            <Dropdown
              value={selectedBatchSize}
              options={batchSizeOptions}
              onChange={(e) => setSelectedBatchSize(e.value)}
              className="w-full mt-2"
            />
          </div>
          <div className="w-2/3">
            <label className="font-semibold">Training Rounds</label>
            <Dropdown
              value={selectedTrainingRounds}
              options={trainingRoundsOptions}
              onChange={(e) => setSelectedTrainingRounds(e.value)}
              className="w-full mt-2"
            />
          </div>
        </>
      )}
      <button
        onClick={() => {
          props.onSave(
            selectedAlgorithmName,
            selectedBatchSize,
            selectedTrainingRounds
          );
          setIsSettingsModalOpen(false);
        }}
        className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Save Settings
      </button>
    </Dialog>
  );
};

export default AlgorithmSettingsModal;
