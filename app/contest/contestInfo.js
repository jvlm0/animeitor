if (!globalThis.contestInfo) {
    globalThis.contestInfo = {
        contestName: "Maratona PPCI 2025",
        startTime: "13:00:00",
        simulate: false,
        multiplo: 1
    };
}

export function getContestInfo() {
    return globalThis.contestInfo;
}

export function setContestInfo(contest) {

    if (contest?.startTime !== undefined) {
        globalThis.contestInfo.startTime = contest.startTime;
    }
    if (contest?.contestName !== undefined) {
        globalThis.contestInfo.contestName = contest.contestName;
    }
    if (contest?.simulate !== undefined) {
        globalThis.contestInfo.simulate = contest.simulate;
    }
    if (contest?.multiplo !== undefined) {
        globalThis.contestInfo.multiplo = contest.multiplo;
    }

    return 'Contest Atualizado';
}