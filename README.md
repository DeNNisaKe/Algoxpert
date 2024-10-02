# Algoxpert – Intelligent System for Identification of Odors

## Project Overview

**Algoxpert** is an intelligent system developed for the identification and classification of different types of coffee based on their unique chemical signatures. It uses gas sensors to detect volatile organic compounds (VOCs) and sulfuric organic compounds (SOCs) from coffee beans, employing machine learning algorithms for accurate classification.

The system is designed to help in quality control and product authentication within the coffee industry. Additionally, a web application provides users with the ability to interact with the system, upload data, and visualize results.

## Objectives

The primary objective of Algoxpert is to accurately differentiate between various coffee types using machine learning models. The data is collected from Bosch’s BME688 gas sensors and processed through a pipeline that includes data acquisition, model training, and evaluation.

### Specific Objectives:
- Collect sensor data from coffee bean samples using the BME688 sensor.
- Design and train a machine learning model to classify different coffee types.
- Deploy the model for real-time use in quality control scenarios.

## System Architecture

### Hardware
- **Sensors:** BME688 gas sensors are used to collect data on coffee aromas.
- **Controller:** Adafruit Huzzah32 microcontroller, connected to 8 BME688 sensors, is responsible for data acquisition.
- **Data Storage:** Sensor data is stored in JSON format and saved on an SD card.

### Software
- **Frontend:** Built using ReactJS and TypeScript, providing an interactive user interface for uploading data and visualizing results.
- **Backend:** Powered by NestJS and TypeScript, managing data processing and machine learning model training.
- **Database:** MongoDB is used for storing sensor data and model information.
- **Machine Learning:** TensorFlowJS is used to build and train the classification models.

## Features
- **Data Upload:** Users can upload sensor data collected from coffee samples and visualize the results on the web application.
- **Model Training:** The system provides options for training machine learning models, including algorithms such as Adam Optimizer and Random Forest.
- **Real-Time Analysis:** Users can run trained models on new data for real-time classification of coffee types.
- **Performance Metrics:** The application displays important metrics such as accuracy and mean squared error (MSE) for model evaluation.

## Dependencies

- **ReactJS**: A JavaScript library for building user interfaces.
- **NestJS**: A framework for building efficient, reliable, and scalable server-side applications.
- **MongoDB**: NoSQL database for storing sensor data.
- **TensorFlowJS**: Library for running machine learning models in JavaScript.
- **Adafruit Huzzah32**: Microcontroller used for data acquisition.
- **BME688**: Gas sensor for detecting volatile organic compounds.

## Getting Started

### Prerequisites
- Node.js and npm installed.
- MongoDB setup.
- TensorFlowJS and relevant machine learning libraries installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/algoxpert.git
2. Install dependencies:
   ```bash
   cd algoxpert
   npm install
3. Setup MongoDB and update the connection string in the .env file.
4. Run the application:
   ```bash
   npm start

## Future Work
- Expand the system to classify more types of odors beyond coffee.
- Improve the machine learning models for higher accuracy.
- Add support for real-time sensor data streaming.

License
This project is licensed under the MIT License. See the LICENSE file for details.

markdown
Copy code

### Explanation of Key Sections:

- **Project Overview**: Introduces the project, its goals, and application in the coffee industry.
- **Objectives**: Clearly outlines the main goals of the system, including specific steps for achieving these objectives.
- **System Architecture**: Provides details about the hardware (sensors, controllers) and software (frontend, backend, database, and machine learning tools).
- **Features**: Describes the system's key functionalities such as data upload, model training, real-time analysis, and performance metrics.
- **Dependencies**: Lists important tools and libraries, with links to their official documentation.
- **Getting Started**: Provides installation steps, including cloning the repository, installing dependencies, and running the application.
- **Future Work**: Suggestions for further development of the system.
- **License**: Information about the project's license, pointing to the LICENSE file.
