import { useEffect, useRef, useState } from 'react'
import './App.css'

const canvasWidth = 1000;
const canvasHeight = 630;

let a = 0;
let vCos = 0;
let vSin = 0;

let frame = 0;
let intervalMs = 1000;

let intervalHandle = 0;


function App() {
  const canvas = useRef(null);
  const getCtx = () => canvas.current ? (canvas.current as HTMLCanvasElement).getContext("2d") : null;

  const [ih, setIh] = useState(0);
    const [iv, setIv] = useState(90);
    const [ia, setIa] = useState(60);
    const ir = 10;
    const fr = 60;
    const [g, setG] = useState(9.8);

    // const [sp, setSp] = useState(true);
    // const [sh, setSh] = useState(false);
    // const [sv, setSv] = useState(false);
    // const [sc, setSc] = useState(true);
    // const [sa, setSa] = useState(true);
    // const [sg, setSg] = useState(true);

    const sp = true;
    const sh = false;
    const sv = false;
    const sc = true;
    const sa  = true;
    const sg = true;

    const [inputsDisabled, setInputsDisabled] = useState(false);
    const [_, setForceReRender] = useState(false);

    const removeInterval = () => {
        clearInterval(intervalHandle);
        intervalHandle = 0;
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        const t = tCoordinate(frame); // t in seconds

        const x = xCoordinate(t);
        const y = yCoordinate(t, ih, g);

        drawCircle(ctx, ir, x, y);
        sp && drawPath(ctx, ih, g);
        sh && drawHorizontal(ctx, y);
        sv && drawVertical(ctx, x);
        sc && drawCoordinates(ctx, x, y);
        sa && drawAxes(ctx);
        sg && drawGrid(ctx);
        //drawData(ctx, ih, g, iv)


        if (y >= yOffset && frame > 0) {
            frame = 0;
            removeInterval();
        }
    };

    const start = () => {
        if (intervalHandle) return;

        clearInterval(intervalHandle);
        intervalHandle = setInterval(() => {
            const ctx = getCtx();
            ctx && draw(ctx);
            frame++;
        }, Math.floor(1000 / fr));

        setInputsDisabled(true);
    };

    const pause = () => {
        intervalHandle ? removeInterval() : start();
        setForceReRender(p => !p);
    };

    const reset = () => {
        a = toRad(ia);
        vCos = iv * Math.cos(a);
        vSin = iv * Math.sin(a);
        intervalMs = Math.floor(1000 / fr);

        removeInterval();

        const ctx = getCtx();
        if (!ctx) return;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        sa && drawAxes(ctx);
        sg && drawGrid(ctx);
        //drawCircle(ctx, ir, xOffset, yOffset - ih);
        frame = 0;
        setInputsDisabled(false);
    };

    useEffect(() => { reset(); }, [ih, iv, ia, ir, fr, g, sp, sh, sv, sc, sa, sg]);


  return (
    <>
      <main className='flex flex-col items-center justify-center pt-4 h-screen w-full lg:flex lg:space-x-[30px]' data-theme='light' >
      <h2 className='text-3xl font-bold underlin'>Simulador de Movimiento Parabolico</h2>
      <section className='flex gap-4'>
      
            <canvas className='' ref={canvas} width={canvasWidth} height={canvasHeight} style={{ border: "1px solid #aaa" }}></canvas>
        
    

        <aside className='flex flex-col gap-4  bg-slate-300 p-4'>
        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">Altura (m)</span>
            </label>
            <input type="number" value={ih} onChange={e => setIh(parseFloat(e.target.value))} placeholder="Altura inicial" className="input input-bordered w-full max-w-xs" disabled={inputsDisabled} />
        </div>

        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">Aceleracion (m/s)</span>
            </label>
            <input type="number" value={iv} onChange={e => setIv(parseFloat(e.target.value))} placeholder="Aceleracion inicial" className="input input-bordered w-full max-w-xs" disabled={inputsDisabled} />
        </div>

        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">Angulo (θ)</span>
            </label>
            <input type="number" value={ia} onChange={e => setIa(parseFloat(e.target.value))} placeholder="Angulo" className="input input-bordered w-full max-w-xs" disabled={inputsDisabled} />
        </div>

        <div className="form-control w-full max-w-xs">
            <label className="label">
                <span className="label-text">Gravedad (m/s^2)</span>
            </label>
            <input type='number'  value={g} onChange={e => setG(parseFloat(e.target.value))} placeholder="Gravedad" className="input input-bordered w-full max-w-xs" disabled={inputsDisabled} />
        </div>

        <div className='flex gap-4'>
            <button className="btn btn-neutral" onClick={start} disabled={inputsDisabled}>Iniciar</button>
            <button className="btn btn-neutral w-[114px]" onClick={pause} disabled={!inputsDisabled}>
                {intervalHandle ? "Detener" : "Continuar"}
            </button>
            <button className="btn btn-neutral" onClick={reset} disabled={!inputsDisabled}>Reiniciar</button>
        </div>

        </aside>
      </section>
      </main>
    </>
  )
}

export default App

const toRad = (angle: number) => angle * (Math.PI / 180);
const xOffset = 30;
const yOffset = 600;
const textOffset = 20;

const drawAxes = (ctx: CanvasRenderingContext2D) => {
    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(canvasWidth - xOffset, yOffset);
    ctx.stroke();

    ctx.fillText("m", canvasWidth - xOffset + 5, yOffset + 2);
    for (let i = 0; i <= 900; i += 50) {
        ctx.fillText(i.toString(), xOffset + i - 5, yOffset + textOffset);
    }

    ctx.beginPath();
    ctx.moveTo(xOffset, yOffset);
    ctx.lineTo(xOffset, canvasHeight - yOffset);
    ctx.stroke();

    ctx.fillText("m", xOffset - 5, 20);
    for (let i = yOffset; i >= canvasHeight - yOffset; i -= 50) {
        ctx.fillText((yOffset - i).toString(), xOffset - textOffset, i + 2);
    }
};

const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#999";

    for (let i = 50; i <= 900; i += 50) {
        ctx.beginPath();
        ctx.moveTo(xOffset + i, yOffset);
        ctx.lineTo(xOffset + i, canvasHeight - yOffset);
        ctx.stroke();
    }

    for (let i = yOffset; i >= canvasHeight - yOffset; i -= 50) {
        ctx.beginPath();
        ctx.moveTo(xOffset, i);
        ctx.lineTo(canvasWidth - xOffset, i);
        ctx.stroke();
    }

    ctx.strokeStyle = "#000";
};

const drawCircle = (ctx: CanvasRenderingContext2D, radius: number, x: number, y: number) => {
    ctx.moveTo(x, y);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.stroke();
};

const drawPath = (ctx: CanvasRenderingContext2D, ih: number, g: number) => {
    ctx.strokeStyle = "#00f";

    let px = 0;
    let py = 0;

    for (let i = 0; i <= frame; i++) {
        const t = tCoordinate(i); // t in seconds

        const x = xCoordinate(t);
        const y = yCoordinate(t, ih, g);

        if (!px) px = x;
        if (!py) py = y;

       


        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();

        px = x;
        py = y;
    }

    ctx.strokeStyle = "#000";
};

const drawVertical = (ctx: CanvasRenderingContext2D, x: number) => {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
};

const drawHorizontal = (ctx: CanvasRenderingContext2D, y: number) => {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
};

const drawCoordinates = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillText("t: " + tCoordinate(frame).toFixed(3) + "s", x + 10, y - 50);
    ctx.fillText("x: " + (x - xOffset).toFixed(3) + "m", x + 10, y - 40);
    ctx.fillText("y: " + (yOffset - y).toFixed(3) + "m", x + 10, y - 30);
};

// const drawData = (ctx: CanvasRenderingContext2D,  g:number, v:number, ia:number) => {
//     // Guardar el estado actual del contexto
//     ctx.save();
//     //calcula el tiempo maximo
//     a = toRad(ia);
//     const tmax = (2*v*Math.sin(a))/g;

//     //calcula la altura maxima
//     const ymax = (Math.pow(v, 2) * Math.pow(Math.sin(a), 2)) / (2 * g);
  
    

//     //calcula la distancia maxima
//     const xmax = (v*v*Math.sin(2*a))/g;

//     // Establecer el estilo del texto
//     ctx.font = "20px Arial"; // Fuente y tamaño
//     ctx.fillStyle = "black"; // Color del texto
//     // Crear el texto con formato
//     const tiempoTexto = "Tiempo: " + tmax.toFixed(3) + "s";
//     // Calcular las coordenadas para la esquina superior derecha
//     const textWidth = ctx.measureText(tiempoTexto).width;
//     const x = canvasWidth - textWidth - 10; // 10 píxeles de margen
//     const y = 20; // 10 píxeles de margen desde la parte superior
//     // Dibujar el texto en el lienzo
//     ctx.fillText(tiempoTexto, x, y);
//     ctx.fillText("Altura: " + ymax.toFixed(3) + "m", x, y + 20);
//     ctx.fillText("Distancia: " + xmax.toFixed(3) + "m", x, y + 40);
    
   
// //    const altura = "Altura: " + yCoordinate(t, ih, g).toFixed(3) + 'm';

//     // Dibujar el texto en el lienzo
//     // ctx.fillText(altura, x, 60);

//     // Restaurar el estado previo del contexto
//     ctx.restore();
// }



const tCoordinate = (frame: number) => frame * intervalMs / 1000;
const xCoordinate = (t: number) => xOffset + vCos * t;
const yCoordinate = (t: number, ih: number, g: number) => yOffset - ih - (vSin * t - g * t * t / 2);
//calcula la altura maxima
//const ymax = (v:number, a:number, g:number) => (Math.pow(v, 2) * Math.pow(Math.sin(a), 2)) / (2 * g);