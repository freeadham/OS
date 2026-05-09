 

 
function simulatePreemptive(processes, selectorFn) {
     
    const procs = processes.map(p => ({ 
        ...p, 
        remBurst: p.burst, 
        startTime: -1, 
        completionTime: 0,
        isFinished: false 
    }));
    
    let time = 0;
    let completed = 0;
    const n = procs.length;
    const gantt = [];
    let currentPid = null;
    let blockStart = 0;

    while (completed < n) {
         
        const readyQueue = procs.filter(p => p.arrival <= time && !p.isFinished);
        
        if (readyQueue.length === 0) {
            if (currentPid !== 'Idle') {
                if (currentPid !== null) {
                    gantt.push({ pid: currentPid, start: blockStart, end: time });
                }
                currentPid = 'Idle';
                blockStart = time;
            }
            time++;
            continue;
        }

         
        readyQueue.sort(selectorFn);
        const selected = readyQueue[0];

        if (currentPid !== selected.pid) {
            if (currentPid !== null) {
                gantt.push({ pid: currentPid, start: blockStart, end: time });
            }
            currentPid = selected.pid;
            blockStart = time;
        }

        if (selected.startTime === -1) {
            selected.startTime = time;
        }

         
        selected.remBurst--;
        time++;

        if (selected.remBurst === 0) {
            selected.isFinished = true;
            selected.completionTime = time;
            completed++;
        }
    }
    
     
    if (currentPid !== null) {
        gantt.push({ pid: currentPid, start: blockStart, end: time });
    }

     
    procs.forEach(p => {
        p.tat = p.completionTime - p.arrival;
        p.wt = p.tat - p.burst;
        p.rt = p.startTime - p.arrival;
    });

    return { procs, gantt, totalTime: time };
}

 
const prioritySelector = (a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;  
    if (a.arrival !== b.arrival) return a.arrival - b.arrival;      
    return a.id - b.id;                                             
};

const srtfSelector = (a, b) => {
    if (a.remBurst !== b.remBurst) return a.remBurst - b.remBurst;  
    if (a.arrival !== b.arrival) return a.arrival - b.arrival;      
    return a.id - b.id;                                             
};
