export default function Balao({
  color = "black",
  text = "",
  ...props
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

  if (color === '00fe01') {
    textColor = "#000"
  } 

  return (
    <svg
      width="32"
      height="40"
      viewBox="-30 -5 90 110"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      style={{ color }}
    >
      <path
        fill="currentColor"
        stroke="#000"
        strokeWidth={1}
        strokeLinecap="butt"
        strokeLinejoin="miter"
        d="M -28.845651,53.510854 C -32.583579,39.464674 -31.950156,6.0337222 -4.247161,-2.1820098 23.455833,-10.397742 41.931533,2.8094795 50.63309,16.965622 59.334647,31.121764 52.199151,55.855548 39.675906,68.178575 27.152661,80.501603 12.285609,85.293663 5.096366,86.406427 c 0,0 -1.51556,2.947914 -4.67131299,2.744084 0.93790099,7.426299 0.156328,4.35588 1.63451899,9.049259 -3.226266,0.4496 -2.76359699,0.18717 -6.216176,0.10343 -1.341009,5.22363 -4.521935,7.99311 -8.557152,7.35597 -4.035217,-0.63715 -5.154409,-3.03357 -6.129017,-5.56985 -0.974608,-2.53628 -0.772535,-6.385411 -4.121771,-6.978644 -3.349236,-0.593233 -4.272059,4.251024 -5.933944,3.717524 -0.974341,-0.38351 -2.019536,-1.32295 -0.668129,-2.943368 1.351407,-1.620414 4.271713,-4.156838 6.832717,-3.797423 2.561004,0.359415 3.971428,1.772053 5.270826,4.251903 1.299399,2.479848 0.851217,6.214238 3.795076,7.398218 2.94386,1.18399 6.021671,1.08482 6.204333,-3.85132 l -3.105621,-1.21564 c 0,0 4.846943,-6.200045 5.740105,-8.594245 -2.130167,-1.559693 -2.225166,-3.735396 -2.225166,-3.735396 0,0 -18.053376,-16.783895 -21.791304,-30.830075 z"
      />

      <text
        x="12%"
        y="40%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="50"
        fontWeight="bold"
        fill={textColor}
        style={{ pointerEvents: "none" }}
      >
        {text}
      </text>
    </svg>
  );
}
