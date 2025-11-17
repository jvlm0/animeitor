const isProblemCorrect = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time !== null;
};

const isProblemWrong = (problemData) => {
    return problemData && problemData.tries !== null && problemData.time === null;
};

export const formatProblemDisplay = (problemData) => {
    if (!problemData) return '';

    // Se o problema está correto
    if (isProblemCorrect(problemData)) {
        const triesDisplay = problemData.tries > 1 ? `+${problemData.tries - 1}` : '';
        return { type: 'correct', tries: triesDisplay, time: problemData.time };
    }

    // Se o problema está errado
    if (isProblemWrong(problemData)) {
        return { type: 'wrong', tries: problemData.tries };
    }

    return { type: 'empty' };
};