export const getProblemColor = (problemLetter) => {
    const colors = {
        'A': '#FFFFFF', // Vermelho
        'B': '#000000', // Turquesa
        'C': '#FF0000', // Azul claro
        'D': '#800100', // Salmão
        'E': '#018000', // Verde água
        'F': '#0000fe', // Amarelo
        'G': '#BB8FCE', // Roxo claro
        'H': '#010180', // Azul céu
        'I': '#fe01ff', // Laranja
        'J': '#800181', // Verde
        'K': '#00fe01', // Terracota
        'L': '#01feff', // Verde azulado
        'M': '#c0c0c1', // Dourado
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

