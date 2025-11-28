export const getProblemColor = (problemLetter) => {
    const colors = {
        'A': '#FFFFFF',
        'B': '#000000',
        'C': '#FF0000',
        'D': '#800100',
        'E': '#018000',
        'F': '#0000fe',
        'G': '#BB8FCE',
        'H': '#010180',
        'I': '#fe01ff',
        'J': '#800181',
        'K': '#00fe01',
        'L': '#01feff',
        'M': '#c0c0c1',
        'N': '#FFA500' 
    };
    return colors[problemLetter] || '#808080';
};


export const getPositionColor = (pos, isGoingUp, isGoingDown) => {
    if (isGoingUp) return 'rgba(34, 197, 94, 0.8)';
    if (isGoingDown) return 'rgba(239, 68, 68, 0.8)';
    if (pos === 1) return 'rgb(255, 215, 0)';
    if (pos === 2) return 'rgb(192, 192, 192)';
    if (pos === 3) return 'rgb(205, 127, 50)';
    return 'rgb(107, 114, 128)';
};

export const getCellColor = (problemData) => {
    return 'bg-gray-800'; // Fundo neutro para todas as células
};

