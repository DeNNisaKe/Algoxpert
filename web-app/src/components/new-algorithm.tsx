import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Specimen } from "./my-sessions.component";
import {
  ColorResult,
  GithubPicker,
  SketchPicker,
  SliderPicker,
  SwatchesPicker,
} from "react-color";
import {
  ColorPicker,
  ColorPickerHSBType,
  ColorPickerRGBType,
} from "primereact/colorpicker";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Slider } from "primereact/slider";

type SessionSpecimen = Specimen & {
  sessionName: string;
};

interface Class {
  name: string;
  selectedSpecimens: SessionSpecimen[];
  color: string;
}

const NewAlgorithm: React.FC = () => {
  const [algorithmName, setAlgorithmName] = useState("");
  const [classes, setClasses] = useState<Class[]>([
    { name: "", selectedSpecimens: [], color: "#fff" },
  ]);
  const [sessions, setSessions] = useState<any[]>([]);

  const [specimens, setSpecimens] = useState<SessionSpecimen[]>([]);

  const handleClassNameChange = (index: number, value: string) => {
    const newClasses = [...classes];
    newClasses[index].name = value;
    setClasses(newClasses);
  };

  const handleSpecimenChange = (index: number, value: SessionSpecimen[]) => {
    const newClasses = [...classes];
    newClasses[index].selectedSpecimens = value;
    setClasses(newClasses);
  };

  const navigate = useNavigate();

  const handleColorChange = (
    index: number,
    value: string | ColorResult | null
  ) => {
    let color = "";

    if (typeof value === "string") {
      color = value;
    } else if (value && "rgb" in value) {
      const { r, g, b } = value.rgb;
      color = `rgb(${r}, ${g}, ${b})`;
    } else if (value && "hsl" in value) {
      const { h, s, l } = value as ColorResult["hsl"];
      color = `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
    }

    const newClasses = [...classes];
    newClasses[index].color = color;
    setClasses(newClasses);
  };

  const handleCreateAlgorithm = async () => {
    const body = {
      name: algorithmName,
      classes: classes.map((c) => ({
        name: c.name,
        color: c.color,
        specimens: c.selectedSpecimens,
      })),
    };

    await axios.post("http://localhost:8080/algorithm", body, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    navigate("/algorithms");
  };

  const handleAddClass = () => {
    setClasses([...classes, { name: "", selectedSpecimens: [], color: "" }]);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/data")
      .then((response) => {
        setSessions(response.data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  useEffect(() => {
    if (sessions) {
      const allSpecimens: SessionSpecimen[] = sessions.flatMap((session) =>
        session.specimens.map((specimen: Specimen) => ({
          ...specimen,
          sessionName: session.sessionName,
        }))
      );
      setSpecimens(allSpecimens);
    }
  }, [sessions]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg rounded p-8 w-1/2">
        <h1 className="text-2xl mb-6">New Algorithm</h1>
        <div className="mb-4">
          <label
            htmlFor="algorithmName"
            className="block text-sm font-medium text-gray-600"
          >
            Algorithm Name
          </label>
          <InputText
            id="algorithmName"
            value={algorithmName}
            onChange={(e) => setAlgorithmName(e.target.value)}
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        {classes.map((classItem, index) => (
          <div key={index} className="mb-4 border p-2 rounded">
            <label
              htmlFor={`className${index}`}
              className="block text-sm font-medium text-gray-600"
            >
              Class Name
            </label>
            <div className="flex justify-between items-center">
              <InputText
                id={`className${index}`}
                value={classItem.name}
                onChange={(e) => handleClassNameChange(index, e.target.value)}
                className="p-2 border rounded-md flex-grow mr-2"
                placeholder="Class Name"
              />
              <div className="w-48 flex flex-col">
                <div
                  className="h-12 border rounded-md mb-2"
                  style={{ backgroundColor: classItem.color }}
                />
                <div className="h-12">
                  <SliderPicker
                    color={classItem.color}
                    onChange={(e) => handleColorChange(index, e)}
                  />
                </div>
              </div>
            </div>
            <label
              htmlFor={`specimenDropdown${index}`}
              className="block text-sm font-medium text-gray-600 mt-2"
            >
              Select Specimens
            </label>
            <MultiSelect
              id={`specimenDropdown${index}`}
              value={classItem.selectedSpecimens}
              options={specimens.map((s) => ({
                label: `${s.name} - Session: ${s.sessionName}`,
                value: s,
              }))}
              onChange={(e) => handleSpecimenChange(index, e.value)}
              placeholder="Select Specimens"
              optionLabel="label"
              className="w-full border rounded-md"
              itemTemplate={(option) => (
                <div
                  style={{
                    fontWeight: classItem.selectedSpecimens.includes(
                      option.value
                    )
                      ? "bold"
                      : "normal",
                  }}
                >
                  <b>{option.value.name}</b>
                  <i> (Session: {option.value.sessionName})</i>
                </div>
              )}
            />
          </div>
        ))}
        <Button
          label="Add Class"
          onClick={handleAddClass}
          className="bg-green-500 text-white rounded-full px-4 py-2 mt-4 mr-4 hover:bg-green-700 transition-colors duration-300"
        />
        <Button
          label="Create Algorithm"
          className="bg-blue-500 text-white rounded-full px-4 py-2 mt-4 hover:bg-blue-700 transition-colors duration-300"
          onClick={handleCreateAlgorithm}
        />
      </div>
    </div>
  );
};

export default NewAlgorithm;
