 

const tbody = document.getElementById('process-tbody');
const addBtn = document.getElementById('add-btn');
const removeBtn = document.getElementById('remove-btn');
const runBtn = document.getElementById('run-btn');
const clearBtn = document.getElementById('clear-btn');
const validationError = document.getElementById('validation-error');
const resultsSection = document.getElementById('results-section');

function renumberRows() {
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, i) => {
        row.querySelector('td').textContent = `P${i + 1}`;
    });
}

function addProcessRow(arrival = '', burst = '', priority = '') {
    processCount++;
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>P${processCount}</td>
        <td><input type="number" class="arr-input" value="${arrival}" min="0" step="1" placeholder="e.g. 0"></td>
        <td><input type="number" class="burst-input" value="${burst}" min="1" step="1" placeholder="e.g. 5"></td>
        <td><input type="number" class="prio-input" value="${priority}" step="1" placeholder="e.g. 1"></td>
    `;
    tbody.appendChild(tr);
    renumberRows();
}

function removeLastProcess() {
    if (processCount > 0) {
        tbody.removeChild(tbody.lastChild);
        processCount--;
        renumberRows();
    }
}

function clearAll() {
    tbody.innerHTML = '';
    processCount = 0;
    validationError.style.display = 'none';
    resultsSection.style.display = 'none';
}

function validateInputs() {
    let isValid = true;
    let errors = [];
    const rows = tbody.querySelectorAll('tr');
    
    if (rows.length === 0) {
        errors.push("Please add at least one process.");
        isValid = false;
    }

    rows.forEach((row, index) => {
        const arrInput = row.querySelector('.arr-input');
        const burstInput = row.querySelector('.burst-input');
        const prioInput = row.querySelector('.prio-input');
        
        arrInput.classList.remove('invalid');
        burstInput.classList.remove('invalid');
        prioInput.classList.remove('invalid');

        const arr = arrInput.value;
        const burst = burstInput.value;
        const prio = prioInput.value;

        if (arr === '' || isNaN(arr) || !Number.isInteger(Number(arr)) || Number(arr) < 0) {
            arrInput.classList.add('invalid');
            isValid = false;
            if (!errors.includes("Arrival time must be an integer ≥ 0.")) errors.push("Arrival time must be an integer ≥ 0.");
        }
        if (burst === '' || isNaN(burst) || !Number.isInteger(Number(burst)) || Number(burst) < 1) {
            burstInput.classList.add('invalid');
            isValid = false;
            if (!errors.includes("Burst time must be an integer ≥ 1.")) errors.push("Burst time must be an integer ≥ 1.");
        }
        if (prio === '' || isNaN(prio) || !Number.isInteger(Number(prio))) {
            prioInput.classList.add('invalid');
            isValid = false;
            if (!errors.includes("Priority must be a valid integer.")) errors.push("Priority must be a valid integer.");
        }
    });

    if (!isValid) {
        validationError.innerHTML = errors.join('<br>');
        validationError.style.display = 'block';
        resultsSection.style.display = 'none';
    } else {
        validationError.style.display = 'none';
    }

    return isValid;
}

function getProcessesFromTable() {
    const processes = [];
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row, index) => {
        processes.push({
            pid: `P${index + 1}`,
            id: index + 1,
            arrival: parseInt(row.querySelector('.arr-input').value),
            burst: parseInt(row.querySelector('.burst-input').value),
            priority: parseInt(row.querySelector('.prio-input').value),
            color: processColors[index % processColors.length]
        });
    });
    return processes;
}

 
function renderGantt(gantt, totalTime, chartId, timesId, origProcesses) {
    const chartDiv = document.getElementById(chartId);
    const timesDiv = document.getElementById(timesId);
    chartDiv.innerHTML = '';
    timesDiv.innerHTML = '';

    const colorMap = { 'Idle': 'var(--idle-color)' };
    origProcesses.forEach(p => colorMap[p.pid] = p.color);

    const timeSet = new Set();
    timeSet.add(0);

    gantt.forEach(block => {
        const width = ((block.end - block.start) / totalTime) * 100;
        const blockDiv = document.createElement('div');
        blockDiv.className = 'gantt-block';
        blockDiv.style.width = `${width}%`;
        blockDiv.style.backgroundColor = colorMap[block.pid];
        blockDiv.innerText = block.pid === 'Idle' ? 'Idle' : block.pid;
        blockDiv.title = `${block.pid}: ${block.start} to ${block.end}`;
        chartDiv.appendChild(blockDiv);
        
        timeSet.add(block.end);
    });

    timeSet.forEach(t => {
        const marker = document.createElement('div');
        marker.className = 'gantt-time-marker';
        marker.style.left = `${(t / totalTime) * 100}%`;
        marker.innerText = t;
        timesDiv.appendChild(marker);
    });
}

function renderTable(procs, tableId, showPriority = true) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    const tfoot = document.querySelector(`#${tableId} tfoot`);
    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    procs.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span style="display:inline-block; width:12px; height:12px; background:${p.color}; border-radius:50%; margin-right:8px;"></span>${p.pid}</td>
            <td>${p.arrival}</td>
            <td>${p.burst}</td>
            ${showPriority ? `<td>${p.priority}</td>` : ''}
            <td>${p.startTime}</td>
            <td>${p.completionTime}</td>
            <td>${p.wt}</td>
            <td>${p.tat}</td>
            <td>${p.rt}</td>
        `;
        tbody.appendChild(tr);
    });

    const stats = calculateAverages(procs);
    const colSpan = showPriority ? 6 : 5;

    const footTr = document.createElement('tr');
    footTr.style.fontWeight = 'bold';
    footTr.style.backgroundColor = 'rgba(255,255,255,0.05)';
    footTr.innerHTML = `
        <td colspan="${colSpan}" style="text-align: right;">Averages:</td>
        <td>${stats.avgWT.toFixed(2)}</td>
        <td>${stats.avgTAT.toFixed(2)}</td>
        <td>${stats.avgRT.toFixed(2)}</td>
    `;
    tfoot.appendChild(footTr);

    return stats;
}

function renderComparison(prioStats, srtfStats, prioProcs, srtfProcs) {
    const container = document.getElementById('comparison-metrics');
    container.innerHTML = '';

    const metrics = [
        { label: 'Avg Waiting Time', p: prioStats.avgWT, s: srtfStats.avgWT, lowerIsBetter: true },
        { label: 'Avg Turnaround Time', p: prioStats.avgTAT, s: srtfStats.avgTAT, lowerIsBetter: true },
        { label: 'Avg Response Time', p: prioStats.avgRT, s: srtfStats.avgRT, lowerIsBetter: true }
    ];

    metrics.forEach(m => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        
        let pClass = '', sClass = '';
        if (m.p < m.s && m.lowerIsBetter) pClass = 'better';
        else if (m.s < m.p && m.lowerIsBetter) sClass = 'better';
        else if (m.p === m.s) { pClass = 'better'; sClass = 'better'; }

        row.innerHTML = `
            <div class="metric-label">${m.label}</div>
            <div class="metric-values">
                <div class="val-prio ${pClass}">${m.p.toFixed(2)}</div>
                <div class="val-srtf ${sClass}">${m.s.toFixed(2)}</div>
            </div>
        `;
        container.appendChild(row);
    });

    const prioStarvation = checkStarvation(prioProcs, 'Priority');
    const srtfStarvation = checkStarvation(srtfProcs, 'SRTF');
    
    let starvationText = "No significant starvation detected.";
    if (prioStarvation && !srtfStarvation) starvationText = "Priority scheduling shows risk of starvation for low priority processes.";
    if (!prioStarvation && srtfStarvation) starvationText = "SRTF shows risk of starvation for long burst processes.";
    if (prioStarvation && srtfStarvation) starvationText = "Both algorithms exhibit starvation risks depending on the workload characteristics.";

    document.getElementById('fairness-starvation').innerHTML = `
        <p><strong>Starvation Risk:</strong> ${starvationText}</p>
        <p><strong>Fairness:</strong> SRTF favors short jobs, while Priority Scheduling strictly adheres to priority values, potentially delaying urgent but low-priority processes.</p>
    `;

    generateAnalysis(prioStats, srtfStats, prioProcs, srtfProcs);
}

function runSimulations(processes) {
    const prioResult = simulatePreemptive(processes, prioritySelector);
    const srtfResult = simulatePreemptive(processes, srtfSelector);

    renderGantt(prioResult.gantt, prioResult.totalTime, 'gantt-prio', 'times-prio', processes);
    renderGantt(srtfResult.gantt, srtfResult.totalTime, 'gantt-srtf', 'times-srtf', processes);

    const prioStats = renderTable(prioResult.procs, 'results-table-prio', true);
    const srtfStats = renderTable(srtfResult.procs, 'results-table-srtf', false);

    renderComparison(prioStats, srtfStats, prioResult.procs, srtfResult.procs);
}

 
addBtn.addEventListener('click', () => addProcessRow());
removeBtn.addEventListener('click', removeLastProcess);
clearBtn.addEventListener('click', clearAll);

runBtn.addEventListener('click', () => {
    if (validateInputs()) {
        const processes = getProcessesFromTable();
        runSimulations(processes);
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});

 
addProcessRow();
