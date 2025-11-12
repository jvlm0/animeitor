export default function BalaoEstrela({
    color = "black",
    text = ""
}) {
    // Detecta se a cor é "clara" para escolher texto preto ou branco
    const isLightColor = () => {
        const hex = color.replace("#", "");

        // Converte hex curto (ex: #f0f)
        const normalized =
            hex.length === 3
                ? hex.split("").map(c => c + c).join("")
                : hex;

        const r = parseInt(normalized.substring(0, 2), 16);
        const g = parseInt(normalized.substring(2, 4), 16);
        const b = parseInt(normalized.substring(4, 6), 16);

        // luminância simples
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

        return luminance > 160; // threshold
    };

    let textColor = isLightColor() ? "#000" : "#fff";

    if (color === '#00fe01') {
        textColor = "#000"
    }

    return (
        <svg width="40" height="40" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg"><path fill={color} d="M256 38.013c-22.458 0-66.472 110.3-84.64 123.502-18.17 13.2-136.674 20.975-143.614 42.334-6.94 21.358 84.362 97.303 91.302 118.662 6.94 21.36-22.286 136.465-4.116 149.665 18.17 13.2 118.61-50.164 141.068-50.164 22.458 0 122.9 63.365 141.068 50.164 18.17-13.2-11.056-128.306-4.116-149.665 6.94-21.36 98.242-97.304 91.302-118.663-6.94-21.36-125.444-29.134-143.613-42.335-18.168-13.2-62.182-123.502-84.64-123.502z" />

            <text
                x="45%"
                y="60%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontSize="250"
                fontWeight="bold"
                fill={textColor}
                style={{ pointerEvents: "none" }}
            >
                {text}
            </text>

        </svg>
    );
}
