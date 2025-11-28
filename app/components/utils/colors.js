export const getProblemColor = (problemLetter) => {
    const colors = {
        'A': '#FFFFFF',
        'B': '#000000',
        'C': '#FF0000',
        'D': '#800000',
        'E': '#FFFF00',
        'F': '#008000',
        'G': '#0000FF',
        'H': '#000080',
        'I': '#FF00FF',
        'J': '#800080',
        'K': '#00FF00',
        'L': '#00FFFF',
        'M': '#C0C0C0',
        'N': '#FF8000' 
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

