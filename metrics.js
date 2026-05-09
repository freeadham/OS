 

function calculateAverages(procs) {
    let sumWT = 0, sumTAT = 0, sumRT = 0;
    procs.forEach(p => {
        sumWT += p.wt;
        sumTAT += p.tat;
        sumRT += p.rt;
    });
    const n = procs.length;
    return {
        avgWT: n > 0 ? sumWT / n : 0,
        avgTAT: n > 0 ? sumTAT / n : 0,
        avgRT: n > 0 ? sumRT / n : 0
    };
}

function checkStarvation(procs, type) {
     
    let sumWT = 0;
    procs.forEach(p => sumWT += p.wt);
    const avgWT = sumWT / procs.length;
    
    return procs.some(p => p.wt > p.burst * 3 && p.wt > avgWT * 2);
}

function generateAnalysis(prioStats, srtfStats, prioProcs, srtfProcs) {
    const container = document.getElementById('analysis-text');
    const conclusion = document.getElementById('final-conclusion');
    container.innerHTML = '';

    const q1 = "Which algorithm produced the lower average waiting time?";
    const a1 = srtfStats.avgWT < prioStats.avgWT ? "SRTF produced a lower average waiting time. This is mathematically expected as SRTF is optimal for minimizing waiting time." : (prioStats.avgWT < srtfStats.avgWT ? "Priority Scheduling produced a lower average waiting time for this specific workload, likely because high priority jobs happened to be short." : "Both algorithms produced the same average waiting time.");

    const q2 = "Which algorithm produced the lower average response time?";
    const a2 = srtfStats.avgRT < prioStats.avgRT ? "SRTF produced the lower average response time." : (prioStats.avgRT < srtfStats.avgRT ? "Priority Scheduling produced the lower average response time." : "Both algorithms produced the same average response time.");

    const q3 = "Did priority values improve treatment of urgent processes?";
     
    const highPrioProc = [...prioProcs].sort((a,b) => a.priority - b.priority)[0];
    let a3 = "N/A";
    if (highPrioProc) {
        const pRT = highPrioProc.rt;
        const srtfEquivalent = srtfProcs.find(p => p.pid === highPrioProc.pid);
        const sRT = srtfEquivalent ? srtfEquivalent.rt : 0;
        a3 = pRT <= sRT ? "Yes, Priority Scheduling explicitly pushed urgent processes (lower priority number) to the front, executing them sooner than SRTF." : "In this case, SRTF actually responded to the highest priority process just as fast or faster because it happened to have a short burst time.";
    }

    const q4 = "Did SRTF favor short jobs more aggressively?";
     
    const shortJob = [...srtfProcs].sort((a,b) => a.burst - b.burst)[0];
    let a4 = "N/A";
    if (shortJob) {
        const pRT_short = prioProcs.find(p => p.pid === shortJob.pid).rt;
        const sRT_short = shortJob.rt;
        a4 = sRT_short <= pRT_short ? "Yes, SRTF aggressively favored short jobs, often preempting longer ones to clear short bursts quickly." : "Not necessarily in this workload, as priority scheduling happened to align with short bursts.";
    }

    const qs = [
        {q: q1, a: a1}, {q: q2, a: a2}, {q: q3, a: a3}, {q: q4, a: a4}
    ];

    qs.forEach(item => {
        container.innerHTML += `
            <div class="analysis-question">${item.q}</div>
            <div class="analysis-answer">${item.a}</div>
        `;
    });

    let recommend = '';
    if (srtfStats.avgWT < prioStats.avgWT) {
        recommend = "Overall, <strong>SRTF performed better</strong> across throughput and waiting metrics, as it is provably optimal for minimizing average waiting time. Priority scheduling effectively honored system urgency but sacrificed overall efficiency. The main trade-off observed is system throughput vs strict importance. If this workload represents a general-purpose system, SRTF is recommended. If it is a real-time system with strict urgencies, Priority Scheduling is necessary.";
    } else if (prioStats.avgWT < srtfStats.avgWT) {
        recommend = "Overall, <strong>Priority Scheduling performed better</strong> (or on par) while guaranteeing urgent tasks were handled first. SRTF struggled or provided no benefit because process priorities naturally favored shorter jobs. The trade-off here is minimal. Priority Scheduling is recommended for this workload.";
    } else {
        recommend = "Both algorithms performed similarly for this workload. SRTF is generally recommended for overall efficiency, while Priority is recommended if tasks have strict business-level urgencies. The fairer algorithm depends on whether 'fair' means 'short jobs don't wait for long ones' (SRTF) or 'important jobs run first' (Priority).";
    }

    conclusion.innerHTML = recommend;
}
