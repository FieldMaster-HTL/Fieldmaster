# Fieldmaster

The **Fieldmaster** application is a modular tool for managing agricultural or land-based projects. It provides structured management of areas, tasks, and tools, enabling transparent planning and documentation of work processes.

---

## Features

- **Area Management**: Create and manage areas (e.g., fields, parcels) with names and sizes in square meters.
- **Task Management**: Add and manage tasks, each with a creation date and an end date. Tasks can be linked to specific areas and tools.
- **Tool Management**: Manage tools and machines with names and descriptions. Tools can be assigned to tasks.
- **Workflow Transparency**: View all tasks per area and track which tools are used for each task.

---

## Project Structure

The project is divided into the following modules:

1. **AreaManagement**: Handles creation and management of areas with their respective sizes.
2. **TaskManagement**: Manages tasks, including creation and end dates, and links them to areas and tools.
3. **ToolManagement**: Stores and organizes tools/machines with names and descriptions.
4. **Database/Storage**: Persists all data (depending on your implementation, e.g., JSON or database).
5. **UI/Interaction Layer**: Provides the interface for user interaction and workflow navigation.
6. **Tests**: Contains unit tests to ensure reliability and data integrity.

---

## How to Run

Follow these steps to set up and run the Fieldmaster application locally.

### Prerequisites

Ensure the following are installed:

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Git

### Steps to Run

1. **Clone the Repository**

   ```bash
   git clone <your-repository-url>
   cd Fieldmaster
   ```

2. **Run the Application**

   ```bash
   npm run dev
   ```

   This will start the development server. Open your browser and navigate to `http://localhost:3000` to access the application.

3. **Run Tests**
   ```bash
   npm test
   ```

---

## Usage

When you run the application, you will be presented with a main menu where you can choose to manage areas, tasks, or tools. Follow the prompts to add new entries or view existing ones.

- **Add Area**: Input the name and size of the area.
- **Add Task**: Input the task details, including creation (will be set automatically) and end dates, and link it to an area and tool.
- **Add Tool**: Input the tool name and description.
- **View Tasks and Areas**: The general dashboard will display all taks and areas for easy tracking.

---

## Login

The application includes a simple login system to ensure that only authorized users can access the management features.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

1. Fork the repository.
2. Create a new branch
3. Make your changes and commit them.
4. Push to your branch and create a pull request.

---

## License

This project is licensed under the MIT License

---

## Contact

For any questions or feedback, please contact:

- **Name:** Konrad Samuel
  **Email:** samuel.konrad@sr.htlweiz.at
  **GitHub:** https://github.com/Samuelk0nrad

---

- **Name:** Kulmer Klara
  **Email:** klara.kulmer@sr.htlweiz.at
  **GitHub:** https://github.com/KulmerKlara

---

- **Name:** Lorenzer Bernd
  **Email:** bernd.lorenzer@sr.htlweiz.at
  **GitHub:** https://github.com/bernlore

---

- **Name:** Mauerhofer Magdalena
  **Email:** magdalena.mauerhofer@sr.htlweiz.com
  **GitHub:** https://github.com/mauerhofer4

---

- **Name:** Opriessnig Simon
  **Email:** simon.opriessnig@sr.htlweiz.com
  **GitHub:** https://github.com/s1monator

---

- **Name:** Pachler Tobias
  **Email:** tobias.pachler@sr.htlweiz.com
  **GitHub:** https://github.com/tobipac

---

- **Name:** Polt Leonie
  **Email:** leonie.polt@sr.htlweiz.com
  **GitHub:** https://github.com/leoniepolt

---

- **Name:** Posch Leonardo
  **Email:** leonardo.posch@sr.htlweiz.com
  **GitHub:** https://github.com/Poschi17

---

## GitHub Codespaces

This project is configured to work with GitHub Codespaces. You can create a new codespace directly from the repository page on GitHub by clicking the "Code" button and selecting "Open with Codespaces". This will set up a development environment in the cloud, allowing you to work on the project without needing to set up anything locally.
[FieldMaster-HTL/Fieldmaster](https://github.com/FieldMaster-HTL/Fieldmaster)
