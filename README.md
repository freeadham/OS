# CPU Scheduling Simulator

A complete, self-contained, and interactive single-page web application to simulate and compare **Priority Scheduling (Preemptive)** and **Shortest Remaining Time First (SRTF)** CPU scheduling algorithms. 

This project provides a robust visual interface to understand how different workloads affect process Wait Time, Turnaround Time, and Response Time.

## Team Members
- [Student 1 Name]
- [Student 2 Name]
- [Student 3 Name]

## Requirements
No external dependencies, backend server, or installation required! 
- A modern web browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge).

## How to Run
1. Clone or download this repository.
2. Open the file `index.html` directly in your web browser.
3. Start adding processes manually using the "+ Add Process" button and run the simulation.

## Screenshots

*(Add screenshots of the Gantt charts and Results tables here by placing them in the `screenshots/` directory)*

## Algorithm Explanations

### Priority Scheduling (Preemptive)
At each time unit, the CPU scheduler selects the ready process with the lowest priority number (indicating the highest importance). If a new process arrives with a strictly higher priority (lower number) than the currently running process, the CPU will immediately preempt the current process and switch to the new one. 
- **Tie-Breaking:** If two processes have the same priority, the one that arrived earlier is selected. If they arrived at the same time, the one with the lower Process ID (PID) is chosen.

### Shortest Remaining Time First (SRTF)
SRTF is a preemptive scheduling algorithm that selects the process with the shortest amount of remaining burst time at each time unit. Whenever a new process arrives, its burst time is compared to the remaining burst time of the currently executing process. If it is shorter, the current process is preempted.
- **Tie-Breaking:** If two processes have the identical remaining burst time, the one that arrived earlier is selected. If they arrived at the same time, the one with the lower Process ID (PID) is chosen.

## Test Scenarios

The simulator logic handles various scenarios. You can load the test cases in the `test-cases/` directory by manually inputting them into the UI:

| Scenario | Description | Key Observations |
|----------|-------------|------------------|
| **Scenario A** | Basic Mixed Workload | Standard simulation behavior for typical CPU bound processes. |
| **Scenario B** | Priority vs Burst Conflict | Shows drastic differences between Priority and SRTF behavior. A high-priority job has a long burst, causing SRTF to ignore it while Priority Scheduling strictly favors it. |
| **Scenario C** | Starvation Risk | Demonstrates how a low priority or long burst job can face starvation and extended Wait Times under heavy loads. |
| **Scenario D** | Validation Case | Includes invalid inputs (negative arrival time, missing values) to test input sanitization and form validation features. |
